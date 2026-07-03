"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, CalendarDays, List, Clock, FileEdit } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_OPTIONS = ["Planned","Approved","Rejected","Completed","Cancelled"];
const statusColor: Record<string, string> = { Planned:"secondary", Approved:"default", Rejected:"destructive", Completed:"outline", Cancelled:"secondary" };
type ViewMode = "table"|"monthly"|"upcoming";

interface LeaveEntry { id:string; month:string; startDate:string; endDate:string; leaveDays:number; backupPerson:string; status:string; remarks:string; }
const emptyRow = ():LeaveEntry => ({ id:Date.now().toString(), month:"", startDate:"", endDate:"", leaveDays:0, backupPerson:"", status:"Planned", remarks:"" });

const Field = ({ label, value, children, isReadOnly, className }: { label:string; value?:string|number; children?:React.ReactNode; isReadOnly:boolean; className?:string }) => (
  <div className={`p-4 rounded-xl border border-green-500/20 bg-green-500/5 dark:bg-green-950/10 space-y-1.5 transition-all hover:border-green-500/40 ${className || ""}`}>
    <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">{label}</p>
    {isReadOnly ? (
      <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
        {value !== undefined && value !== "" ? String(value) : "—"}
      </p>
    ) : (
      <div className="mt-1">{children}</div>
    )}
  </div>
);

export default function LeavePlansTab({ data, onUpdate, employeeId, readOnly }: { data:any[]; onUpdate:()=>void; employeeId:string; readOnly?:boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>("table");
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);
  const [leaves, setLeaves] = useState<LeaveEntry[]>(data || []);

  const addRow = () => setLeaves([...leaves, emptyRow()]);
  const removeRow = (id:string) => setLeaves(leaves.filter(l => l.id !== id));
  const updateRow = (id:string, field:keyof LeaveEntry, value:any) => setLeaves(leaves.map(l => l.id===id ? {...l,[field]:value} : l));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/employees/${employeeId}/leavePlans`, { method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(leaves), credentials:"include" });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Leave plans saved!"); onUpdate();
    } catch(err:any) { toast.error(err.message); } finally { setLoading(false); }
  };

  const today = new Date();
  const upcoming = leaves.filter(l => l.startDate && new Date(l.startDate) >= today);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-green-500/10">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span> Leave Plans
          </h3>
          <p className="text-xs text-muted-foreground">Manage your monthly and upcoming holiday calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden p-0.5 bg-muted/40 border-green-500/20">
            {([["table",<List className="h-3.5 w-3.5"/>,"List"],["monthly",<CalendarDays className="h-3.5 w-3.5"/>,"Calendar"],["upcoming",<Clock className="h-3.5 w-3.5"/>,"Upcoming"]] as any[]).map(([mode,icon,label]) => (
              <button key={mode} onClick={()=>setView(mode)} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${view===mode?"bg-green-600 text-white shadow-sm":"text-muted-foreground hover:bg-muted"}`}>{icon}{label}</button>
            ))}
          </div>
          {!isReadOnly && <Button onClick={addRow} variant="outline" size="sm" className="border-green-500/30 hover:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold"><Plus className="mr-1.5 h-3.5 w-3.5"/>Add Leave</Button>}
        </div>
      </div>

      {/* CARD LIST VIEW */}
      {view === "table" && (
        <div className="space-y-6">
          {leaves.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl text-muted-foreground text-sm bg-green-500/5 border-green-500/20">No leave plans yet.{!isReadOnly && " Click \"Add Leave\" to create one."}</div>
          ) : leaves.map((leave, i) => (
            <div key={leave.id} className="border border-l-4 border-l-green-500 border-green-500/20 rounded-2xl p-6 space-y-5 bg-card hover:shadow-lg transition-all duration-300 relative overflow-hidden">
              <div className="flex items-center justify-between border-b pb-3 border-green-500/10">
                <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2"><FileEdit className="w-4.5 h-4.5"/> Leave Entry #{i+1}</span>
                {!isReadOnly && <Button variant="ghost" size="icon" onClick={()=>removeRow(leave.id)} className="text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"><Trash2 className="h-4 w-4"/></Button>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Month" value={leave.month} isReadOnly={isReadOnly}>
                  <select value={leave.month} onChange={e=>updateRow(leave.id,"month",e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 border-green-500/20">
                    <option value="">Select month</option>
                    {MONTHS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Start Date" value={leave.startDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={leave.startDate} onChange={e=>updateRow(leave.id,"startDate",e.target.value)} className="text-sm focus-visible:ring-green-500 border-green-500/20"/>
                </Field>
                <Field label="End Date" value={leave.endDate} isReadOnly={isReadOnly}>
                  <Input type="date" value={leave.endDate} onChange={e=>updateRow(leave.id,"endDate",e.target.value)} className="text-sm focus-visible:ring-green-500 border-green-500/20"/>
                </Field>
                <Field label="Leave Days" value={leave.leaveDays} isReadOnly={isReadOnly}>
                  <Input type="number" step="any" value={leave.leaveDays} onChange={e=>updateRow(leave.id,"leaveDays",Number(e.target.value))} min={0} className="text-sm focus-visible:ring-green-500 border-green-500/20"/>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Backup Person" value={leave.backupPerson} isReadOnly={isReadOnly}>
                  <Input value={leave.backupPerson} onChange={e=>updateRow(leave.id,"backupPerson",e.target.value)} placeholder="Backup person name" className="text-sm focus-visible:ring-green-500 border-green-500/20"/>
                </Field>
                <Field label="Status" value={leave.status} isReadOnly={isReadOnly}>
                  <select value={leave.status} onChange={e=>updateRow(leave.id,"status",e.target.value)} className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500 border-green-500/20">
                    {STATUS_OPTIONS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Remarks" value={leave.remarks} isReadOnly={isReadOnly} className="bg-green-500/[0.03] border-l-2 border-l-green-500">
                <textarea value={leave.remarks} onChange={e=>updateRow(leave.id,"remarks",e.target.value)} rows={3} placeholder="Any notes or remarks about this leave..." className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-green-500 border-green-500/20"/>
              </Field>

              {isReadOnly && leave.status && (
                <div className="flex justify-end pt-2">
                  <Badge variant={statusColor[leave.status] as any} className="px-3 py-1 font-semibold text-xs">{leave.status}</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MONTHLY VIEW */}
      {view === "monthly" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MONTHS.map(month => {
            const ml = leaves.filter(l=>l.month===month);
            return (
              <div key={month} className={`border border-l-4 border-l-green-500 rounded-2xl p-5 space-y-3 bg-card hover:shadow-md transition-all duration-200 border-green-500/10 ${ml.length?"shadow-sm bg-green-500/[0.02]":""}`}>
                <p className="text-sm font-bold text-foreground/90">{month}</p>
                {ml.length===0 ? <p className="text-xs text-muted-foreground italic">No leave</p> : ml.map(l=>(
                  <div key={l.id} className="text-xs p-3 rounded-xl border bg-green-500/5 border-green-500/20 space-y-1.5">
                    <div className="flex justify-between items-center"><span className="font-bold text-foreground">{l.leaveDays} day(s)</span><Badge variant={statusColor[l.status] as any} className="text-[9px] px-2 py-0">{l.status}</Badge></div>
                    {l.backupPerson && <p className="text-muted-foreground">Backup: <span className="font-semibold text-foreground/80">{l.backupPerson}</span></p>}
                    {l.remarks && <p className="text-muted-foreground/80 break-words line-clamp-2 italic">"{l.remarks}"</p>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* UPCOMING */}
      {view === "upcoming" && (
        <div className="space-y-3">
          {upcoming.length===0 ? <p className="text-center text-muted-foreground py-10 text-sm">No upcoming leaves.</p>
          : upcoming.sort((a,b)=>new Date(a.startDate).getTime()-new Date(b.startDate).getTime()).map(l=>(
            <div key={l.id} className="flex items-start justify-between border border-l-4 border-l-green-500 border-green-500/20 rounded-2xl p-5 gap-4 bg-card hover:shadow-md transition-all">
              <div className="space-y-2 flex-1">
                <p className="font-bold text-sm text-foreground/90">{l.month} — {l.leaveDays} day(s)</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <p>Duration: <span className="font-semibold text-foreground">{l.startDate || "—"}</span> to <span className="font-semibold text-foreground">{l.endDate || "—"}</span></p>
                  {l.backupPerson && <p>Backup: <span className="font-semibold text-foreground">{l.backupPerson}</span></p>}
                </div>
                {l.remarks && <p className="text-xs text-muted-foreground italic bg-green-500/5 p-2.5 rounded-lg border-l-2 border-l-green-500 break-words border-green-500/20">"{l.remarks}"</p>}
              </div>
              <Badge variant={statusColor[l.status] as any}>{l.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t border-green-500/10">
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 shadow-sm text-white px-5">
            {loading?<Loader2 className="mr-2 h-4 w-4 animate-spin"/>:<Save className="mr-2 h-4 w-4"/>}Save Leave Plans
          </Button>
        </div>
      )}
    </div>
  );
}
