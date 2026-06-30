"use client";

import { motion } from 'framer-motion';
import { Users, CreditCard, Gamepad2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAmount: 0,
    totalMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total users (count of registrations)
        const { count: usersCount } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true });

        // Fetch successful payments for total amount (assuming payments table or registrations with success status)
        // Adjust this logic based on actual db schema, for now using a placeholder calculation or 0
        const { data: payments } = await supabase
          .from('registrations')
          .select('payment_status');
        
        // Example: calculating amount if each registration is assumed 50rs, or if there's a specific amount field.
        // For now, let's use a static placeholder for Amount and Matches if actual schema is complex, 
        // or just calculate based on successful payments if known.
        let amount = 0;
        if (payments) {
          const successfulPayments = payments.filter(p => p.payment_status === 'SUCCESS' || p.payment_status === 'SUCCESSFUL');
          // Assuming 50 per successful payment as a placeholder calculation, replace with actual logic
          amount = successfulPayments.length * 50; 
        }

        setStats({
          totalUsers: usersCount || 0,
          totalAmount: amount,
          totalMatches: 0, // Placeholder for total matches
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Total Amount",
      value: `₹${stats.totalAmount.toLocaleString()}`,
      icon: CreditCard,
      href: "/dashboard/payments",
      color: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-500",
      borderColor: "border-green-500/20",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      href: "/dashboard/users",
      color: "from-blue-500/20 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Total Matches",
      value: stats.totalMatches.toLocaleString(),
      icon: Gamepad2,
      href: "/dashboard/matches",
      color: "from-purple-500/20 to-fuchsia-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
    }
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
        <p className="text-white/60">Monitor your system metrics and navigate to detailed reports.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} variants={item}>
              <Link href={card.href}>
                <div className={`group relative p-6 rounded-2xl bg-gradient-to-br ${card.color} border ${card.borderColor} backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full flex flex-col justify-between`}>
                  {/* Background Glow */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-xl bg-black/20 ${card.iconColor} backdrop-blur-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-4 h-4 text-white/70" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white/60 text-sm font-medium mb-2">{card.title}</h3>
                    <div className="flex items-end gap-3">
                      {loading ? (
                        <div className="h-10 w-24 bg-white/10 rounded animate-pulse" />
                      ) : (
                        <span className="text-4xl font-bold text-white tracking-tight">{card.value}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
