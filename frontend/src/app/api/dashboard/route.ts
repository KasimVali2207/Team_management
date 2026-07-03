import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { StorageService } from '@/services/storage.service';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.role !== 'Lead') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const employees = await StorageService.getAllEmployees();
    const members = employees.filter(e => e.profile?.role === 'Member');

    const totalMembers = members.length;
    let peopleOnLeave = 0;
    let peopleOnCall = 0;
    let pendingTrainings = 0;
    let completedTrainings = 0;
    let totalBlockLeaves = 0;
    let totalDemoSessions = 0;
    let profileCompletionSum = 0;

    const memberSummaries: any[] = [];

    members.forEach(emp => {
      const profileFields = ['name','domain','doj','yearsOfExperience','functions','tribe','squadName','scrumMaster','chapterLead','copReferent','teamPocOnshore','assignmentGroupManager','hvd','assignmentGroup'];
      const filled = profileFields.filter(f => emp.profile?.[f] !== undefined && emp.profile?.[f] !== null && emp.profile?.[f] !== '').length;
      const completion = Math.round((filled / profileFields.length) * 100);
      profileCompletionSum += completion;

      const onCallActive = emp.onCall?.currentStatus === 'Active' || emp.onCall?.currentStatus === 'On-Call Scheduled';
      const onLeave = emp.leavePlans?.some((l: any) => l.status === 'Approved' || l.status === 'Planned');
      if (onCallActive) peopleOnCall++;
      if (onLeave) peopleOnLeave++;

      const myPending = (emp.trainings || []).filter((t: any) => t.completionStatus !== 'Completed').length;
      const myCompleted = (emp.trainings || []).filter((t: any) => t.completionStatus === 'Completed').length;
      pendingTrainings += myPending;
      completedTrainings += myCompleted;

      totalBlockLeaves += (emp.blockLeaves || []).length;
      totalDemoSessions += (emp.demoSessions || []).length;

      memberSummaries.push({
        uid: emp.profile?.uid,
        name: emp.profile?.name,
        domain: emp.profile?.domain || 'Unassigned',
        status: emp.profile?.status || 'Active',
        onLeave,
        onCallActive,
        profileCompletion: completion,
        pendingTrainings: myPending,
      });
    });

    const avgProfileCompletion = totalMembers > 0 ? Math.round(profileCompletionSum / totalMembers) : 0;

    return NextResponse.json({
      totalMembers,
      peopleOnLeave,
      peopleOnCall,
      pendingTrainings,
      completedTrainings,
      totalBlockLeaves,
      totalDemoSessions,
      avgProfileCompletion,
      memberSummaries,
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
