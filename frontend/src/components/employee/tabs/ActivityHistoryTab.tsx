"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UserCircle, CalendarDays, CalendarX2, Phone, BookOpen,
  Monitor, FileText, Clock, RefreshCw, Trash2
} from "lucide-react";

interface ActivityEntry {
  id?: string;
  timestamp: string;
  action: string;
  uid?: string;
  employeeId?: string;
  targetId?: string;
}

const getIcon = (action: string) => {
  if (action.toLowerCase().includes("leave") && !action.toLowerCase().includes("block")) return <CalendarDays className="h-4 w-4 text-blue-500" />;
  if (action.toLowerCase().includes("block")) return <CalendarX2 className="h-4 w-4 text-orange-500" />;
  if (action.toLowerCase().includes("oncall") || action.toLowerCase().includes("on-call")) return <Phone className="h-4 w-4 text-green-500" />;
  if (action.toLowerCase().includes("training") || action.toLowerCase().includes("certification")) return <BookOpen className="h-4 w-4 text-purple-500" />;
  if (action.toLowerCase().includes("demo")) return <Monitor className="h-4 w-4 text-cyan-500" />;
  if (action.toLowerCase().includes("monthly") || action.toLowerCase().includes("update")) return <FileText className="h-4 w-4 text-yellow-500" />;
  if (action.toLowerCase().includes("profile") || action.toLowerCase().includes("personal")) return <UserCircle className="h-4 w-4 text-primary" />;
  return <RefreshCw className="h-4 w-4 text-muted-foreground" />;
};

const getCategory = (action: string): string => {
  if (action.toLowerCase().includes("leave") && !action.toLowerCase().includes("block")) return "Leave";
  if (action.toLowerCase().includes("block")) return "Block Leave";
  if (action.toLowerCase().includes("oncall") || action.toLowerCase().includes("on-call")) return "OnCall";
  if (action.toLowerCase().includes("training")) return "Training";
  if (action.toLowerCase().includes("demo")) return "Demo";
  if (action.toLowerCase().includes("monthly")) return "Monthly";
  if (action.toLowerCase().includes("profile")) return "Profile";
  return "General";
};

const categoryColor: Record<string, string> = {
  Leave: "outline",
  "Block Leave": "secondary",
  OnCall: "default",
  Training: "default",
  Demo: "secondary",
  Monthly: "outline",
  Profile: "default",
  General: "secondary",
};

export default function ActivityHistoryTab({ data, employeeId, onUpdate, readOnly }: { data: any; employeeId: string; onUpdate?: () => void; readOnly?: boolean }) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/activities`, { credentials: "include" });
      if (res.ok) {
        const all: ActivityEntry[] = await res.json();
        // Filter to this employee's activities
        const mine = all
          .filter((a) => a.employeeId === employeeId || a.targetId === employeeId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(mine);
      }
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [employeeId]);

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all activities for this employee?")) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/activities`, { method: "DELETE", credentials: "include" });
        if (res.ok) {
          toast.success("Activity log cleared!");
          fetchLogs();
          if (onUpdate) onUpdate();
        }
      } catch (_) {}
    }
  };

  const handleDeleteItem = async (id?: string) => {
    if (!id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/activities/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        toast.success("Log entry deleted!");
        fetchLogs();
        if (onUpdate) onUpdate();
      }
    } catch (_) {}
  };

  const grouped = activities.reduce<Record<string, ActivityEntry[]>>((acc, a) => {
    const dateKey = new Date(a.timestamp).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(a);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-3 border-b">
        <div>
          <h3 className="text-lg font-semibold">Activity History</h3>
          <p className="text-sm text-muted-foreground">
            {activities.length === 0 ? "No activities recorded yet." : `${activities.length} action(s) tracked`}
          </p>
        </div>
        {activities.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll} className="text-destructive border-destructive/20 hover:bg-destructive/15">
            Clear History
          </Button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <Clock className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
          <p className="text-xs text-muted-foreground">Every time you save a tab, it will appear here with a timestamp.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <div key={date} className="space-y-3">
            {/* Date separator */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground px-2">{date}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Activity items */}
            <div className="space-y-2">
              {items.map((activity, i) => {
                const category = getCategory(activity.action);
                return (
                  <div key={activity.id || i} className="group/log flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Icon circle */}
                      <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        {getIcon(activity.action)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <Badge variant={categoryColor[category] as any} className="text-[10px] px-1.5 py-0 h-4">{category}</Badge>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover/log:opacity-100 text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-opacity flex-shrink-0"
                      onClick={() => handleDeleteItem(activity.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
