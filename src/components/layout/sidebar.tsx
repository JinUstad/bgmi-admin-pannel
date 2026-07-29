"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, CreditCard, LayoutDashboard, LogOut, Gamepad2, Trophy, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function Sidebar({ isOpen = true, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Total Users', href: '/dashboard/users', icon: Users },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Team Battles', href: '/dashboard/team-battles', icon: Gamepad2 },
    { name: 'Room ID Share', href: '/dashboard/room-id-share', icon: Users },
    { name: 'Upcoming', href: '/dashboard/upcoming-tournament', icon: Trophy },
    { name: 'Live Streaming', href: '/dashboard/live-stream', icon: Trophy },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className={`bg-[#111] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20 w-64'}`}>
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 relative">
        <h2 className={`text-xl font-black text-white uppercase tracking-wider whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 md:hidden'}`}>
          Admin <span className="text-yellow-500">Panel</span>
        </h2>
        {setIsOpen && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute -right-3 top-6 bg-yellow-500 text-black p-1 rounded-full border-4 border-[#0a0a0a] hidden md:block transition-transform ${!isOpen && 'rotate-180'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className={`font-bold uppercase tracking-widest text-xs whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className={`font-bold uppercase tracking-widest text-xs whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden md:hidden'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
