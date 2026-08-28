"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, CreditCard, LayoutDashboard, LogOut, Gamepad2, Trophy, 
  Settings, ChevronLeft, Radio, Zap, Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function Sidebar({ isOpen = true, setIsOpen }: { isOpen?: boolean, setIsOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Games', href: '/dashboard/games', icon: Gamepad2 },
    { name: 'Tournament Brackets', href: '/dashboard/brackets', icon: Trophy },
    { name: 'Total Users', href: '/dashboard/users', icon: Users },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Upcoming Matches', href: '/dashboard/upcoming-tournament', icon: Trophy },
    { name: 'Live Streaming', href: '/dashboard/live-stream', icon: Radio },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminAuth');
    router.push('/login');
  };

  return (
    <motion.div 
      initial={false}
      animate={{ 
        width: isOpen ? 272 : 80,
        x: 0 
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-surface-1/80 backdrop-blur-2xl flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-white/[0.06] ${
        !isOpen ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
      } transition-transform duration-300 md:transition-none`}
    >
      {/* Sidebar gradient accent line */}
      <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-purple-500/20 via-indigo-500/10 to-transparent" />
      
      {/* Logo Section */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/[0.06] relative">
        {/* Ambient glow behind logo */}
        <div className="absolute -left-8 -top-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-black font-heading text-white uppercase tracking-wider whitespace-nowrap">
                  XYLO<span className="text-purple-400">ESPORTS</span>
                </h2>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] -mt-0.5">Command Center</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {setIsOpen && (
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`absolute -right-3 top-7 bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-1.5 rounded-full border-[3px] border-surface-0 hidden md:flex items-center justify-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all hover:scale-110 z-20 ${!isOpen && 'rotate-180'}`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
        {isOpen && (
          <p className="text-[10px] text-white/25 font-bold uppercase tracking-[0.25em] px-3 mb-3">Navigation</p>
        )}
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : (pathname === item.href || pathname.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                }`}
            >
              {/* Active indicator background */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/5 border border-purple-500/20"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
              
              {/* Active indicator dot on left */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-dot"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-purple-400 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}

              <div className={`relative z-10 p-1.5 rounded-lg transition-all ${
                isActive 
                  ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]' 
                  : 'text-white/40 group-hover:text-white/70'
              }`}>
                <Icon className="w-[18px] h-[18px]" />
              </div>

              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className={`relative z-10 font-semibold text-[13px] tracking-wide whitespace-nowrap ${
                      isActive ? 'text-white' : ''
                    }`}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-white/[0.06]">
        {/* Admin profile indicator */}
        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 bg-white/[0.02] border border-white/[0.04] ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white/80 truncate">Admin</p>
              <p className="text-[10px] text-emerald-500/80 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse" />
                Online
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10 ${!isOpen && 'justify-center'}`}
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {isOpen && (
            <span className="font-semibold text-[13px] tracking-wide whitespace-nowrap">
              Logout
            </span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
