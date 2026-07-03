"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, UserPlus, Eye, EyeOff, Copy, Check } from "lucide-react";

export function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    domain: "",
    doj: new Date().toISOString().split("T")[0],
    yearsOfExperience: 0,
  });

  const queryClient = useQueryClient();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create member");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(
        `✅ ${form.name} added! Share credentials → Username: ${data.username} · Password: ${data.password}`,
        { duration: 10000 }
      );
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setOpen(false);
      setForm({
        name: "",
        username: "",
        password: "",
        domain: "",
        doj: new Date().toISOString().split("T")[0],
        yearsOfExperience: 0,
      });
      setShowPassword(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    }));
  };

  const isValid = form.name.trim() && form.username.trim() && form.password.trim().length >= 6;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <UserPlus className="h-4 w-4" /> Add Member
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
          <DialogDescription>
            Set up the member's login credentials below. Share the username and password with them directly.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Name + Username */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Ravi Kumar"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Login Username <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. ravi.kumar"
                />
                {form.username && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(form.username)}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                    title="Copy username"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Set a strong password (min. 6 chars)"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password && form.password.length < 6 && (
              <p className="text-xs text-destructive">Password must be at least 6 characters</p>
            )}
          </div>

          {/* Credentials summary box */}
          {form.username && form.password && form.password.length >= 6 && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
              <p className="text-xs font-semibold text-primary mb-2">🔑 Member Login Credentials (share these)</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono font-medium">{form.username}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Password:</span>
                <span className="font-mono font-medium">{showPassword ? form.password : "••••••••"}</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(`Username: ${form.username}\nPassword: ${form.password}`)}
                className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied!" : "Copy both to clipboard"}
              </button>
            </div>
          )}

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="domain" name="domain" value={form.domain} onChange={handleChange} placeholder="e.g. Engineering" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input id="yearsOfExperience" name="yearsOfExperience" type="number" step="any" value={form.yearsOfExperience} onChange={handleChange} min={0} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doj">Date of Joining</Label>
            <Input id="doj" name="doj" type="date" value={form.doj} onChange={handleChange} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => mutate()} disabled={isPending || !isValid}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
