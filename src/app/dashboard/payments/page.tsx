"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { CreditCard, Search, Loader2, CheckCircle2, Clock } from 'lucide-react';

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  bgmi_id: string;
  mobile_number: string;
  upi_id: string; // Kept for backwards compatibility
  cashfree_order_id?: string;
  payment_status?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('id, created_at, full_name, bgmi_id, mobile_number, upi_id, cashfree_order_id, payment_status')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  };

  const filteredPayments = payments.filter(p => 
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.cashfree_order_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.upi_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.mobile_number?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-500" />
            Payment Records
          </h1>
          <p className="text-white/50 text-sm mt-1">Track and verify tournament registration payments</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/40" />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-green-500/50 transition-colors text-sm"
            placeholder="Search by name, UPI ID, phone..."
          />
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/90 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Player Name</th>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Mobile Number</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 font-bold uppercase tracking-widest">
                    No payment records found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={payment.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{payment.full_name}</div>
                      <div className="text-xs text-white/50">ID: {payment.bgmi_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded inline-block">
                        {payment.cashfree_order_id || payment.upi_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {payment.mobile_number}
                    </td>
                    <td className="px-6 py-4">
                      {payment.payment_status === 'verified' ? (
                        <span className="flex items-center gap-1.5 text-green-500 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider w-max">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-white/50">
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold uppercase tracking-widest text-green-500 hover:text-green-400 border border-green-500/30 hover:border-green-400 hover:bg-green-500/10 px-3 py-1.5 rounded transition-all">
                        Verify
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
