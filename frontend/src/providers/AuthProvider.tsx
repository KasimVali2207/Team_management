"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  uid: string;
  username: string;
  role: string;
  employeeId: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUserAvatar: (url: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/me`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Not authenticated');
      return res.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      if (pathname === '/login') {
        router.push('/dashboard');
      }
    } else if (!isLoading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [data, isLoading, pathname, router, user]);

  const login = (newUser: User) => {
    setUser(newUser);
    queryClient.setQueryData(['me'], { user: newUser });
    router.push('/dashboard');
  };

  const logout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    queryClient.setQueryData(['me'], null);
    router.push('/login');
  };

  const updateUserAvatar = (url: string) => {
    setUser((prev) => (prev ? { ...prev, avatarUrl: url } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
