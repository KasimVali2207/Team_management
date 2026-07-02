"use client";

import { use } from "react";
import { SectionPage } from "@/components/employee/SectionPage";
import { LeadSectionPage } from "@/components/employee/LeadSectionPage";
import { useAuth } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";

// Map URL segment → tab/section key
const TAB_MAP: Record<string, string> = {
  'leave-plans':     'leave',
  'block-leave':     'blockleave',
  'oncall':          'oncall',
  'training':        'training',
  'demo-sessions':   'demos',
  'demo':            'demos',
  'monthly-updates': 'monthly',
  'activity':        'activity',
};

export default function MemberTabPage({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = use(params);
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <Skeleton className="h-[600px] w-full rounded-xl" />;
  }

  const section = TAB_MAP[tab] || 'personal';
  const isLead = user.role === 'Lead';

  return (
    isLead ? (
      <LeadSectionPage tab={section} />
    ) : (
      <SectionPage tab={section} />
    )
  );
}
