"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Upload, Award, FileCheck, GraduationCap } from "lucide-react";

const COMPLETION_OPTIONS = ["Not Started", "In Progress", "Completed", "Expired", "Renewed"];
const DONE_IN_OPTIONS = ["Online", "Classroom", "On-the-Job", "Workshop", "Self-Study", "Webinar"];

const completionColor: Record<string, string> = {
  "Not Started": "secondary",
  "In Progress": "outline",
  "Completed": "default",
  "Expired": "destructive",
  "Renewed": "default",
};

interface TrainingEntry {
  id: string;
  certificationName: string;
  trainingName: string;
  doneIn: string;
  doneDate: string;
  completionStatus: string;
  certificateFileName: string;
  progress: number;
}

const emptyRow = (): TrainingEntry => ({
  id: Date.now().toString(),
  certificationName: "",
  trainingName: "",
  doneIn: "",
  doneDate: "",
  completionStatus: "Not Started",
  certificateFileName: "",
  progress: 0,
});

const Field = ({ label, value, children, isReadOnly, className }: { label: string; value?: string | number; children?: React.ReactNode; isReadOnly: boolean; className?: string }) => (
  <div className={`p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 dark:bg-purple-950/10 space-y-1.5 transition-all hover:border-purple-500/40 ${className || ""}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{label}</p>
    {isReadOnly ? (
      <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
        {value !== undefined && value !== "" ? String(value) : "—"}
      </p>
    ) : (
      <div className="mt-1">{children}</div>
    )}
  </div>
);

export default function TrainingTab({ data, onUpdate, employeeId, readOnly }: { data: any[]; onUpdate: () => void; employeeId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);
  const [records, setRecords] = useState<TrainingEntry[]>(data || []);

  const addRow = () => setRecords([...records, emptyRow()]);
  const removeRow = (id: string) => setRecords(records.filter((r) => r.id !== id));
  const updateRow = (id: string, field: keyof TrainingEntry, value: any) =>
    setRecords(records.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateRow(id, "certificateFileName", file.name);
      toast.info(`Certificate "${file.name}" attached (stored locally)`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${employeeId}/trainings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Trainings & certifications saved!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = records.filter((r) => r.completionStatus === "Completed").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-purple-500/10">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span> Training & Certifications
          </h3>
          <p className="text-xs text-muted-foreground">
            {completedCount} of {records.length} completed
          </p>
        </div>
        {!isReadOnly && (
          <Button onClick={addRow} variant="outline" size="sm" className="border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-500/10">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Training
          </Button>
        )}
      </div>

      {records.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {COMPLETION_OPTIONS.map((status) => {
            const count = records.filter((r) => r.completionStatus === status).length;
            if (!count) return null;
            return (
              <Badge key={status} variant={completionColor[status] as any} className="gap-1 border-purple-500/20">
                <Award className="h-3 w-3" />
                {count} {status}
              </Badge>
            );
          })}
        </div>
      )}

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground text-sm bg-purple-500/5 border-purple-500/20">
            No trainings found.{!isReadOnly && ' Click "Add Training" to begin.'}
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r.id} className="border border-l-4 border-l-purple-500 border-purple-500/20 rounded-2xl p-6 space-y-5 bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b pb-3 border-purple-500/10">
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5" /> Training / Certification #{i + 1}
                </span>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={() => removeRow(r.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Certification" value={r.certificationName} isReadOnly={isReadOnly}>
                  <Input value={r.certificationName} onChange={(e) => updateRow(r.id, "certificationName", e.target.value)} placeholder="e.g. AWS Solutions Architect" className="text-sm focus-visible:ring-purple-500 border-purple-500/20" />
                </Field>
                <Field label="Training Name" value={r.trainingName} isReadOnly={isReadOnly}>
                  <Input value={r.trainingName} onChange={(e) => updateRow(r.id, "trainingName", e.target.value)} placeholder="e.g. Cloud Fundamentals" className="text-sm focus-visible:ring-purple-500 border-purple-500/20" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Done In" value={r.doneIn} isReadOnly={isReadOnly}>
                  <select
                    value={r.doneIn}
                    onChange={(e) => updateRow(r.id, "doneIn", e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 border-purple-500/20"
                  >
                    <option value="">Select Category</option>
                    {DONE_IN_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label="Done Date" value={r.doneDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={r.doneDate} onChange={(e) => updateRow(r.id, "doneDate", e.target.value)} className="text-sm focus-visible:ring-purple-500 border-purple-500/20" />
                </Field>
                <Field label="Completion Status" value={r.completionStatus} isReadOnly={isReadOnly}>
                  <select
                    value={r.completionStatus}
                    onChange={(e) => updateRow(r.id, "completionStatus", e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-purple-500 border-purple-500/20"
                  >
                    {COMPLETION_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Field label="Certificate" isReadOnly={false} className="border-purple-500/20">
                  {isReadOnly ? (
                    r.certificateFileName ? (
                      <div className="flex items-center gap-2 text-sm text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/20 px-4.5 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900 w-fit">
                        <FileCheck className="h-4.5 w-4.5" /> {r.certificateFileName}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">No certificate uploaded</span>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold px-4.5 py-2.5 border rounded-xl hover:bg-muted bg-background transition-colors shadow-sm border-purple-500/30">
                        <Upload className="h-4 w-4" />
                        {r.certificateFileName ? "Change File" : "Upload File"}
                        <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={(e) => handleFileChange(r.id, e)} />
                      </label>
                      {r.certificateFileName && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={r.certificateFileName}>
                          Selected: {r.certificateFileName}
                        </span>
                      )}
                    </div>
                  )}
                </Field>

                <Field label="Progress" isReadOnly={isReadOnly} className="border-purple-500/20">
                  <div className="space-y-2">
                    {!isReadOnly ? (
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          value={r.progress}
                          onChange={(e) => updateRow(r.id, "progress", Math.min(100, Math.max(0, Number(e.target.value))))}
                          min={0}
                          max={100}
                          className="h-8 w-20 text-sm focus-visible:ring-purple-500 border-purple-500/20"
                        />
                        <span className="text-sm font-semibold">%</span>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{r.progress}% Completed</p>
                    )}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden border">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${r.progress}%` }} />
                    </div>
                  </div>
                </Field>
              </div>

              {isReadOnly && r.completionStatus && (
                <div className="flex justify-end pt-2">
                  <Badge variant={completionColor[r.completionStatus] as any} className="px-3 py-1 font-semibold text-xs">{r.completionStatus}</Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t border-purple-500/10">
          <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white px-5">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Trainings
          </Button>
        </div>
      )}
    </div>
  );
}
