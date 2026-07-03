"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search, User, Calendar, CalendarOff, Phone,
  GraduationCap, Presentation, FileText, Activity, Pencil, X
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
  personal:  { title: "Personal Details",          description: "Profiles, squads & assignment details of the team", icon: <User className="h-5 w-5" />,          color: "bg-blue-500/10 text-blue-500" },
  leave:     { title: "Team Leave Plans",          description: "Month-by-month leave schedules for all members",  icon: <Calendar className="h-5 w-5" />,       color: "bg-green-500/10 text-green-500" },
  blockleave:{ title: "Team Block Leaves",         description: "Extended leave periods planned by quarter",         icon: <CalendarOff className="h-5 w-5" />,    color: "bg-orange-500/10 text-orange-500" },
  oncall:    { title: "Team OnCall Statuses",      description: "Active on-call schedules and incident handovers",   icon: <Phone className="h-5 w-5" />,          color: "bg-emerald-500/10 text-emerald-500" },
  training:  { title: "Team Training & Certs",     description: "Certifications, trainings and progression logs",     icon: <GraduationCap className="h-5 w-5" />, color: "bg-purple-500/10 text-purple-500" },
  demos:     { title: "Team Demo Sessions",        description: "Standup demos hosted or participated in",           icon: <Presentation className="h-5 w-5" />,  color: "bg-cyan-500/10 text-cyan-500" },
  monthly:   { title: "Team Monthly Updates",      description: "Release updates and activity details by month",     icon: <FileText className="h-5 w-5" />,       color: "bg-yellow-500/10 text-yellow-500" },
  activity:  { title: "Team Activity History",     description: "Audited action logs across all members",           icon: <Activity className="h-5 w-5" />,       color: "bg-rose-500/10 text-rose-500" },
};

export function LeadSectionPage({ tab }: { tab: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [tab]);

  // Fetch all employee profile summaries
  const { data: profiles, isLoading: profilesLoading } = useQuery<any[]>({
    queryKey: ["employees-list-summaries"],
    queryFn: async () => {
      const res = await fetch(`/api/employees`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load team profiles");
      return res.json();
    },
  });

  // Filter profiles
  const members = (profiles || [])
    .filter((p) => p.role !== "Lead")
    .filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const uid = p.uid?.toLowerCase() || "";
      const domain = p.domain?.toLowerCase() || "";
      return name.includes(searchTerm.toLowerCase()) || uid.includes(searchTerm.toLowerCase()) || domain.includes(searchTerm.toLowerCase());
    });

  // Set default selection
  useEffect(() => {
    if (members.length > 0 && !selectedMemberId) {
      setSelectedMemberId(members[0].uid);
    }
  }, [members, selectedMemberId]);

  // Fetch the full details of the selected employee
  const { data: selectedMember, isLoading: memberLoading, refetch: refetchMember } = useQuery({
    queryKey: ["employee-full-details", selectedMemberId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${selectedMemberId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load member details");
      return res.json();
    },
    enabled: !!selectedMemberId,
  });

  const meta = SECTION_META[tab] || SECTION_META["personal"];

  const handleSaved = () => {
    refetchMember();
    setIsEditing(false);
  };

  const commonProps = {
    employeeId: selectedMemberId || "",
    onUpdate: handleSaved,
    readOnly: !isEditing,
  };

  const renderTabContent = () => {
    if (!selectedMember) return null;
    switch (tab) {
      case "personal":   return <PersonalDetailsTab data={selectedMember.profile}        {...commonProps} />;
      case "leave":      return <LeavePlansTab      data={selectedMember.leavePlans}      {...commonProps} />;
      case "blockleave": return <BlockLeaveTab      data={selectedMember.blockLeaves}     {...commonProps} />;
      case "oncall":     return <OnCallTab          data={selectedMember.onCall}          {...commonProps} />;
      case "training":   return <TrainingTab        data={selectedMember.trainings}       {...commonProps} />;
      case "demos":      return <DemoSessionsTab    data={selectedMember.demoSessions}    {...commonProps} />;
      case "monthly":    return <MonthlyUpdatesTab  data={selectedMember.monthlyUpdates}  {...commonProps} />;
      case "activity":   return <ActivityHistoryTab data={selectedMember.activityHistory || []} {...commonProps} />;
      default:           return <PersonalDetailsTab data={selectedMember.profile}        {...commonProps} />;
    }
  };

  if (profilesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="lg:col-span-2 h-[550px] rounded-xl" />
          <Skeleton className="lg:col-span-3 h-[550px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-5 bg-card border rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.color}`}>
            {meta.icon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{meta.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
          </div>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* Left Pane: Search & Members List */}
        <div className="lg:col-span-2 border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-4 border-b bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {members.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No matching team members found.
              </div>
            ) : (
              members.map((p) => {
                const isSelected = p.uid === selectedMemberId;
                return (
                  <button
                    key={p.uid}
                    onClick={() => {
                      setSelectedMemberId(p.uid);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 transition-colors flex items-center gap-3 hover:bg-muted/40 ${
                      isSelected ? "bg-primary/5 border-r-4 border-r-primary" : ""
                    }`}
                  >
                    <Avatar className="h-9 w-9 border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {p.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
                          {p.name}
                        </p>
                        <Badge variant={p.status === "Active" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                          {p.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {p.uid} • {p.domain || "No Domain"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Selected Member's Tab Form */}
        <div className="lg:col-span-3 space-y-4">
          {selectedMemberId ? (
            memberLoading ? (
              <div className="border rounded-xl bg-card shadow-sm p-6 min-h-[650px] space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : selectedMember ? (
              <div className="border rounded-xl bg-card shadow-sm overflow-hidden flex flex-col min-h-[650px]">
                {/* Member Form Header */}
                <div className="p-4 border-b flex items-center justify-between bg-muted/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/20 text-primary font-extrabold text-xs">
                        {selectedMember.profile?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">
                        {selectedMember.profile?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Viewing profile metrics
                      </p>
                    </div>
                  </div>

                  {tab !== "activity" && (
                    <div>
                      {isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => setIsEditing(true)}>
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Form
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Form Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                  {renderTabContent()}
                </div>
              </div>
            ) : (
              <div className="border border-dashed rounded-xl p-16 text-center text-muted-foreground bg-muted/5 min-h-[650px] flex flex-col items-center justify-center">
                Failed to load member details.
              </div>
            )
          ) : (
            <div className="border border-dashed rounded-xl p-16 text-center text-muted-foreground bg-muted/5 min-h-[650px] flex flex-col items-center justify-center">
              Select a team member to view and edit details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
