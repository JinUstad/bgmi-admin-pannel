"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Users, Search, Loader2, Eye, X, Calendar, Gamepad2, CreditCard, Trash2, Filter } from 'lucide-react';

const TIME_SLOTS = [
  { value: '', label: 'All Slots' },
  { value: '9-10am', label: '9:00 AM - 10:00 AM' },
  { value: '10-11am', label: '10:00 AM - 11:00 AM' },
  { value: '11-12pm', label: '11:00 AM - 12:00 PM' },
  { value: '12-1pm', label: '12:00 PM - 1:00 PM' },
  { value: '2-3pm', label: '2:00 PM - 3:00 PM' },
  { value: '3-4pm', label: '3:00 PM - 4:00 PM' },
  { value: '4-5pm', label: '4:00 PM - 5:00 PM' },
];

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
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [slotFilter, setSlotFilter] = useState('');

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

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration? This cannot be undone.')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) {
      alert('Failed to delete: ' + error.message);
    } else {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.bgmi_id?.includes(search) ||
      user.team_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.mobile_number?.includes(search);
    const matchesSlot = !slotFilter || user.time_slot === slotFilter;
    return matchesSearch && matchesSlot;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-500" />
            Total Users
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {slotFilter ? `Showing ${filteredUsers.length} users for slot ${slotFilter}` : 'Manage team leaders and tournament registrations'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-white/40" />
            </div>
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="bg-[#111] border border-white/10 rounded-xl py-2.5 pl-9 pr-8 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm appearance-none cursor-pointer"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/40" />
            </div>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-[#111] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
              placeholder="Search by name, ID, team..."
            />
          </div>
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
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40 font-bold uppercase tracking-widest">
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                          className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 text-white hover:text-yellow-500 transition-colors inline-flex"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete Registration"
                          className="p-2 rounded bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/50 text-white/60 hover:text-red-500 transition-colors inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-500" />
                Player Details
              </h3>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-white text-lg font-medium">{selectedUser.full_name}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">BGMI ID</p>
                  <p className="text-yellow-500 text-lg font-bold font-mono">{selectedUser.bgmi_id}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Team Name</p>
                  <p className="text-white text-lg font-medium">{selectedUser.team_name}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Contact Number</p>
                  <p className="text-white text-lg">{selectedUser.mobile_number}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-white text-lg">{selectedUser.email || 'N/A'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Tournament Type</p>
                  <p className="text-white text-lg capitalize">{selectedUser.tournament_type}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 md:col-span-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">UPI ID (If provided)</p>
                  <p className="text-white text-lg font-mono">{selectedUser.upi_id || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                  <p className="text-yellow-500/70 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Time Slot
                  </p>
                  <p className="text-yellow-500 text-lg font-bold">{selectedUser.time_slot}</p>
                </div>
                <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                  <p className="text-green-500/70 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Status
                  </p>
                  <p className="text-green-500 text-lg font-bold uppercase">{selectedUser.payment_status}</p>
                  <p className="text-green-500/70 text-xs mt-1 font-mono">{selectedUser.cashfree_order_id || selectedUser.upi_id}</p>
                </div>
              </div>

              {selectedUser.message && (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Message / Query</p>
                  <p className="text-white/80 whitespace-pre-wrap">{selectedUser.message}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
