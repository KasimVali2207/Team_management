"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Save, Phone, PhoneOff, History, Trash2 } from "lucide-react";

const STATUS_OPTIONS = ["Active", "Inactive", "On-Call Scheduled", "On-Call Completed"];

const statusColor: Record<string, string> = {
  Active: "default",
  Inactive: "secondary",
  "On-Call Scheduled": "outline",
  "On-Call Completed": "default",
};

interface OnCallData {
  currentStatus: string;
  comments: string;
  history: { date: string; status: string; comments: string }[];
}

export default function OnCallTab({ data, onUpdate, employeeId, readOnly }: { data: any; onUpdate: () => void; employeeId: string; readOnly?: boolean }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);

  const initial: OnCallData =
    Array.isArray(data)
      ? { currentStatus: data[0]?.currentStatus || "Inactive", comments: data[0]?.comments || "", history: data[0]?.history || [] }
      : { currentStatus: data?.currentStatus || "Inactive", comments: data?.comments || "", history: data?.history || [] };

  const [form, setForm] = useState<OnCallData>(initial);

  const persistOnCall = async (updatedData: OnCallData) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${employeeId}/onCall`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      setForm(updatedData);
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Push current state to history before saving
    const historyEntry = {
      date: new Date().toISOString(),
      status: form.currentStatus,
      comments: form.comments,
    };
    const updatedHistory = [historyEntry, ...(form.history || [])].slice(0, 50); // keep last 50
    const payload = { ...form, history: updatedHistory };
    
    await persistOnCall(payload);
    toast.success("OnCall status updated!");
  };

  const handleClearHistory = async () => {
    if (confirm("Are you sure you want to clear the entire On-Call history?")) {
      const payload = { ...form, history: [] };
      await persistOnCall(payload);
      toast.success("OnCall history cleared!");
    }
  };

  const handleDeleteHistoryItem = async (index: number) => {
    const updatedHistory = (form.history || []).filter((_, idx) => idx !== index);
    const payload = { ...form, history: updatedHistory };
    await persistOnCall(payload);
    toast.success("OnCall history entry deleted!");
  };

  return (
    <div className="space-y-6">
      {/* Current Status Box */}
      <div className="border border-l-4 border-l-green-500 rounded-xl p-5 space-y-4 bg-muted/10">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Phone className="h-4.5 w-4.5 text-green-500" />
          <h4 className="font-semibold text-sm text-green-600">Active On-Call status</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            {isReadOnly ? (
              <div className="pt-1">
                <Badge variant={statusColor[form.currentStatus] as any}>{form.currentStatus}</Badge>
              </div>
            ) : (
              <select
                value={form.currentStatus}
                onChange={(e) => setForm({ ...form, currentStatus: e.target.value })}
                className="w-full bg-background border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Comments / Handover Instructions</Label>
          <textarea
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            disabled={isReadOnly}
            rows={3}
            placeholder="Add any on-call notes, incidents handled, handover instructions, or remarks..."
            className="w-full bg-background border rounded-lg px-3 py-2.5 text-sm resize-y min-h-[80px] focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update OnCall Status
          </Button>
        </div>
      )}

      {/* History */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">History Log</h4>
          </div>
          {!isReadOnly && form.history && form.history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2 font-semibold"
              onClick={handleClearHistory}
              disabled={loading}
            >
              Clear History
            </Button>
          )}
        </div>

        {(!form.history || form.history.length === 0) ? (
          <p className="text-sm text-muted-foreground italic pl-6">No history yet. Update your status to start tracking.</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {form.history.map((h, i) => (
              <div key={i} className="group/item flex items-center justify-between gap-4 border-l-2 border-border pl-4 py-2 hover:bg-muted/10 rounded-r-lg transition-colors">
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusColor[h.status] as any} className="text-xs">{h.status}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString()}</span>
                  </div>
                  {h.comments && <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{h.comments}</p>}
                </div>
                {!isReadOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover/item:opacity-100 text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-opacity flex-shrink-0"
                    onClick={() => handleDeleteHistoryItem(i)}
                    disabled={loading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal Label helper to keep it clean
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={`text-xs font-bold uppercase tracking-wider text-muted-foreground ${className || ""}`}>
      {children}
    </label>
  );
}
