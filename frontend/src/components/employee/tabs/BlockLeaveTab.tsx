"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, CalendarRange } from "lucide-react";

const QUARTERS = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];
const STATUS_OPTIONS = ["Requested", "Approved", "Rejected", "Pending", "Cancelled"];

const statusColor: Record<string, string> = {
  Requested: "secondary",
  Approved: "default",
  Rejected: "destructive",
  Pending: "secondary",
  Cancelled: "outline",
};

interface BlockLeaveEntry {
  id: string;
  name: string;
  backupPerson: string;
  startDate: string;
  endDate: string;
  quarter: string;
  communicatedToLead: string;
  communicatedToOnshore: string;
  status: string;
}

const emptyRow = (): BlockLeaveEntry => ({
  id: Date.now().toString(),
  name: "",
  backupPerson: "",
  startDate: "",
  endDate: "",
  quarter: "",
  communicatedToLead: "No",
  communicatedToOnshore: "No",
  status: "Requested",
});

const Field = ({ label, value, children, isReadOnly, className }: { label: string; value?: string | number; children?: React.ReactNode; isReadOnly: boolean; className?: string }) => (
  <div className={`p-4 rounded-xl border border-orange-500/20 bg-orange-500/5 dark:bg-orange-950/10 space-y-1.5 transition-all hover:border-orange-500/40 ${className || ""}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">{label}</p>
    {isReadOnly ? (
      <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
        {value !== undefined && value !== "" ? String(value) : "—"}
      </p>
    ) : (
      <div className="mt-1">{children}</div>
    )}
  </div>
);

export default function BlockLeaveTab({ data, onUpdate, employeeId, readOnly }: { data: any[]; onUpdate: () => void; employeeId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);
  const [records, setRecords] = useState<BlockLeaveEntry[]>(data || []);

  const addRow = () => setRecords([...records, emptyRow()]);
  const removeRow = (id: string) => setRecords(records.filter((r) => r.id !== id));
  const updateRow = (id: string, field: keyof BlockLeaveEntry, value: string) =>
    setRecords(records.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${employeeId}/blockLeaves`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Block leaves saved!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const YesNo = ({ id, field, value }: { id: string; field: keyof BlockLeaveEntry; value: string }) => (
    <div className="flex rounded-lg border overflow-hidden max-w-[120px] border-orange-500/20 bg-background/50">
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={isReadOnly}
          onClick={() => updateRow(id, field, opt)}
          className={`flex-1 px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === opt
              ? opt === "Yes"
                ? "bg-orange-600 text-white"
                : "bg-muted text-muted-foreground"
              : "text-muted-foreground hover:bg-muted/50"
          } ${isReadOnly ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-orange-500/10">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></span> Block Leave
          </h3>
          <p className="text-xs text-muted-foreground">Plan extended leave periods by quarter</p>
        </div>
        {!isReadOnly && (
          <Button onClick={addRow} variant="outline" size="sm" className="border-orange-500/30 text-orange-600 dark:text-orange-400 font-semibold hover:bg-orange-500/10">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Block Leave
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground text-sm bg-orange-500/5 border-orange-500/20">
            No block leaves planned.{!isReadOnly && ' Click "Add Block Leave" to start.'}
          </div>
        ) : (
          records.map((r, i) => (
            <div key={r.id} className="border border-l-4 border-l-orange-500 border-orange-500/20 rounded-2xl p-6 space-y-5 bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b pb-3 border-orange-500/10">
                <span className="text-sm font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                  <CalendarRange className="w-4.5 h-4.5" /> Block Leave #{i + 1}
                </span>
                {!isReadOnly && (
                  <Button variant="ghost" size="icon" onClick={() => removeRow(r.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name / Purpose" value={r.name} isReadOnly={isReadOnly}>
                  <Input value={r.name} onChange={(e) => updateRow(r.id, "name", e.target.value)} placeholder="e.g. Vacation" className="text-sm focus-visible:ring-orange-500 border-orange-500/20" />
                </Field>
                <Field label="Backup Person" value={r.backupPerson} isReadOnly={isReadOnly}>
                  <Input value={r.backupPerson} onChange={(e) => updateRow(r.id, "backupPerson", e.target.value)} placeholder="Backup person name" className="text-sm focus-visible:ring-orange-500 border-orange-500/20" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Start Date" value={r.startDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={r.startDate} onChange={(e) => updateRow(r.id, "startDate", e.target.value)} className="text-sm focus-visible:ring-orange-500 border-orange-500/20" />
                </Field>
                <Field label="End Date" value={r.endDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={r.endDate} onChange={(e) => updateRow(r.id, "endDate", e.target.value)} className="text-sm focus-visible:ring-orange-500 border-orange-500/20" />
                </Field>
                <Field label="Quarter" value={r.quarter} isReadOnly={isReadOnly}>
                  <select
                    value={r.quarter}
                    onChange={(e) => updateRow(r.id, "quarter", e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 border-orange-500/20"
                  >
                    <option value="">Select Quarter</option>
                    {QUARTERS.map((q) => <option key={q}>{q}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Communicated to Lead" value={r.communicatedToLead} isReadOnly={isReadOnly}>
                  <YesNo id={r.id} field="communicatedToLead" value={r.communicatedToLead} />
                </Field>
                <Field label="Communicated to Onshore" value={r.communicatedToOnshore} isReadOnly={isReadOnly}>
                  <YesNo id={r.id} field="communicatedToOnshore" value={r.communicatedToOnshore} />
                </Field>
                <Field label="Status" value={r.status} isReadOnly={isReadOnly}>
                  <select
                    value={r.status}
                    onChange={(e) => updateRow(r.id, "status", e.target.value)}
                    className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 border-orange-500/20"
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {isReadOnly && r.status && (
                <div className="flex justify-end pt-2">
                  <Badge variant={statusColor[r.status] as any} className="px-3 py-1 font-semibold text-xs">{r.status}</Badge>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {QUARTERS.map((q) => {
            const qLeaves = records.filter((r) => r.quarter === q);
            return (
              <div key={q} className="border border-l-4 border-l-orange-500 rounded-2xl p-4 text-center bg-card hover:shadow-md transition-shadow border-orange-500/10 bg-orange-500/[0.02]">
                <p className="text-xs font-bold text-muted-foreground uppercase">{q.split(" ")[0]}</p>
                <p className="text-2xl font-black text-orange-600 mt-1">{qLeaves.length}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">block leave(s)</p>
              </div>
            );
          })}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t border-orange-500/10">
          <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white px-5">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Block Leaves
          </Button>
        </div>
      )}
    </div>
  );
}
