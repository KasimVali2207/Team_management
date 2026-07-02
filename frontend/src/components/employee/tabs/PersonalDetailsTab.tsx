"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Loader2, Save, User, Shield, Briefcase } from "lucide-react";

interface PersonalDetailsTabProps {
  data: any;
  onUpdate: () => void;
  employeeId: string;
  readOnly?: boolean;
}

export default function PersonalDetailsTab({ data, onUpdate, employeeId, readOnly }: PersonalDetailsTabProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isReadOnly = readOnly !== undefined ? readOnly : (user?.role !== "Lead" && user?.uid !== employeeId);

  const [form, setForm] = useState<Record<string, any>>(data || {});

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: key === "yearsOfExperience" ? Number(value) : value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees/${employeeId}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lastUpdated: new Date().toISOString() }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success("Personal details saved!");
      onUpdate();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const basicFields = [
    { key: "uid", label: "UID", readOnly: true, placeholder: "Auto-assigned" },
    { key: "name", label: "Name", placeholder: "Full name" },
    { key: "domain", label: "Domain", placeholder: "e.g. Engineering" },
    { key: "doj", label: "Date of Joining (DOJ)", type: "date" },
    { key: "yearsOfExperience", label: "Years of Experience", type: "number", step: "any", placeholder: "0" },
    { key: "functions", label: "Functions", placeholder: "e.g. Development, Testing" },
  ];

  const organizationalFields = [
    { key: "tribe", label: "Tribe", placeholder: "e.g. Core Platform" },
    { key: "squadName", label: "Squad Name", placeholder: "e.g. Phoenix" },
    { key: "scrumMaster", label: "Scrum Master", placeholder: "Name of Scrum Master" },
    { key: "chapterLead", label: "Chapter Lead", placeholder: "Name of Chapter Lead" },
    { key: "copReferent", label: "COP Referent", placeholder: "Name of COP Referent" },
  ];

  const operationalFields = [
    { key: "teamPocOnshore", label: "Team POC-Onshore", placeholder: "Name of Onshore POC" },
    { key: "assignmentGroupManager", label: "Assignment Group Manager", placeholder: "Manager name" },
    { key: "hvd", label: "HVD", placeholder: "e.g. Yes / No" },
    { key: "assignmentGroup", label: "Assignment Group", placeholder: "e.g. Dev-Core" },
  ];

  const totalFillable = basicFields.length + organizationalFields.length + operationalFields.length - 1; // exclude uid
  const filledCount = [...basicFields, ...organizationalFields, ...operationalFields].filter(
    (f) => f.key !== "uid" && form[f.key] !== undefined && form[f.key] !== ""
  ).length;
  
  const completion = Math.round((filledCount / totalFillable) * 100);

  const renderField = (field: any, themeClass: string, focusRingClass: string) => (
    <div key={field.key} className={`p-4 rounded-xl border ${themeClass} space-y-1.5 transition-all hover:shadow-sm`}>
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{field.label}</Label>
      {isReadOnly ? (
        <p className="text-sm font-semibold text-foreground/90 break-words whitespace-pre-wrap min-h-[20px]">
          {form[field.key] !== undefined && form[field.key] !== "" ? String(form[field.key]) : "—"}
        </p>
      ) : (
        <Input
          type={field.type || "text"}
          step={field.step}
          value={form[field.key] ?? ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          disabled={field.readOnly}
          placeholder={field.placeholder}
          className={field.readOnly ? "bg-muted text-muted-foreground cursor-not-allowed border-none" : `bg-background border-input focus-visible:ring-1 ${focusRingClass}`}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header and Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b">
        <div>
          <h3 className="text-lg font-bold text-foreground">Personal Profile</h3>
          <p className="text-xs text-muted-foreground">Complete your profile details to keep team logs updated</p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {completion}% Done
          </span>
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden border">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Identity & Roles (Blue Theme) */}
        <div className="border border-l-4 border-l-blue-500 rounded-2xl p-6 space-y-5 bg-card shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 pb-2 border-b border-blue-500/10">
            <User className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="font-bold text-sm text-blue-600 dark:text-blue-400">Identity & Role Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {basicFields.map((f) => renderField(f, "border-blue-500/20 bg-blue-500/5 text-blue-900 dark:text-blue-200", "focus-visible:ring-blue-500"))}
          </div>
        </div>

        {/* Card 2: Organizational Alignment (indigo Theme) */}
        <div className="border border-l-4 border-l-indigo-500 rounded-2xl p-6 space-y-5 bg-card shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/10">
            <Shield className="h-4.5 w-4.5 text-indigo-500" />
            <h4 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Organizational & Tribe Alignment</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizationalFields.map((f) => renderField(f, "border-indigo-500/20 bg-indigo-500/5 text-indigo-900 dark:text-indigo-200", "focus-visible:ring-indigo-500"))}
          </div>
        </div>

        {/* Card 3: Operational Assignments (Violet Theme) */}
        <div className="border border-l-4 border-l-violet-500 rounded-2xl p-6 space-y-5 bg-card shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 pb-2 border-b border-violet-500/10">
            <Briefcase className="h-4.5 w-4.5 text-violet-500" />
            <h4 className="font-bold text-sm text-violet-600 dark:text-violet-400">Operational Groups & POC Details</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationalFields.map((f) => renderField(f, "border-violet-500/20 bg-violet-500/5 text-violet-900 dark:text-violet-200", "focus-visible:ring-violet-500"))}
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex justify-end pt-3 border-t">
          <Button onClick={handleSave} disabled={loading} className="px-5 shadow-sm">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile Details
          </Button>
        </div>
      )}
    </div>
  );
}
