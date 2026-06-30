"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Search, Loader2 } from 'lucide-react';

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  bgmi_id: string;
  team_name: string;
  mobile_number: string;
  email: string;
  tournament_type: string;
  upi_id: string; // Kept for backwards compatibility
  time_slot: string;
  message: string;
  cashfree_order_id?: string;
  payment_status?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.bgmi_id?.includes(search) ||
    user.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.mobile_number?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-500" />
            Total Users
          </h1>
          <p className="text-white/50 text-sm mt-1">Manage team leaders and tournament registrations</p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/40" />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
            placeholder="Search by name, ID, team, phone..."
          />
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/90 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-bold">Player Info</th>
                <th className="px-6 py-4 font-bold">Team / ID</th>
                <th className="px-6 py-4 font-bold">Contact</th>
                <th className="px-6 py-4 font-bold">Slot</th>
                <th className="px-6 py-4 font-bold">Reg. Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40 font-bold uppercase tracking-widest">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-base">{user.full_name}</div>
                      <div className="text-xs text-white/50">{user.email || 'No email provided'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-yellow-500">{user.bgmi_id}</div>
                      <div className="text-xs text-white/60">{user.team_name || 'No Team'} ({user.tournament_type})</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">{user.mobile_number}</div>
                      <div className="text-xs mt-1">
                        {user.payment_status === 'verified' ? (
                          <span className="text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">Paid</span>
                        ) : (
                          <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded">Pending</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {user.time_slot}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
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
