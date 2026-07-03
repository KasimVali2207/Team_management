"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Monitor } from "lucide-react";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled", "Rescheduled"];
const statusColor: Record<string, string> = {
  Scheduled: "outline",
  Completed: "default",
  Cancelled: "destructive",
  Rescheduled: "secondary",
};

interface DemoSession {
  id: string;
  standupDate: string;
  host: string;
  topic: string;
  status: string;
}

const emptyRow = (): DemoSession => ({
  id: Date.now().toString(),
  standupDate: "",
  host: "",
  topic: "",
  status: "Scheduled",
});

const Field = ({ label, value, children, isReadOnly, className }: { label: string; value?: string | number; children?: React.ReactNode; isReadOnly: boolean; className?: string }) => (
  <div className={`p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 dark:bg-cyan-950/10 space-y-1.5 transition-all hover:border-cyan-500/40 ${className || ""}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">{label}</p>
    {isReadOnly ? (
      <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
        {value !== undefined && value !== "" ? String(value) : "—"}
      </p>
    ) : (
      <div className="mt-1">{children}</div>
    )}
  </div>
);

export default function DemoSessionsTab({ data, onUpdate, employeeId, readOnly }: { data: any[]; onUpdate: () => void; employeeId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);
  const [records, setRecords] = useState<DemoSession[]>(data || []);

  const addRow = () => setRecords([...records, emptyRow()]);
  const removeRow = (id: string) => setRecords(records.filter((r) => r.id !== id));
  const updateRow = (id: string, field: keyof DemoSession, value: string) =>
    setRecords(records.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/demoSessions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Demo sessions saved!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = records.filter((r) => r.status === "Completed").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-cyan-500/10">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></span> Demo Sessions
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedCount} completed · {records.length - completedCount} pending
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={addRow} variant="outline" size="sm" className="border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-semibold hover:bg-cyan-500/10">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Session
          </Button>
        )}
      </div>

      {records.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((s) => {
            const count = records.filter((r) => r.status === s).length;
            if (!count) return null;
            return (
              <Badge key={s} variant={statusColor[s] as any} className="gap-1 border-cyan-500/20">
                <Monitor className="h-3 w-3" />
                {count} {s}
              </Badge>
            );
          })}
        </div>
      )}

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground text-sm bg-cyan-500/5 border-cyan-500/20">
            No demo sessions yet.{!isReadOnly && ' Click "Add Session" to get started.'}
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r.id} className="border border-l-4 border-l-cyan-500 border-cyan-500/20 rounded-2xl p-6 space-y-5 bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b pb-3 border-cyan-500/10">
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <Monitor className="w-4.5 h-4.5" /> Demo Session #{i + 1}
                </span>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={() => removeRow(r.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Standup Date" value={r.standupDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={r.standupDate} onChange={(e) => updateRow(r.id, "standupDate", e.target.value)} className="text-sm focus-visible:ring-cyan-500 border-cyan-500/20" />
                </Field>
                <Field label="Host" value={r.host} isReadOnly={isReadOnly}>
                  <Input value={r.host} onChange={(e) => updateRow(r.id, "host", e.target.value)} placeholder="Host name" className="text-sm focus-visible:ring-cyan-500 border-cyan-500/20" />
                </Field>
                <Field label="Status" value={r.status} isReadOnly={isReadOnly}>
                  <select
                    value={r.status}
                    onChange={(e) => updateRow(r.id, "status", e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-cyan-500 border-cyan-500/20"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Topic" value={r.topic} isReadOnly={isReadOnly} className="bg-cyan-500/[0.03] border-l-2 border-l-cyan-500">
                <textarea
                  value={r.topic}
                  onChange={(e) => updateRow(r.id, "topic", e.target.value)}
                  rows={3}
                  placeholder="Enter detailed demo topic or standup notes here..."
                  className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm resize-y min-h-[90px] focus:outline-none focus:ring-1 focus:ring-cyan-500 border-cyan-500/20"
                />
              </Field>

              {isReadOnly && r.status && (
                <div className="flex justify-end pt-2">
                  <Badge variant={statusColor[r.status] as any} className="px-3 py-1 font-semibold text-xs">{r.status}</Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t border-cyan-500/10">
          <Button onClick={handleSave} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white px-5">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Demo Sessions
          </Button>
        </div>
      )}
    </div>
  );
}
