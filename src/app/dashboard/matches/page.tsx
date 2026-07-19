"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Users, CheckCircle2, Clock, PlayCircle, Loader2, Save, Key, Edit2, Trash2, MessageSquare, Send, CalendarIcon } from 'lucide-react';

export default function MatchesPage() {
  const [timeSlots, setTimeSlots] = useState<{ value: string, label: string, capacity: number }[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [roomData, setRoomData] = useState({ id: '', password: '' });
  
  const [chatMessage, setChatMessage] = useState<{ [key: string]: string }>({});
  const [scheduleDate, setScheduleDate] = useState<{ [key: string]: string }>({});
  const [chats, setChats] = useState<{ [key: string]: any[] }>({});

  const fetchAllData = async () => {
    setLoading(true);

    // Fetch tournament slots
    const { data: tourData } = await supabase
      .from('upcoming_tournaments')
      .select('slots, slot_capacity')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tourData && tourData.slots && tourData.slots.length > 0) {
      setTimeSlots(tourData.slots.map((s: any) => {
        if (typeof s === 'string') {
          return { value: s, label: s, capacity: tourData.slot_capacity || 6 };
        }
        let timeStr = s.time;
        if (s.startHour) {
          timeStr = `${s.startHour}:${s.startMin} ${s.startAmPm} - ${s.endHour}:${s.endMin} ${s.endAmPm}`;
        }
        return { value: timeStr, label: timeStr, capacity: s.capacity || tourData.slot_capacity || 6 };
      }));
    } else {
      setTimeSlots([
        { value: '10:00 AM - 11:00 AM', label: '10:00 AM - 11:00 AM', capacity: 6 }
      ]);
    }

    // Fetch all verified registrations to count teams
    const { data: regData } = await supabase
      .from('registrations')
      .select('time_slot, payment_status, team_name, full_name, bgmi_id')
      .eq('payment_status', 'verified');

    setRegistrations(regData || []);

    // Fetch matches
    const { data: matchData } = await supabase
      .from('matches')
      .select('*');
      
    // Lazy Delete check
    if (matchData) {
      const now = new Date();
      const validMatches = [];
      for (const m of matchData) {
        if (m.scheduled_delete_at && new Date(m.scheduled_delete_at) <= now) {
          await supabase.from('matches').delete().eq('id', m.id);
          // Assuming cascade delete takes care of match_chats. We should also delete registrations if needed,
          // but usually keeping them might be good, or delete if requested.
          console.log(`Auto-deleted match ${m.id}`);
        } else {
          validMatches.push(m);
          
          // Fetch chats for valid match
          const { data: matchChats } = await supabase
            .from('match_chats')
            .select('*')
            .eq('match_id', m.id)
            .order('created_at', { ascending: false });
          
          setChats(prev => ({ ...prev, [m.id]: matchChats || [] }));
        }
      }
      setMatches(validMatches);
    } else {
      setMatches([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const createMatch = async (timeSlot: string) => {
    const { error } = await supabase.from('matches').insert([{
      time_slot: timeSlot,
      status: 'pending'
    }]);

    if (error) alert('Failed to create match: ' + error.message);
    else fetchAllData();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('matches').update({ status }).eq('id', id);
    if (error) alert('Failed to update status: ' + error.message);
    else fetchAllData();
  };

  const saveRoomDetails = async (id: string) => {
    const { error } = await supabase
      .from('matches')
      .update({ room_id: roomData.id, room_password: roomData.password })
      .eq('id', id);

    if (error) {
      alert('Failed to save room details: ' + error.message);
    } else {
      setEditRoomId(null);
      setRoomData({ id: '', password: '' });
      fetchAllData();
    }
  };

  const deleteMatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match? The room details will be lost.')) return;
    const { error } = await supabase.from('matches').delete().eq('id', id);
    if (error) alert('Failed to delete match: ' + error.message);
    else fetchAllData();
  };

  const sendChatMessage = async (matchId: string) => {
    const msg = chatMessage[matchId];
    if (!msg && !roomData.id && !roomData.password) return;

    const { error } = await supabase.from('match_chats').insert([{
      match_id: matchId,
      message: msg || '',
      room_id: roomData.id || '',
      room_password: roomData.password || ''
    }]);

    if (error) {
      alert('Failed to send announcement: ' + error.message);
    } else {
      setChatMessage(prev => ({ ...prev, [matchId]: '' }));
      setEditRoomId(null);
      setRoomData({ id: '', password: '' });
      fetchAllData();
    }
  };

  const saveSchedule = async (matchId: string) => {
    const date = scheduleDate[matchId];
    if (!date) return;
    
    const { error } = await supabase
      .from('matches')
      .update({ scheduled_delete_at: date })
      .eq('id', matchId);
      
    if (error) {
      alert('Failed to schedule deletion: ' + error.message);
    } else {
      alert('Deletion scheduled successfully');
      fetchAllData();
    }
  };

  // Stats calculation
  const totalTeams = registrations.length;
  const ongoingMatches = matches.filter(m => m.status === 'ongoing').length;
  const completedMatches = matches.filter(m => m.status === 'completed').length;
  const pendingMatches = matches.filter(m => m.status === 'pending').length;

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-2">
          <Gamepad2 className="w-8 h-8 text-purple-500" />
          Match Management
        </h1>
        <p className="text-white/60">Manage your tournament time slots, create matches, and update room details.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2 text-white/50">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Total Teams</span>
          </div>
          <p className="text-3xl font-black text-white">{totalTeams}</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2 text-purple-500">
            <PlayCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Ongoing</span>
          </div>
          <p className="text-3xl font-black text-white">{ongoingMatches}</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2 text-green-500">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Completed</span>
          </div>
          <p className="text-3xl font-black text-white">{completedMatches}</p>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2 text-yellow-500">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Pending</span>
          </div>
          <p className="text-3xl font-black text-white">{pendingMatches}</p>
        </div>
      </div>

      {/* Matches Overview */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {timeSlots.map((slot, index) => {
            const registeredTeams = registrations.filter(r => r.time_slot === slot.value);
            const slotTeams = registeredTeams.length;
            const match = matches.find(m => m.time_slot === slot.value);

            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={`${slot.value}-${index}`}
                className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl"
              >
                {/* Header */}
                <div className="bg-white/5 p-5 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">{slot.label}</h3>
                    <p className="text-white/50 text-sm mt-1">{slotTeams} / {slot.capacity} Teams Registered</p>
                  </div>
                  {match ? (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${match.status === 'ongoing' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                      match.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      }`}>
                      {match.status === 'ongoing' && <PlayCircle className="w-3 h-3" />}
                      {match.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {match.status === 'pending' && <Clock className="w-3 h-3" />}
                      {match.status}
                    </span>
                  ) : (
                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">No Match</span>
                  )}
                </div>

                {/* Body */}
                <div className="p-5">
                  {!match ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Gamepad2 className="w-12 h-12 text-white/10 mb-3" />
                      <button
                        onClick={() => createMatch(slot.value)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
                      >
                        Create Match for this Slot
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">

                      {/* Room Details Section */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Key className="w-4 h-4" /> Room Details
                          </h4>
                          <div className="flex items-center gap-3">
                            {editRoomId !== match.id && (
                              <button
                                onClick={() => {
                                  setEditRoomId(match.id);
                                  setRoomData({ id: match.room_id || '', password: match.room_password || '' });
                                }}
                                title="Edit Room"
                                className="text-white/40 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteMatch(match.id)}
                              title="Delete Match"
                              className="text-white/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {editRoomId === match.id ? (
                          <div className="space-y-3">
                            <textarea
                              placeholder="Announcement Message (Optional)"
                              value={chatMessage[match.id] || ''}
                              onChange={(e) => setChatMessage(prev => ({ ...prev, [match.id]: e.target.value }))}
                              className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Room ID"
                                value={roomData.id}
                                onChange={(e) => setRoomData({ ...roomData, id: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Room Password"
                                value={roomData.password}
                                onChange={(e) => setRoomData({ ...roomData, password: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => sendChatMessage(match.id)}
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                              >
                                <Send className="w-4 h-4" /> Send to Group Chat
                              </button>
                              <button
                                onClick={() => {
                                  saveRoomDetails(match.id);
                                }}
                                className="px-4 border border-purple-500/50 hover:bg-purple-500/10 text-purple-400 rounded-lg py-2 text-sm font-bold transition-colors"
                              >
                                Save Only
                              </button>
                              <button
                                onClick={() => setEditRoomId(null)}
                                className="px-4 border border-white/10 hover:bg-white/5 text-white rounded-lg py-2 text-sm font-bold transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Current Room ID</p>
                              <p className="text-white font-mono">{match.room_id || 'Not set'}</p>
                            </div>
                            <div>
                              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Current Password</p>
                              <p className="text-white font-mono">{match.room_password || 'Not set'}</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Match Chat History */}
                        {chats[match.id] && chats[match.id].length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                              <MessageSquare className="w-3 h-3" /> Recent Announcements
                            </p>
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                              {chats[match.id].map(chat => (
                                <div key={chat.id} className="bg-black/50 p-2 rounded-lg text-xs">
                                  <div className="flex justify-between items-start text-white/40 mb-1 text-[10px]">
                                    <span>Sent by Admin</span>
                                    <span>{new Date(chat.created_at).toLocaleString()}</span>
                                  </div>
                                  {chat.message && <div className="text-white/80 mb-1">{chat.message}</div>}
                                  {(chat.room_id || chat.room_password) && (
                                    <div className="flex gap-3 text-white">
                                      {chat.room_id && <span>ID: <span className="font-mono text-purple-400">{chat.room_id}</span></span>}
                                      {chat.room_password && <span>Pass: <span className="font-mono text-purple-400">{chat.room_password}</span></span>}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Auto-Delete Scheduler */}
                      <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-red-400/80 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Schedule Deletion
                          </h4>
                        </div>
                        <div className="flex gap-2 items-center">
                          <input 
                            type="datetime-local" 
                            className="bg-black border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-red-500 text-sm flex-1"
                            value={scheduleDate[match.id] || (match.scheduled_delete_at ? new Date(match.scheduled_delete_at).toISOString().slice(0,16) : '')}
                            onChange={(e) => setScheduleDate(prev => ({ ...prev, [match.id]: e.target.value }))}
                          />
                          <button 
                            onClick={() => saveSchedule(match.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                          >
                            Set
                          </button>
                        </div>
                        {match.scheduled_delete_at && (
                          <p className="text-red-400/60 text-[10px] mt-2">Will auto-delete on: {new Date(match.scheduled_delete_at).toLocaleString()}</p>
                        )}
                      </div>

                      {/* Registered Teams Section */}
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white/70 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" /> Registered Teams ({slotTeams}/{slot.capacity})
                          </h4>
                          <span className="text-[10px] text-white/40 uppercase tracking-widest">3 vs 3 Format</span>
                        </div>
                        {slotTeams === 0 ? (
                          <p className="text-white/30 text-xs text-center py-2 italic">No teams registered for this slot yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {registeredTeams.map((team, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-black/50 p-2.5 rounded-lg border border-white/5">
                                <div className="min-w-0">
                                  <p className="text-white text-sm font-bold truncate">{team.team_name || team.full_name}</p>
                                  <p className="text-white/40 text-[10px] truncate">ID: {team.bgmi_id}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 ${idx < 3 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                  }`}>
                                  Team {idx < 3 ? 'A' : 'B'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Match Actions */}
                      <div className="flex flex-wrap gap-2">
                        {match.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(match.id, 'ongoing')}
                            className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            <PlayCircle className="w-4 h-4" /> Start Match
                          </button>
                        )}
                        {match.status === 'ongoing' && (
                          <button
                            onClick={() => updateStatus(match.id, 'completed')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" /> End Match (Mark Completed)
                          </button>
                        )}
                        {match.status === 'completed' && (
                          <div className="flex-1 text-center py-2.5 bg-white/5 text-white/50 text-sm font-bold rounded-lg border border-white/10">
                            Match has concluded
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
