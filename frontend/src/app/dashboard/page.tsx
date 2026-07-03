"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users, Calendar, Phone, GraduationCap, ArrowRight, Clock,
  CheckCircle2, Trash2, CalendarOff, BarChart3,
  Activity, Zap, Star, PlayCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── helpers ────────────────────────────────────────────────────────────────

const getCategoryStyles = (action: string) => {
  const lc = action.toLowerCase();
  if (lc.includes("leave") && !lc.includes("block")) return { border: "border-l-4 border-l-blue-500", badge: "bg-blue-500/15 text-blue-400" };
  if (lc.includes("block"))  return { border: "border-l-4 border-l-orange-500", badge: "bg-orange-500/15 text-orange-400" };
  if (lc.includes("oncall") || lc.includes("on-call")) return { border: "border-l-4 border-l-emerald-500", badge: "bg-emerald-500/15 text-emerald-400" };
  if (lc.includes("training") || lc.includes("certification")) return { border: "border-l-4 border-l-purple-500", badge: "bg-purple-500/15 text-purple-400" };
  if (lc.includes("demo"))   return { border: "border-l-4 border-l-cyan-500",   badge: "bg-cyan-500/15 text-cyan-400" };
  if (lc.includes("monthly")) return { border: "border-l-4 border-l-yellow-500", badge: "bg-yellow-500/15 text-yellow-400" };
  if (lc.includes("removed") || lc.includes("added")) return { border: "border-l-4 border-l-rose-500", badge: "bg-rose-500/15 text-rose-400" };
  return { border: "border-l-4 border-l-slate-500", badge: "bg-slate-500/15 text-slate-400" };
};

const getProfileCompletion = (profile: any) => {
  if (!profile) return 0;
  const fields = ["name","domain","doj","yearsOfExperience","functions","tribe","squadName","scrumMaster","chapterLead","copReferent","teamPocOnshore","assignmentGroupManager","hvd","assignmentGroup"];
  const filled = fields.filter(f => profile[f] !== undefined && profile[f] !== null && profile[f] !== '').length;
  return Math.round((filled / fields.length) * 100);
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

// ─── Lead KPI card ──────────────────────────────────────────────────────────
function KPICard({ title, value, sub, icon: Icon, color, href, delay = 0 }: {
  title: string; value: string | number; sub?: string;
  icon: any; color: string; href?: string; delay?: number;
}) {
  const inner = (
    <motion.div 
      variants={fadeUp} 
      transition={{ delay, type: "spring", stiffness: 100 }} 
      className="h-full"
    >
      <div className={`h-full group relative rounded-2xl border p-6 flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer backdrop-blur-md ${color}`}>
        {/* Soft background glass overlay */}
        <div className="absolute inset-0 bg-white/5 dark:bg-black/5 pointer-events-none" />
        
        {/* Soft hover glow */}
        <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full opacity-[0.1] blur-3xl bg-current transition-opacity duration-300 group-hover:opacity-[0.2] pointer-events-none" />
        
        <div className="flex items-start justify-between z-10">
          <div className="w-10 h-10 rounded-xl bg-background/60 dark:bg-background/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-sm border border-foreground/5 transition-transform duration-300 group-hover:scale-105">
            <Icon className="w-5 h-5 text-current" />
          </div>
          {href && (
            <div className="w-7 h-7 rounded-full bg-background/50 dark:bg-background/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-current" />
            </div>
          )}
        </div>
        
        <div className="space-y-1.5 z-10">
          <div className="text-3xl font-extrabold tracking-tight leading-none text-foreground dark:text-white">
            {value}
          </div>
          {sub && <div className="text-xs font-medium text-foreground/80 dark:text-muted-foreground/90">{sub}</div>}
        </div>
        
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-foreground/60 dark:text-muted-foreground/60 border-t border-foreground/10 dark:border-white/10 pt-3 mt-auto z-10">
          {title}
        </div>
      </div>
    </motion.div>
  );
  return href ? <Link href={href} className="h-full block">{inner}</Link> : inner;
}

// ─── Donut ring ─────────────────────────────────────────────────────────────
function Ring({ pct, color, size = 40 }: { pct: number; color: string; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3} stroke="currentColor" className="text-border/20" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3.5} stroke={color}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-500 ease-out" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: dd, isLoading: ddLoading, refetch: refetchDashboard, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const r = await fetch(`/api/dashboard`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: user?.role === 'Lead',
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 30_000,   // auto-refresh every 30s
  });

  const { data: memberData, isLoading: memberLoading, refetch: refetchMember } = useQuery({
    queryKey: ['member-profile', user?.employeeId],
    queryFn: async () => {
      const r = await fetch(`/api/employees/${user?.employeeId}`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    enabled: !!user?.employeeId && user?.role !== 'Lead',
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 30_000,
  });

  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const r = await fetch(`/api/activities`, { credentials: 'include' });
      if (!r.ok) throw new Error('Failed');
      return r.json();
    },
    staleTime: 0,
    gcTime: 0,
    refetchInterval: 30_000,
  });

  const handleRefresh = () => {
    refetchDashboard();
    refetchActivities();
    if (user?.role !== 'Lead') refetchMember();
  };

  const clearAll = async () => {
    if (!confirm("Clear all activity history?")) return;
    const r = await fetch(`/api/activities`, { method: "DELETE", credentials: "include" });
    if (r.ok) { toast.success("History cleared!"); refetchActivities(); }
  };

  const deleteOne = async (id: string) => {
    const r = await fetch(`/api/activities/${id}`, { method: "DELETE", credentials: "include" });
    if (r.ok) { toast.success("Deleted!"); refetchActivities(); }
  };

  if (ddLoading || memberLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  // ── Member metrics ───────────────────────────────────────────────────────
  const memberPct = getProfileCompletion(memberData?.profile);
  const memberLeaves = (memberData?.leavePlans || [])
    .filter((l: any) => l.status === 'Planned' || l.status === 'Approved')
    .reduce((s: number, l: any) => s + (Number(l.leaveDays) || 0), 0);
  const memberOnCall = memberData?.onCall?.currentStatus || "Inactive";
  const memberPending = (memberData?.trainings || []).filter((t: any) => t.completionStatus !== 'Completed').length;

  // ── Lead KPIs ────────────────────────────────────────────────────────────
  const isLead = user?.role === 'Lead';

  return (
    <div className="space-y-7">

      {/* ── WELCOME BANNER ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary/8 via-primary/3 to-background dark:from-primary/15 dark:via-primary/5 dark:to-card p-6 flex items-center justify-between shadow-md"
      >
        {/* decorative circles */}
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
        <div className="absolute right-24 bottom-[-40px] w-32 h-32 rounded-full bg-blue-500/6 blur-2xl pointer-events-none" />
        <div className="z-10 space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, <span className="text-primary">{user?.username}</span>! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLead
              ? `You have ${dd?.totalMembers || 0} team member${dd?.totalMembers === 1 ? '' : 's'} — here's your live team pulse.`
              : "Here's a quick overview of your profile and activity today."}
          </p>
          {dataUpdatedAt ? (
            <p className="text-[11px] text-muted-foreground/50 mt-1">
              Last updated: {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          ) : null}
        </div>
        <div className="hidden md:flex items-center gap-3 z-10 flex-shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            {isLead ? 'Team Lead' : 'Team Member'}
          </div>
        </div>
      </motion.div>

      {/* ── LEAD VIEW ─────────────────────────────────────────────────── */}
      {isLead && (
        <>
          {/* Primary KPI row */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KPICard title="Team Size" value={dd?.totalMembers ?? 0}
              sub="Active members" icon={Users}
              color="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border-blue-500/20 text-blue-400"
              href="/dashboard/team" delay={0} />
            <KPICard title="On Leave" value={dd?.peopleOnLeave ?? 0}
              sub="Have leave approved" icon={Calendar}
              color="bg-gradient-to-br from-amber-600/20 to-orange-800/10 border-amber-500/20 text-amber-400"
              href="/dashboard/leave-plans" delay={0.07} />
            <KPICard title="On-Call Active" value={dd?.peopleOnCall ?? 0}
              sub="Members on duty" icon={Phone}
              color="bg-gradient-to-br from-emerald-600/20 to-green-800/10 border-emerald-500/20 text-emerald-400"
              href="/dashboard/oncall" delay={0.14} />
            <KPICard title="Pending Trainings" value={dd?.pendingTrainings ?? 0}
              sub={`${dd?.completedTrainings ?? 0} completed`} icon={GraduationCap}
              color="bg-gradient-to-br from-purple-600/20 to-violet-800/10 border-purple-500/20 text-purple-400"
              href="/dashboard/training" delay={0.21} />
          </motion.div>

          {/* Secondary metrics row */}
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <KPICard title="Block Leaves Logged" value={dd?.totalBlockLeaves ?? 0}
              sub="Extended leaves planned" icon={CalendarOff}
              color="bg-gradient-to-br from-rose-600/15 to-pink-800/10 border-rose-500/20 text-rose-400"
              href="/dashboard/block-leave" delay={0} />
            <KPICard title="Demo Sessions" value={dd?.totalDemoSessions ?? 0}
              sub="Across all members" icon={PlayCircle}
              color="bg-gradient-to-br from-cyan-600/15 to-sky-800/10 border-cyan-500/20 text-cyan-400"
              href="/dashboard/demo-sessions" delay={0.07} />
            <KPICard title="Avg. Profile Completion" value={`${dd?.avgProfileCompletion ?? 0}%`}
              sub="Team readiness score" icon={BarChart3}
              color="bg-gradient-to-br from-indigo-600/15 to-blue-800/10 border-indigo-500/20 text-indigo-400"
              delay={0.14} />
          </motion.div>

          {/* Team status table + Activity feed */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Member status quick-view */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-3 border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" /> Team Pulse
                </h2>
                <Link href="/dashboard/team" className="text-xs text-primary hover:underline font-semibold">View all →</Link>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {!dd?.memberSummaries?.length ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No members yet.</div>
                ) : dd.memberSummaries.map((m: any) => (
                  <div key={m.uid} className="flex items-center gap-3 p-3.5 hover:bg-muted/20 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                      {m.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.domain}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {m.onLeave && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-semibold">On Leave</span>
                      )}
                      {m.onCallActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">On-Call</span>
                      )}
                      {!m.onLeave && !m.onCallActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">Available</span>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-center" title={`Profile ${m.profileCompletion}% complete`}>
                      <Ring pct={m.profileCompletion} color={m.profileCompletion > 70 ? '#22c55e' : m.profileCompletion > 40 ? '#f59e0b' : '#ef4444'} size={36} />
                      <span className="text-[9px] text-muted-foreground -mt-1">{m.profileCompletion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Feed */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="lg:col-span-4 border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activities
                </h2>
                {(activities?.length ?? 0) > 0 && (
                  <button onClick={clearAll}
                    className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded-lg font-semibold transition-colors">
                    Clear All
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activitiesLoading ? (
                  [1,2,3,4].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                ) : (activities?.length ?? 0) > 0 ? (
                  activities.slice(0, 10).map((act: any, i: number) => {
                    const c = getCategoryStyles(act.action);
                    return (
                      <div key={act.id || i}
                        className={`group/item flex items-center justify-between p-3 rounded-xl border bg-muted/10 hover:bg-muted/20 transition-colors ${c.border}`}>
                        <div className="min-w-0 flex-1 mr-3">
                          <p className="text-sm font-semibold truncate">{act.action}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {act.uid} → {act.targetId}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-muted-foreground font-semibold bg-muted/60 px-2 py-1 rounded-md border border-border/40">
                            {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={() => deleteOne(act.id)}
                            className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* ── MEMBER VIEW ─────────────────────────────────────────────────── */}
      {!isLead && (
        <>
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <KPICard title="Profile Completion" value={`${memberPct}%`}
              sub="of fields filled" icon={CheckCircle2}
              color="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border-blue-500/20 text-blue-400"
              href="/dashboard/personal" />
            <KPICard title="Upcoming Leave" value={memberLeaves}
              sub="Days planned / approved" icon={Calendar}
              color="bg-gradient-to-br from-amber-600/20 to-orange-800/10 border-amber-500/20 text-amber-400"
              href="/dashboard/leave-plans" />
            <KPICard title="OnCall Status" value={memberOnCall}
              sub={memberOnCall === 'Active' ? 'You are on duty' : 'Off duty'} icon={Phone}
              color="bg-gradient-to-br from-emerald-600/20 to-green-800/10 border-emerald-500/20 text-emerald-400"
              href="/dashboard/oncall" />
            <KPICard title="Pending Trainings" value={memberPending}
              sub="Tasks not completed" icon={GraduationCap}
              color="bg-gradient-to-br from-purple-600/20 to-violet-800/10 border-purple-500/20 text-purple-400"
              href="/dashboard/training" />
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-7">
            {/* Activity feed */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-4 border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activities
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activitiesLoading ? (
                  [1,2,3].map(i => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
                ) : (activities?.length ?? 0) > 0 ? (
                  activities.slice(0, 8).map((act: any, i: number) => {
                    const c = getCategoryStyles(act.action);
                    return (
                      <div key={act.id || i}
                        className={`p-3 rounded-xl border bg-muted/10 ${c.border}`}>
                        <p className="text-sm font-semibold">{act.action}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick tips */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="lg:col-span-3 border rounded-2xl bg-card shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b bg-muted/20">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" /> Monthly Checklist
                </h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { text: "Update leave plans before month end", icon: Calendar, color: "text-amber-400" },
                  { text: "Log all demo sessions you've hosted", icon: PlayCircle, color: "text-cyan-400" },
                  { text: "Complete any pending training tasks", icon: GraduationCap, color: "text-purple-400" },
                  { text: "Update your on-call schedule", icon: Phone, color: "text-emerald-400" },
                  { text: "Add your monthly activity updates", icon: BarChart3, color: "text-indigo-400" },
                ].map(({ text, icon: I, color }, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border bg-muted/10 hover:bg-muted/20 transition-colors">
                    <I className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
