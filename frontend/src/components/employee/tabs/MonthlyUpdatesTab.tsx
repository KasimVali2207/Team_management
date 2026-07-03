"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, FileText } from "lucide-react";

interface MonthlyUpdate {
  id: string;
  dateTime: string;
  releaseNumber: string;
  application: string;
  description: string;
  activityDetails: string;
}

const emptyRow = (): MonthlyUpdate => ({
  id: Date.now().toString(),
  dateTime: new Date().toISOString().slice(0, 16),
  releaseNumber: "",
  application: "",
  description: "",
  activityDetails: "",
});

const Field = ({ label, value, children, isReadOnly, className }: { label: string; value?: string | number; children?: React.ReactNode; isReadOnly: boolean; className?: string }) => (
  <div className={`p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 dark:bg-yellow-950/10 space-y-1.5 transition-all hover:border-yellow-500/40 ${className || ""}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400">{label}</p>
    {isReadOnly ? (
      <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
        {value !== undefined && value !== "" ? String(value) : "—"}
      </p>
    ) : (
      <div className="mt-1">{children}</div>
    )}
  </div>
);

export default function MonthlyUpdatesTab({ data, onUpdate, employeeId, readOnly }: { data: any[]; onUpdate: () => void; employeeId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);
  const [records, setRecords] = useState<MonthlyUpdate[]>(data || []);

  const addRow = () => setRecords([...records, emptyRow()]);
  const removeRow = (id: string) => setRecords(records.filter((r) => r.id !== id));
  const updateRow = (id: string, field: keyof MonthlyUpdate, value: string) =>
    setRecords(records.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/monthlyUpdates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Monthly updates saved!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sort newest first for display
  const sorted = [...records].sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-yellow-500/10">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></span> Monthly Updates
          </h3>
          <p className="text-xs text-muted-foreground">{records.length} update(s) logged</p>
        </div>
        {!isReadOnly && (
          <Button onClick={addRow} variant="outline" size="sm" className="border-yellow-500/30 text-yellow-600 dark:text-yellow-400 font-semibold hover:bg-yellow-500/10">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Update
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground text-sm bg-yellow-500/5 border-yellow-500/20">
            No updates yet.{!isReadOnly && ' Click "Add Update" to log your first entry.'}
          </div>
        ) : (
          sorted.map((r, i) => (
            <div key={r.id} className="border border-l-4 border-l-yellow-500 border-yellow-500/20 rounded-2xl p-6 space-y-5 bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b pb-3 border-yellow-500/10">
                <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5" /> Monthly Update #{records.length - i}
                </span>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={() => removeRow(r.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Date & Time" value={r.dateTime ? new Date(r.dateTime).toLocaleString() : ""} isReadOnly={isReadOnly}>
                  <Input
                    type="datetime-local"
                    value={r.dateTime}
                    onChange={(e) => updateRow(r.id, "dateTime", e.target.value)}
                    className="text-sm focus-visible:ring-yellow-500 border-yellow-500/20"
                  />
                </Field>
                <Field label="Release Number" value={r.releaseNumber} isReadOnly={isReadOnly}>
                  <Input
                    value={r.releaseNumber}
                    onChange={(e) => updateRow(r.id, "releaseNumber", e.target.value)}
                    placeholder="e.g. v2.5.1"
                    className="text-sm focus-visible:ring-yellow-500 border-yellow-500/20"
                  />
                </Field>
                <Field label="Application" value={r.application} isReadOnly={isReadOnly}>
                  <Input
                    value={r.application}
                    onChange={(e) => updateRow(r.id, "application", e.target.value)}
                    placeholder="App / module name"
                    className="text-sm focus-visible:ring-yellow-500 border-yellow-500/20"
                  />
                </Field>
              </div>

              <Field label="Description" value={r.description} isReadOnly={isReadOnly} className="bg-yellow-500/[0.03] border-l-2 border-l-yellow-500">
                <textarea
                  value={r.description}
                  onChange={(e) => updateRow(r.id, "description", e.target.value)}
                  rows={2}
                  placeholder="Brief description of the update..."
                  className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-yellow-500 border-yellow-500/20"
                />
              </Field>

              <Field label="Activity Details" value={r.activityDetails} isReadOnly={isReadOnly} className="bg-yellow-500/[0.03] border-l-2 border-l-yellow-500">
                <textarea
                  value={r.activityDetails}
                  onChange={(e) => updateRow(r.id, "activityDetails", e.target.value)}
                  rows={4}
                  placeholder={`Enter detailed activity notes here...\n\nExample:\n- Fixed login timeout bug\n- Deployed hotfix to prod\n- Updated DB schema`}
                  className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm resize-y min-h-[100px] focus:outline-none focus:ring-1 focus:ring-yellow-500 border-yellow-500/20"
                />
              </Field>
            </div>
          ))
        )}
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t border-yellow-500/10">
          <Button onClick={handleSave} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white px-5">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Monthly Updates
          </Button>
        </div>
      )}
    </div>
  );
}
