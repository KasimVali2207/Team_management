"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarOff,
  Phone,
  GraduationCap,
  Presentation,
  FileText,
  FileBarChart,
  Settings,
  LogOut,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLead = user?.role === 'Lead';

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ...(isLead ? [{ name: 'Team Members', href: '/dashboard/team', icon: Users }] : []),
    { name: 'Leave Plans', href: '/dashboard/leave-plans', icon: Calendar },
    { name: 'Block Leave', href: '/dashboard/block-leave', icon: CalendarOff },
    { name: 'OnCall', href: '/dashboard/oncall', icon: Phone },
    { name: 'Training & Certs', href: '/dashboard/training', icon: GraduationCap },
    { name: 'Demo Sessions', href: '/dashboard/demo-sessions', icon: Presentation },
    { name: 'Monthly Updates', href: '/dashboard/monthly-updates', icon: FileText },
    ...(isLead ? [{ name: 'Reports', href: '/dashboard/reports', icon: FileBarChart }] : []),
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur-xl border-r border-border/40">
      {/* Sidebar Header */}
      <div className="flex h-[68px] items-center justify-between border-b border-border/20 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
            <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-widest text-foreground bg-clip-text">TMP</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nav List */}
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="grid gap-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {/* Active side indicator glow */}
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full bg-primary" />
                )}
                
                <Icon className={cn(
                  "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Info & Logout */}
      <div className="p-4 mt-auto border-t border-border/20 bg-background/50 backdrop-blur-sm">
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 rounded-xl" 
          onClick={() => logout()}
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background md:block md:w-64 flex-shrink-0 z-20">
        <SidebarContent />
      </div>

      {/* Mobile Drawer (visible only when isOpen is true on mobile) */}
      <div className={cn(
        "fixed inset-0 z-50 flex md:hidden transition-all duration-300",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={onClose}
        />

        {/* Sidebar panel sliding in */}
        <div className={cn(
          "relative flex w-full max-w-[280px] h-full flex-col transition-transform duration-300 ease-in-out z-10",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <SidebarContent />
        </div>
      </div>
    </>
  );
}

