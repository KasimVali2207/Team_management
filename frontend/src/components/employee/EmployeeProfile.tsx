"use client";

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, Calendar, CalendarOff, Phone, 
  GraduationCap, Presentation, FileText, Activity 
} from "lucide-react";

// Tab Components (to be created)
import PersonalDetailsTab from './tabs/PersonalDetailsTab';
import LeavePlansTab from './tabs/LeavePlansTab';
import BlockLeaveTab from './tabs/BlockLeaveTab';
import OnCallTab from './tabs/OnCallTab';
import TrainingTab from './tabs/TrainingTab';
import DemoSessionsTab from './tabs/DemoSessionsTab';
import MonthlyUpdatesTab from './tabs/MonthlyUpdatesTab';
import ActivityHistoryTab from './tabs/ActivityHistoryTab';

export function EmployeeProfile({ employeeId, defaultTab = 'personal' }: { employeeId: string, defaultTab?: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { data: employee, isLoading, refetch } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${employeeId}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch employee details');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  if (!employee) return <div>Employee not found.</div>;

  const { profile } = employee;

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-card rounded-xl border shadow-sm">
        <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {profile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
            <Badge variant={profile.status === 'Active' ? 'default' : 'secondary'}>
              {profile.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mt-4">
            <div>
              <p className="font-semibold text-foreground">UID</p>
              <p>{profile.uid}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Role</p>
              <p>{profile.role}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Domain</p>
              <p>{profile.domain}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Experience</p>
              <p>{profile.yearsOfExperience} Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section — all inside one card */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden" key={defaultTab}>
          {/* Tab Navigation — top of the card */}
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-8 h-auto p-0 bg-muted/40 rounded-none border-b">
            <TabsTrigger value="personal" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <User className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="leave" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <Calendar className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Leave</span>
            </TabsTrigger>
            <TabsTrigger value="blockleave" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <CalendarOff className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Block Leave</span>
            </TabsTrigger>
            <TabsTrigger value="oncall" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <Phone className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">OnCall</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <GraduationCap className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Training</span>
            </TabsTrigger>
            <TabsTrigger value="demos" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <Presentation className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Demos</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="py-3 flex flex-col items-center gap-1 rounded-none border-r data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <FileText className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Monthly</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="py-3 flex flex-col items-center gap-1 rounded-none data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-primary">
              <Activity className="h-4 w-4" />
              <span className="text-[10px] sm:text-xs">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content — same card, below the tab bar */}
          <div className="p-6">
            <TabsContent value="personal"><PersonalDetailsTab data={employee.profile} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="leave"><LeavePlansTab data={employee.leavePlans} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="blockleave"><BlockLeaveTab data={employee.blockLeaves} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="oncall"><OnCallTab data={employee.onCall} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="training"><TrainingTab data={employee.trainings} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="demos"><DemoSessionsTab data={employee.demoSessions} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="monthly"><MonthlyUpdatesTab data={employee.monthlyUpdates} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
            <TabsContent value="activity"><ActivityHistoryTab data={employee.activityHistory || []} onUpdate={refetch} employeeId={employeeId} /></TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
