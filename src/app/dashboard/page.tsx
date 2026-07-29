"use client";

import { motion } from 'framer-motion';
import { Users, CreditCard, Gamepad2, ArrowRight, IndianRupee, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
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
      color: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-500",
      borderColor: "border-green-500/20",
    },
    {
      title: "Total Registrations",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      href: "/dashboard/users",
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Verified Payments",
      value: stats.verifiedUsers.toLocaleString(),
      icon: CheckCircle2,
      href: "/dashboard/payments",
      color: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toLocaleString(),
      icon: Clock,
      href: "/dashboard/payments",
      color: "from-yellow-500/20 to-amber-500/10",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500/20",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-white/60">Real-time system metrics and activity feed.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} variants={item}>
              <Link href={card.href}>
                <div className={`group relative p-5 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col justify-between`}>
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2.5 rounded-xl bg-black/20 ${card.iconColor} backdrop-blur-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="p-1.5 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-3.5 h-3.5 text-white/70" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">{card.title}</h3>
                    {loading ? (
                      <div className="h-9 w-20 bg-white/10 rounded animate-pulse" />
                    ) : (
                      <span className="text-3xl font-bold text-white tracking-tight">{card.value}</span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Registrations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-500" />
            Recent Registrations
          </h2>
          <Link href="/dashboard/users" className="text-xs text-yellow-500 hover:text-yellow-400 font-bold uppercase tracking-widest transition-colors">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))
          ) : recentUsers.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm font-bold uppercase tracking-widest">
              No registrations yet
            </div>
          ) : (
            recentUsers.map((user, index) => (
              <div key={index} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 font-bold text-sm shrink-0">
                  {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user.full_name}</p>
                  <p className="text-white/40 text-xs truncate">{user.team_name} • {user.time_slot}</p>
                </div>
                <div className="shrink-0">
                  {user.payment_status === 'verified' ? (
                    <span className="text-green-500 bg-green-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Paid</span>
                  ) : (
                    <span className="text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>
                  )}
                </div>
                <div className="text-white/30 text-xs shrink-0">
                  {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
