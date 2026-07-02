"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Pencil, X, User, Calendar, CalendarOff, Phone,
  GraduationCap, Presentation, FileText, Activity
} from "lucide-react";

import PersonalDetailsTab from "./tabs/PersonalDetailsTab";
import LeavePlansTab from "./tabs/LeavePlansTab";
import BlockLeaveTab from "./tabs/BlockLeaveTab";
import OnCallTab from "./tabs/OnCallTab";
import TrainingTab from "./tabs/TrainingTab";
import DemoSessionsTab from "./tabs/DemoSessionsTab";
import MonthlyUpdatesTab from "./tabs/MonthlyUpdatesTab";
import ActivityHistoryTab from "./tabs/ActivityHistoryTab";

const SECTION_META: Record<string, { title: string; description: string; icon: React.ReactNode; color: string }> = {
  personal:  { title: "Personal Details",          description: "Your profile, domain, squad & assignment details", icon: <User className="h-5 w-5" />,          color: "bg-blue-500/10 text-blue-500" },
  leave:     { title: "Leave Plans",               description: "Plan and track your leaves month-by-month",        icon: <Calendar className="h-5 w-5" />,       color: "bg-green-500/10 text-green-500" },
  blockleave:{ title: "Block Leave",               description: "Extended leave periods planned by quarter",         icon: <CalendarOff className="h-5 w-5" />,    color: "bg-orange-500/10 text-orange-500" },
  oncall:    { title: "OnCall",                    description: "Current on-call status and history",                icon: <Phone className="h-5 w-5" />,          color: "bg-emerald-500/10 text-emerald-500" },
  training:  { title: "Training & Certifications", description: "Certifications, trainings and progress",            icon: <GraduationCap className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-500" },
  demos:     { title: "Demo Sessions",             description: "Standup demos hosted or participated in",           icon: <Presentation className="h-5 w-5" />,  color: "bg-cyan-500/10 text-cyan-500" },
  monthly:   { title: "Monthly Updates",           description: "Release updates, activity details per month",       icon: <FileText className="h-5 w-5" />,       color: "bg-yellow-500/10 text-yellow-500" },
  activity:  { title: "Activity History",          description: "All actions performed — auto-logged",               icon: <Activity className="h-5 w-5" />,       color: "bg-rose-500/10 text-rose-500" },
};

export function SectionPage({ tab }: { tab: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();
  
  React.useEffect(() => {
    setIsEditing(false);
  }, [tab]);

  const { data: employee, isLoading, refetch } = useQuery({
    queryKey: ["employee-section", user?.employeeId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${user?.employeeId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load your data");
      return res.json();
    },
    enabled: !!user?.employeeId,
  });

  const meta = SECTION_META[tab] || SECTION_META["personal"];

  const handleSaved = () => {
    refetch();
    setIsEditing(false); // return to view mode after saving
  };

  const commonProps = {
    employeeId: user?.employeeId!,
    onUpdate: handleSaved,
    readOnly: !isEditing,
  };

  const renderSection = () => {
    if (!employee) return null;
    switch (tab) {
      case "personal":   return <PersonalDetailsTab data={employee.profile}        {...commonProps} />;
      case "leave":      return <LeavePlansTab      data={employee.leavePlans}      {...commonProps} />;
      case "blockleave": return <BlockLeaveTab      data={employee.blockLeaves}     {...commonProps} />;
      case "oncall":     return <OnCallTab          data={employee.onCall}          {...commonProps} />;
      case "training":   return <TrainingTab        data={employee.trainings}       {...commonProps} />;
      case "demos":      return <DemoSessionsTab    data={employee.demoSessions}    {...commonProps} />;
      case "monthly":    return <MonthlyUpdatesTab  data={employee.monthlyUpdates}  {...commonProps} />;
      case "activity":   return <ActivityHistoryTab data={employee.activityHistory || []} {...commonProps} />;
      default:           return <PersonalDetailsTab data={employee.profile}        {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-[480px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-5 bg-card border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{meta.title}</h1>
              {isEditing && (
                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400 bg-yellow-400/10">
                  Editing
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
          </div>
        </div>

        {/* Action buttons */}
        {tab !== "activity" && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-1.5 h-4 w-4" /> Cancel
              </Button>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-1.5 h-4 w-4" /> Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {renderSection()}
      </div>
    </div>
  );
}
