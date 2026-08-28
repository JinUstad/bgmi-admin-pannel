const fs = require('fs');
const path = require('path');

const content = `"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Loader2, Eye, X, Calendar, Gamepad2, CreditCard, Trash2, Filter, Plus, Pencil, Settings, Clock } from 'lucide-react';

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  bgmi_id: string;
  team_name: string;
  mobile_number: string;
  email: string;
  tournament_type: string;
  upi_id: string;
  time_slot: string;
  message: string;
  cashfree_order_id?: string;
  payment_status?: string;
  total_amount?: number;
  pending_amount?: number;
};

type TimeSlot = {
  id: string;
  slot_time: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<Registration | null>(null);
  const [slotFilter, setSlotFilter] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageSlotsModalOpen, setIsManageSlotsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    bgmi_id: '',
    team_name: '',
    mobile_number: '',
    email: '',
    tournament_type: 'squad',
    time_slot: '',
    upi_id: 'CASH',
    total_amount: 0,
    pending_amount: 0
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    bgmi_id: '',
    team_name: '',
    mobile_number: '',
    email: '',
    tournament_type: 'squad',
    time_slot: '',
    upi_id: 'CASH',
    payment_status: 'verified',
    total_amount: 0,
    pending_amount: 0
  });

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [newSlotStart, setNewSlotStart] = useState('');
  const [newSlotEnd, setNewSlotEnd] = useState('');

  useEffect(() => {
    fetchTimeSlots();
    fetchUsers();
  }, []);

  const fetchTimeSlots = async () => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      setTimeSlots(data);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotStart || !newSlotEnd) return;
    
    const formatTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10));
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };
    
    const formattedSlot = \`\${formatTime(newSlotStart)} - \${formatTime(newSlotEnd)}\`;
    
    const { data, error } = await supabase
      .from('time_slots')
      .insert([{ slot_time: formattedSlot }])
      .select();
      
    if (error) {
      alert('Failed to add slot: ' + error.message);
    } else if (data) {
      setTimeSlots([...timeSlots, data[0]]);
      setNewSlotStart('');
      setNewSlotEnd('');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time slot?')) return;
    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) {
      alert('Failed to delete slot: ' + error.message);
    } else {
      setTimeSlots(timeSlots.filter(s => s.id !== id));
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('payment_status', 'verified')
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

  const handleBulkDelete = async () => {
    if (!slotFilter) return;
    if (!confirm(\`Are you sure you want to delete ALL users for slot "\${slotFilter}"? This cannot be undone.\`)) return;
    
    setLoading(true);
    const { error } = await supabase.from('registrations').delete().eq('time_slot', slotFilter);
    if (error) {
      alert('Failed to bulk delete: ' + error.message);
      setLoading(false);
    } else {
      setUsers(users.filter(u => u.time_slot !== slotFilter));
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.bgmi_id || !formData.time_slot) {
      alert("Please fill in the required fields (Name, BGMI ID, Time Slot).");
      return;
    }
    setIsSubmitting(true);
    
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        ...formData,
        payment_amount: formData.total_amount, // For backwards compatibility
        payment_status: 'verified',
        cashfree_order_id: 'CASH_PAYMENT_' + Math.random().toString(36).substring(7).toUpperCase()
      }])
      .select();

    if (error) {
      alert('Failed to add user: ' + error.message);
    } else if (data) {
      setUsers([data[0], ...users]);
      setIsAddModalOpen(false);
      setFormData({
        full_name: '', bgmi_id: '', team_name: '', mobile_number: '', email: '', tournament_type: 'squad', time_slot: '', upi_id: 'CASH', total_amount: 0, pending_amount: 0
      });
    }
    setIsSubmitting(false);
  };

  const openEditModal = (user: Registration) => {
    setEditingUserId(user.id);
    setEditFormData({
      full_name: user.full_name || '',
      bgmi_id: user.bgmi_id || '',
      team_name: user.team_name || '',
      mobile_number: user.mobile_number || '',
      email: user.email || '',
      tournament_type: user.tournament_type || 'squad',
      time_slot: user.time_slot || '',
      upi_id: user.upi_id || 'CASH',
      payment_status: user.payment_status || 'verified',
      total_amount: user.total_amount || 0,
      pending_amount: user.pending_amount || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('registrations')
      .update(editFormData)
      .eq('id', editingUserId);

    if (error) {
      alert('Failed to update user: ' + error.message);
    } else {
      setUsers(users.map(u => (u.id === editingUserId ? { ...u, ...editFormData } : u)));
      setIsEditModalOpen(false);
    }
    setIsSubmitting(false);
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
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4 text-glow mb-2"
          >
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.15)]">
              <Users className="w-8 h-8 text-purple-500" />
            </div>
            Total Users
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-sm font-bold uppercase tracking-widest"
          >
            {slotFilter ? \`Showing \${filteredUsers.length} users for slot \${slotFilter}\` : 'Manage team leaders and tournament registrations'}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto"
        >
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start shrink-0">
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-black px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] flex items-center gap-2 uppercase tracking-widest hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
            
            <div className="flex items-center gap-2">
              <div className="relative group min-w-[140px]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-purple-500/50 group-hover:text-purple-500 transition-colors" />
                </div>
                <select
                  value={slotFilter}
                  onChange={(e) => setSlotFilter(e.target.value)}
                  className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 rounded-2xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm appearance-none cursor-pointer shadow-inner"
                >
                  <option value="" className="bg-[#111]">All Slots</option>
                  {timeSlots.map(slot => (
                    <option key={slot.id} value={slot.slot_time} className="bg-[#111]">{slot.slot_time}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={() => setIsManageSlotsModalOpen(true)}
                className="p-3 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 rounded-2xl text-white/70 hover:text-purple-500 transition-all shadow-inner shrink-0"
                title="Manage Time Slots"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/5 sm:hidden my-1" />
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {slotFilter && (
              <button 
                onClick={handleBulkDelete}
                className="shrink-0 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl px-4 py-3 text-sm font-bold transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                title="Delete all users in this slot"
              >
                <Trash2 className="w-4 h-4" /> Delete All
              </button>
            )}

            <div className="relative group w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/40 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full xl:w-72 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-2xl py-3 pl-11 pr-4 text-white transition-all text-sm shadow-inner placeholder:text-white/20 placeholder:uppercase placeholder:tracking-widest"
                placeholder="Search users..."
              />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-[#0a0a0a]/80 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl"
      >
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-widest text-white/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-5 font-bold">Player Info</th>
                <th className="px-6 py-5 font-bold">Team / ID</th>
                <th className="px-6 py-5 font-bold">Contact</th>
                <th className="px-6 py-5 font-bold">Slot</th>
                <th className="px-6 py-5 font-bold">Reg. Date</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={user.id} 
                    className="hover:bg-white/[0.02] transition-colors group relative"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-white text-base group-hover:text-purple-500 transition-colors">{user.full_name}</div>
                      <div className="text-xs text-white/50 flex items-center gap-2 mt-1">
                        {user.email || 'No email'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-mono font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded inline-block mb-1">{user.bgmi_id}</div>
                      <div className="text-xs text-white/60 font-medium uppercase tracking-wider">{user.team_name || 'No Team'} ({user.tournament_type})</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-white font-medium">{user.mobile_number}</div>
                      <div className="text-[10px] uppercase tracking-widest font-black mt-1.5">
                        {user.payment_status === 'verified' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <span className="text-green-500">Paid</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                            <span className="text-purple-500">Pending</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-[#111] border border-white/10 shadow-inner px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white/80 group-hover:border-purple-500/30 transition-colors">
                        {user.time_slot || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-white/40 font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          title="View Details"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-500 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:-translate-y-0.5"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(user)}
                          title="Edit Registration"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 text-white hover:text-blue-500 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:-translate-y-0.5"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete Registration"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/60 hover:text-red-500 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:-translate-y-0.5"
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
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-500" />
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
                  <p className="text-purple-500 text-lg font-bold font-mono">{selectedUser.bgmi_id}</p>
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
                
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-white text-lg capitalize">₹{selectedUser.total_amount || 0}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Pending Amount</p>
                  <p className="text-white text-lg capitalize">₹{selectedUser.pending_amount || 0}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 md:col-span-2">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">UPI ID (If provided)</p>
                  <p className="text-white text-lg font-mono">{selectedUser.upi_id || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                  <p className="text-purple-500/70 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Time Slot
                  </p>
                  <p className="text-purple-500 text-lg font-bold">{selectedUser.time_slot}</p>
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
      </AnimatePresence>

      {/* Manual Add Modal */}
      <AnimatePresence>
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Plus className="w-6 h-6 text-purple-500" />
                Add User Manually
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualAdd} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Full Name *</label>
                  <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">BGMI ID *</label>
                  <input required type="text" value={formData.bgmi_id} onChange={e => setFormData({...formData, bgmi_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="e.g. 22222, 33333" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Team Name</label>
                  <input type="text" value={formData.team_name} onChange={e => setFormData({...formData, team_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="Team Soul" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Mobile Number *</label>
                  <input required type="text" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="+91" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Email Address (Optional)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Tournament Type *</label>
                  <select required value={formData.tournament_type} onChange={e => setFormData({...formData, tournament_type: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none">
                    <option value="squad">Squad Team Only</option>
                    <option value="solo">Solo Match</option>
                    <option value="duo">Duo/Dual Match</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Total Amount</label>
                  <input type="number" value={formData.total_amount || ''} onChange={e => setFormData({...formData, total_amount: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Pending Amount</label>
                  <input type="number" value={formData.pending_amount || ''} onChange={e => setFormData({...formData, pending_amount: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="0" />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">UPI ID / Payment Note *</label>
                  <input required type="text" value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" placeholder="e.g. CASH or upi@bank" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Registration Date *</label>
                  <input type="text" value={new Date().toLocaleDateString('en-GB').replace(/\\//g, '-')} readOnly className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed focus:outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Time Slot *</label>
                  <select required value={formData.time_slot} onChange={e => setFormData({...formData, time_slot: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 appearance-none">
                    <option value="">Select Slot</option>
                    {timeSlots.map(s => <option key={s.id} value={s.slot_time}>{s.slot_time}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-purple-500 hover:bg-purple-600 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {isSubmitting ? 'Adding...' : 'Add Player'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Pencil className="w-6 h-6 text-blue-500" />
                Edit Registration
              </h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Full Name *</label>
                  <input required type="text" value={editFormData.full_name} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">BGMI ID *</label>
                  <input required type="text" value={editFormData.bgmi_id} onChange={e => setEditFormData({...editFormData, bgmi_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Team Name</label>
                  <input type="text" value={editFormData.team_name} onChange={e => setEditFormData({...editFormData, team_name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Mobile Number *</label>
                  <input required type="text" value={editFormData.mobile_number} onChange={e => setEditFormData({...editFormData, mobile_number: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Email Address</label>
                  <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Tournament Type *</label>
                  <select required value={editFormData.tournament_type} onChange={e => setEditFormData({...editFormData, tournament_type: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option value="squad">Squad Team Only</option>
                    <option value="solo">Solo Match</option>
                    <option value="duo">Duo/Dual Match</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Total Amount</label>
                  <input type="number" value={editFormData.total_amount || ''} onChange={e => setEditFormData({...editFormData, total_amount: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Pending Amount</label>
                  <input type="number" value={editFormData.pending_amount || ''} onChange={e => setEditFormData({...editFormData, pending_amount: parseFloat(e.target.value) || 0})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" placeholder="0" />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">UPI ID / Note</label>
                  <input required type="text" value={editFormData.upi_id} onChange={e => setEditFormData({...editFormData, upi_id: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Payment Status *</label>
                  <select required value={editFormData.payment_status} onChange={e => setEditFormData({...editFormData, payment_status: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option value="verified">Verified (Paid)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Time Slot *</label>
                  <select required value={editFormData.time_slot} onChange={e => setEditFormData({...editFormData, time_slot: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none">
                    <option value="">Select Slot</option>
                    {timeSlots.map(s => <option key={s.id} value={s.slot_time}>{s.slot_time}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Pencil className="w-5 h-5" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Manage Time Slots Modal */}
      <AnimatePresence>
      {isManageSlotsModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
              <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-500" />
                Manage Time Slots
              </h3>
              <button 
                onClick={() => setIsManageSlotsModalOpen(false)}
                className="p-2 rounded bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Add New Slot Form */}
              <form onSubmit={handleAddSlot} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest">Add New Slot</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">Start Time</label>
                    <input 
                      type="time" 
                      required
                      value={newSlotStart}
                      onChange={e => setNewSlotStart(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1 block">End Time</label>
                    <input 
                      type="time" 
                      required
                      value={newSlotEnd}
                      onChange={e => setNewSlotEnd(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50" 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-bold uppercase tracking-widest py-3 rounded-xl transition-colors border border-purple-500/30 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Slot
                </button>
              </form>

              {/* List Existing Slots */}
              <div>
                <h4 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-4">Existing Slots</h4>
                {timeSlots.length === 0 ? (
                  <div className="text-center p-6 border border-white/5 border-dashed rounded-xl">
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">No slots configured</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between bg-black/50 border border-white/5 p-3 rounded-xl">
                        <span className="text-white font-medium">{slot.slot_time}</span>
                        <button 
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '../src/app/dashboard/users/page.tsx'), content);
console.log('Successfully rewrote users page.');
