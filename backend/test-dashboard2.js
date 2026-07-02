const { StorageService } = require('./src/services/storage.service');

async function test() {
  const employees = await StorageService.getAllEmployees();
  const members = employees.filter(e => e.profile?.role === 'Member');

  console.log(`totalMembers: ${members.length}`);
  
  let peopleOnLeave = 0;
  let peopleOnCall = 0;
  let pendingTrainings = 0;
  let completedTrainings = 0;
  let totalBlockLeaves = 0;
  let totalDemoSessions = 0;
  let profileCompletionSum = 0;

  members.forEach(emp => {
    const profileFields = ['name','domain','doj','yearsOfExperience','functions','tribe','squadName','scrumMaster','chapterLead','copReferent','teamPocOnshore','assignmentGroupManager','hvd','assignmentGroup'];
    const filled = profileFields.filter(f => emp.profile?.[f] !== undefined && emp.profile?.[f] !== null && emp.profile?.[f] !== '').length;
    const completion = Math.round((filled / profileFields.length) * 100);
    profileCompletionSum += completion;

    const onCallActive = emp.onCall?.some(o => o.status === 'Active' || o.status === 'On-Call Scheduled');
    const onLeave = emp.leavePlans?.some(l => l.status === 'Approved' || l.status === 'Planned');
    if (onCallActive) peopleOnCall++;
    if (onLeave) peopleOnLeave++;

    const myPending = (emp.trainings || []).filter(t => t.completionStatus !== 'Completed').length;
    const myCompleted = (emp.trainings || []).filter(t => t.completionStatus === 'Completed').length;
    pendingTrainings += myPending;
    completedTrainings += myCompleted;

    totalBlockLeaves += (emp.blockLeaves || []).length;
    totalDemoSessions += (emp.demoSessions || []).length;
  });

  const avgProfileCompletion = members.length > 0 ? Math.round(profileCompletionSum / members.length) : 0;
  
  console.log({
    totalMembers: members.length,
    peopleOnLeave,
    peopleOnCall,
    pendingTrainings,
    totalBlockLeaves,
    totalDemoSessions,
    avgProfileCompletion,
  });
}

test().catch(console.error);
