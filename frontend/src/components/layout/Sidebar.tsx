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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
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

  return (
    <div className="hidden border-r bg-background md:block md:w-64 flex-shrink-0">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="text-xl font-bold tracking-tight">TMP</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-4 py-4">
          <nav className="grid items-start gap-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 mt-auto border-t">
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={() => logout()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
