"use client";

import { motion } from 'framer-motion';
import { Users, CreditCard, Gamepad2, ArrowRight, IndianRupee, CheckCircle2, Clock, TrendingUp, Activity, Sparkles, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all registrations
        const { data: registrations, count: totalCount } = await supabase
          .from('registrations')
          .select('payment_status, payment_amount', { count: 'exact' });

        // Calculate stats from registrations
        let verifiedCount = 0;
        let pendingCount = 0;
        let totalRevenue = 0;

        if (registrations) {
          registrations.forEach((r: any) => {
            if (r.payment_status === 'verified') {
              verifiedCount++;
              totalRevenue += (Number(r.payment_amount) || 0);
            } else {
              pendingCount++;
            }
          });
        }

        // Fetch 5 most recent registrations
        const { data: recent } = await supabase
          .from('registrations')
          .select('full_name, team_name, time_slot, payment_status, created_at')
          .eq('payment_status', 'verified')
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch active game
        try {
          const { data: config } = await supabase
            .from('active_game_config')
            .select('active_game_id')
            .eq('id', 1)
            .single();
          
          if (config?.active_game_id) {
            const { data: game } = await supabase
              .from('games')
              .select('*, game_categories!games_category_id_fkey(*)')
              .eq('id', config.active_game_id)
              .single();
            setActiveGame(game);
          }
        } catch (e) {
          // active_game_config table may not exist yet
        }

        setStats({
          totalUsers: totalCount || 0,
          verifiedUsers: verifiedCount,
          totalRevenue: totalRevenue,
          pendingPayments: pendingCount,
        });
        setRecentUsers(recent || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const cards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      href: "/dashboard/payments",
      gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      glowColor: "rgba(34, 197, 94, 0.15)",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Registrations",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      href: "/dashboard/users",
      gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      iconBg: "bg-blue-500/10 text-blue-400",
      glowColor: "rgba(59, 130, 246, 0.15)",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Verified Payments",
      value: stats.verifiedUsers.toLocaleString(),
      icon: CheckCircle2,
      href: "/dashboard/payments",
      gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
      iconBg: "bg-purple-500/10 text-purple-400",
      glowColor: "rgba(168, 85, 247, 0.15)",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toLocaleString(),
      icon: Clock,
      href: "/dashboard/payments",
      gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-400",
      glowColor: "rgba(245, 158, 11, 0.15)",
      trend: "-3%",
      trendUp: false,
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            <span className="text-[11px] text-white/30 font-semibold uppercase tracking-[0.2em]">Dashboard Overview</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black font-heading text-white tracking-tight"
          >
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Admin</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 text-sm mt-1"
          >
            Here&apos;s what&apos;s happening with your platform today.
          </motion.p>
        </div>

        {/* Active Game Indicator */}
        {activeGame && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl glassmorphism border border-white/[0.08]"
          >
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: activeGame.game_primary_color || activeGame.game_categories?.primary_color || '#A855F7' }} />
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider">Active Game</p>
              <p className="text-sm font-bold text-white">{activeGame.name}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Stat Cards */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} variants={item as any}>
              <Link href={card.href} className="block h-full group">
                <div 
                  className="relative p-5 rounded-2xl glassmorphism overflow-hidden h-full flex flex-col justify-between hover:border-white/[0.12] transition-all duration-500 cursor-pointer"
                  style={{ 
                    boxShadow: `0 0 0 0 transparent`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 8px 32px ${card.glowColor}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 0 transparent`;
                  }}
                >
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Corner glow */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.05] group-hover:scale-150 transition-all duration-700" />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-2.5 rounded-xl ${card.iconBg} backdrop-blur-sm border border-white/[0.06]`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={`flex items-center gap-1 text-[11px] font-semibold ${card.trendUp ? 'text-emerald-400' : 'text-amber-400'}`}>
                      <TrendingUp className={`w-3 h-3 ${!card.trendUp && 'rotate-180'}`} />
                      {card.trend}
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <p className="text-white/40 text-xs font-medium mb-1">{card.title}</p>
                    {loading ? (
                      <div className="h-9 w-24 bg-white/5 rounded-lg animate-pulse" />
                    ) : (
                      <span className="text-3xl font-black font-heading text-white tracking-tight">{card.value}</span>
                    )}
                  </div>

                  {/* Bottom hover arrow */}
                  <div className="absolute bottom-4 right-4 p-1.5 rounded-lg bg-white/0 group-hover:bg-white/[0.05] transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white/50" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions + Recent Registrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <div className="glassmorphism rounded-2xl p-5 h-full">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Manage Games', href: '/dashboard/games', icon: Gamepad2, color: 'purple' },
                { label: 'View Payments', href: '/dashboard/payments', icon: CreditCard, color: 'emerald' },
                { label: 'Tournament Setup', href: '/dashboard/upcoming-tournament', icon: Trophy, color: 'amber' },
                { label: 'User Management', href: '/dashboard/users', icon: Users, color: 'blue' },
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group cursor-pointer">
                    <div className={`p-2 rounded-lg bg-${action.color}-500/10 text-${action.color}-400`}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-white/60 group-hover:text-white/90 transition-colors">{action.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/20 ml-auto group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <div className="glassmorphism rounded-2xl overflow-hidden">
            {/* Subtle top gradient line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            
            <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                Recent Registrations
              </h3>
              <Link href="/dashboard/users" className="flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 font-semibold uppercase tracking-wider transition-colors bg-purple-500/5 px-3 py-1.5 rounded-full border border-purple-500/10 hover:border-purple-500/20 hover:bg-purple-500/10">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-36 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-white/[0.03] rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : recentUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 text-white/15" />
                  </div>
                  <p className="text-white/30 text-sm font-medium">No registrations yet</p>
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <div key={index} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-all relative overflow-hidden group/row cursor-default">
                    {/* Hover sweep */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/[0.02] to-transparent -translate-x-full group-hover/row:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/15 to-indigo-500/10 border border-purple-500/15 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0 relative z-10">
                      {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    
                    <div className="flex-1 min-w-0 relative z-10">
                      <p className="text-white/90 font-semibold text-sm truncate">{user.full_name}</p>
                      <p className="text-white/35 text-xs truncate flex items-center gap-1.5">
                        <span className="text-white/50">{user.team_name}</span> 
                        <span className="w-1 h-1 rounded-full bg-white/15" /> 
                        {user.time_slot}
                      </p>
                    </div>
                    
                    <div className="shrink-0 relative z-10 text-right">
                      {user.payment_status === 'verified' ? (
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 justify-end mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                          <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider">Pending</span>
                        </div>
                      )}
                      <div className="text-white/20 text-[10px] font-medium">
                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
