"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Users, ShieldCheck, ChevronLeft, Eye, EyeOff, Sparkles, ArrowRight, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'Lead' | 'Member' | null;

// Animated floating orb
function Orb({ className }: { className: string }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse ${className}`}
      style={{ animationDuration: '4s' }}
    />
  );
}

// Animated grid dot
function GridDots() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: `radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)`,
        backgroundSize: '32px 32px',
      }}
    />
  );
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const { login } = useAuth();

  // For animated greeting
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 3000);
    return () => clearInterval(t);
  }, []);

  const greetings = ['Welcome back', 'Ready to lead', 'Let\'s get started', 'Hello again'];
  const greeting = greetings[tick % greetings.length];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      if (data.user.role !== selectedRole) {
        throw new Error(
          selectedRole === 'Lead'
            ? 'This account is not a Team Lead account.'
            : 'This account is not a Team Member account.'
        );
      }

      toast.success(`Welcome back, ${data.user.username}!`);
      login(data.user);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#090b12]">
      {/* Background ambient orbs */}
      <Orb className="w-[500px] h-[500px] top-[-100px] left-[-150px] bg-blue-600/20" />
      <Orb className="w-[400px] h-[400px] bottom-[-80px] right-[-100px] bg-purple-600/20" />
      <Orb className="w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/10" />
      <GridDots />

      {/* Top brand bar */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm font-bold text-white/80 tracking-widest uppercase">TMP</span>
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md px-5 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
        >
          {/* Inner glow border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none" />

          <div className="relative p-8">
            {/* Header */}
            <div className="text-center mb-8 space-y-2">
              <AnimatePresence mode="wait">
                <motion.p
                  key={tick}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-bold uppercase tracking-widest text-primary"
                >
                  {greeting} ✦
                </motion.p>
              </AnimatePresence>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Team Management Portal
              </h1>
              <p className="text-sm text-white/40">
                {selectedRole
                  ? `Signing in as ${selectedRole === 'Lead' ? 'Team Lead' : 'Team Member'}`
                  : 'Select your role to continue'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: Role Selection ─────────────────────────────── */}
              {!selectedRole && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3"
                >
                  {/* Team Lead */}
                  <button
                    onClick={() => setSelectedRole('Lead')}
                    className="w-full group relative flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/5 hover:border-primary/60 hover:bg-primary/10 transition-all duration-250 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors ring-1 ring-primary/20">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 z-10">
                      <p className="font-bold text-white">Team Lead</p>
                      <p className="text-xs text-white/40 mt-0.5">Full access — manage members & all data</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-primary group-hover:translate-x-1 transition-all z-10" />
                  </button>

                  {/* Team Member */}
                  <button
                    onClick={() => setSelectedRole('Member')}
                    className="w-full group relative flex items-center gap-4 p-5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/60 hover:bg-cyan-500/10 transition-all duration-250 text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/30 transition-colors ring-1 ring-cyan-500/20">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 z-10">
                      <p className="font-bold text-white">Team Member</p>
                      <p className="text-xs text-white/40 mt-0.5">Update your profile, leaves, on-call & more</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all z-10" />
                  </button>

                  {/* Divider info */}
                  <p className="text-center text-[11px] text-white/25 pt-2">
                    🔒 All connections are secure & encrypted
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Login form ─────────────────────────────────── */}
              {selectedRole && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Role badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 ${
                    selectedRole === 'Lead'
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30'
                  }`}>
                    {selectedRole === 'Lead'
                      ? <ShieldCheck className="w-3.5 h-3.5" />
                      : <Users className="w-3.5 h-3.5" />}
                    {selectedRole === 'Lead' ? 'Team Lead' : 'Team Member'}
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    {/* Username */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        {selectedRole === 'Lead' ? 'Lead Username' : 'Your Username'}
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <Input
                          id="username"
                          placeholder={selectedRole === 'Lead' ? 'e.g. lead' : 'e.g. ravi.kumar'}
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          required autoComplete="username" autoFocus
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/60 focus:bg-white/8 transition-colors h-11"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required autoComplete="current-password"
                          className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-primary/60 focus:bg-white/8 transition-colors h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {selectedRole === 'Member' && (
                      <p className="text-xs text-white/30 bg-white/5 border border-white/8 p-3 rounded-xl leading-relaxed">
                        💡 Your credentials were assigned by your Team Lead. Contact them if you need help.
                      </p>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full flex items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 shadow-lg disabled:opacity-60 ${
                        selectedRole === 'Lead'
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/40'
                          : 'bg-cyan-500 text-white hover:bg-cyan-400 shadow-cyan-500/20 hover:shadow-cyan-500/40'
                      }`}
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                  </form>

                  <button
                    onClick={() => { setSelectedRole(null); setUsername(''); setPassword(''); }}
                    className="mt-4 flex items-center gap-1.5 text-sm text-white/30 hover:text-white/70 transition-colors mx-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to role selection
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 mt-6">
          Team Management Portal · Internal Use Only
        </p>
      </div>
    </div>
  );
}
