"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, CreditCard, LayoutDashboard, LogOut, Gamepad2, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Total Users', href: '/dashboard/users', icon: Users },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Matches', href: '/dashboard/matches', icon: Gamepad2 },
    { name: 'Upcoming', href: '/dashboard/upcoming-tournament', icon: Trophy },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-[#111] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0">
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <h2 className="text-xl font-black text-white uppercase tracking-wider">
          Admin <span className="text-yellow-500">Panel</span>
        </h2>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
        >
          {/* comment check */}
          <LogOut className="w-5 h-5  " />
          <span className="font-bold uppercase tracking-widest text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}
