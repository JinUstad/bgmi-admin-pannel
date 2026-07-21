"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Gamepad2, Loader2, Plus, Trophy, Filter, Trash2, CheckCircle2, Zap } from 'lucide-react';

type Registration = {
  id: string;
  full_name: string;
  bgmi_id: string;
  team_name: string;
  tournament_type: string;
  time_slot: string;
};

type TeamMatch = {
  id: string;
  created_at: string;
  tournament_type: string;
  time_slot: string;
  team1_id: string;
  team2_id: string;
  winner_id: string | null;
  status: string;
  team1: Registration;
  team2: Registration;
};

export default function TeamBattlesPage() {
  const [matches, setMatches] = useState<TeamMatch[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<{ value: string, label: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newMatch, setNewMatch] = useState({
    team1_id: '',
    team2_id: ''
  });

  useEffect(() => {
    fetchTimeSlots();
    fetchMatches();
    fetchRegistrations();
  }, []);

  const fetchTimeSlots = async () => {
    const { data: tourData } = await supabase
      .from('upcoming_tournaments')
      .select('slots')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (tourData && tourData.slots && tourData.slots.length > 0) {
      const dynamicSlots = tourData.slots.map((s: any) => {
        if (typeof s === 'string') return { value: s, label: s };
        let timeStr = s.time;
        if (s.startHour) {
          timeStr = `${s.startHour}:${s.startMin} ${s.startAmPm} - ${s.endHour}:${s.endMin} ${s.endAmPm}`;
        }
        return { value: timeStr, label: timeStr };
      });
      setTimeSlots(dynamicSlots);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    // Fetch matches with team details using the correct relationship syntax for Supabase
    const { data: matchesData, error } = await supabase
      .from('team_matches')
      .select(`
        *,
        team1:team1_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot),
        team2:team2_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
    } else {
      setMatches((matchesData as any) || []);
    }
    setLoading(false);
  };

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from('registrations')
      .select('id, full_name, bgmi_id, team_name, tournament_type, time_slot')
      .eq('payment_status', 'verified');
    
    if (error) {
      console.error('Error fetching registrations:', error);
    } else {
      setRegistrations(data || []);
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.team1_id || !newMatch.team2_id) {
      alert("Please select both teams.");
      return;
    }
    if (newMatch.team1_id === newMatch.team2_id) {
      alert("Team 1 and Team 2 cannot be the same.");
      return;
    }
    
    const team1Data = registrations.find(r => r.id === newMatch.team1_id);
    if (!team1Data) return;

    setIsCreating(true);
    const { data, error } = await supabase
      .from('team_matches')
      .insert([{
        tournament_type: team1Data.tournament_type,
        time_slot: team1Data.time_slot,
        team1_id: newMatch.team1_id,
        team2_id: newMatch.team2_id,
        status: 'pending'
      }])
      .select(`
        *,
        team1:team1_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot),
        team2:team2_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot)
      `);

    if (error) {
      alert('Failed to create match: ' + error.message);
    } else if (data) {
      setMatches([data[0] as any, ...matches]);
      setNewMatch({ team1_id: '', team2_id: '' });
    }
    setIsCreating(false);
  };

  const handleDeleteMatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this match?')) return;
    const { error } = await supabase.from('team_matches').delete().eq('id', id);
    if (!error) {
      setMatches(matches.filter(m => m.id !== id));
    }
  };

  const handleSetWinner = async (matchId: string, winnerId: string) => {
    if (!confirm('Are you sure you want to declare this team as the winner? This will be visible on the main website.')) return;
    
    const { error } = await supabase
      .from('team_matches')
      .update({ winner_id: winnerId, status: 'completed' })
      .eq('id', matchId);

    if (error) {
      alert('Failed to set winner: ' + error.message);
    } else {
      setMatches(matches.map(m => m.id === matchId ? { ...m, winner_id: winnerId, status: 'completed' } : m));
    }
  };

  const filteredMatches = selectedSlot ? matches.filter(m => m.time_slot === selectedSlot) : matches;
  
  const availableTeams = registrations.filter(r => {
    if (r.tournament_type === 'solo') return false;
    const teamMatches = matches.filter(m => m.team1_id === r.id || m.team2_id === r.id);
    if (teamMatches.length === 0) return true;
    const isPending = teamMatches.some(m => m.status === 'pending' || m.status === 'ongoing');
    if (isPending) return false;
    const hasLost = teamMatches.some(m => m.status === 'completed' && m.winner_id && m.winner_id !== r.id);
    if (hasLost) return false;
    return true;
  });
  
  availableTeams.sort((a, b) => {
    const parseTime = (timeStr: string) => {
      if (!timeStr) return 0;
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };
    return parseTime(a.time_slot || '') - parseTime(b.time_slot || '');
  });
  const selectedTeam1 = registrations.find(r => r.id === newMatch.team1_id);

  const getEligibleTeam2 = () => {
    if (!selectedTeam1) return [];
    return availableTeams.filter(r => 
      r.tournament_type === selectedTeam1.tournament_type &&
      r.id !== selectedTeam1.id
    );
  };

  const getSlotBasedMatches = () => {
    const groups: Record<string, Registration[]> = {};
    availableTeams.forEach(t => {
      const key = `${t.time_slot}_${t.tournament_type}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    const suggested: any[] = [];
    for (const key in groups) {
      const teams = groups[key];
      for (let i = 0; i < teams.length; i += 2) {
        suggested.push({
          time_slot: teams[i].time_slot,
          tournament_type: teams[i].tournament_type,
          team1: teams[i],
          team2: teams[i+1] || null
        });
      }
    }
    return suggested;
  };

  const suggestedMatches = getSlotBasedMatches();
  const readyMatches = suggestedMatches.filter(sm => sm.team2);
  const waitingTeams = suggestedMatches.filter(sm => !sm.team2);

  const handleCreateSuggestedMatch = async (sm: any) => {
    setIsCreating(true);
    const { data, error } = await supabase
      .from('team_matches')
      .insert([{
        tournament_type: sm.tournament_type,
        time_slot: sm.time_slot,
        team1_id: sm.team1.id,
        team2_id: sm.team2.id,
        status: 'pending'
      }])
      .select(`
        *,
        team1:team1_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot),
        team2:team2_id (id, full_name, bgmi_id, team_name, tournament_type, time_slot)
      `);

    if (error) {
      alert('Failed to create match: ' + error.message);
    } else if (data) {
      setMatches([data[0] as any, ...matches]);
    }
    setIsCreating(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Team Battles
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Create team matches and declare winners for Duo/Squad tournaments
          </p>
        </div>
      </div>

      {/* Match Creation Form */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-5 h-5 text-yellow-500" /> Create New Battle
        </h2>
        <form onSubmit={handleCreateMatch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Team 1</label>
            <select 
              value={newMatch.team1_id}
              onChange={e => setNewMatch({ team1_id: e.target.value, team2_id: '' })}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 appearance-none"
              required
            >
              <option value="">Select Team 1</option>
              {availableTeams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.team_name || t.full_name} ({t.bgmi_id}) - {t.tournament_type} • {t.time_slot}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center font-black text-white/40 mb-3 hidden md:block">VS</div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 block">Team 2</label>
            <select 
              value={newMatch.team2_id}
              onChange={e => setNewMatch({...newMatch, team2_id: e.target.value})}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 appearance-none"
              required
              disabled={!newMatch.team1_id}
            >
              <option value="">Select Team 2</option>
              {getEligibleTeam2().map(t => (
                <option key={t.id} value={t.id}>
                  {t.team_name || t.full_name} ({t.bgmi_id}) - {t.tournament_type} • {t.time_slot}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-5 mt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={isCreating || !newMatch.team1_id || !newMatch.team2_id}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2 uppercase tracking-widest w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Battle'}
            </button>
          </div>
        </form>
      </div>

      {readyMatches.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" /> Slot-Based Matches (Ready)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyMatches.map((sm, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between gap-4">
                <div>
                  <span className="inline-block text-yellow-500 font-bold uppercase text-[10px] tracking-widest px-2 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                    {sm.time_slot} • {sm.tournament_type}
                  </span>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex-1 text-center font-bold text-white truncate px-2">{sm.team1.team_name || sm.team1.full_name}</div>
                    <div className="text-red-500 font-black italic text-sm px-2">VS</div>
                    <div className="flex-1 text-center font-bold text-white truncate px-2">
                      {sm.team2.team_name || sm.team2.full_name}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCreateSuggestedMatch(sm)}
                  disabled={isCreating}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black w-full py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  Create This Battle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {waitingTeams.length > 0 && (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white/70 mb-4 uppercase tracking-wider flex items-center gap-2">
             Pending Registrations (Waiting for Opponent)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {waitingTeams.map((sm, idx) => (
              <div key={idx} className="bg-black/50 border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                <span className="text-yellow-500/70 font-bold uppercase text-[10px] tracking-widest">
                  {sm.time_slot} • {sm.tournament_type}
                </span>
                <div className="font-bold text-white/80 truncate">
                  {sm.team1.team_name || sm.team1.full_name}
                </div>
                <div className="text-white/30 text-xs italic mt-1">Waiting for another team...</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Matches List */}
      <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-yellow-500" /> Battle List
          </h2>
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-white/40" />
            </div>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full sm:w-auto bg-black border border-white/10 rounded-xl py-2 pl-9 pr-8 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm appearance-none cursor-pointer"
            >
              <option value="">All Slots</option>
              {timeSlots.map(slot => (
                <option key={slot.value} value={slot.value}>{slot.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="p-12 text-center text-white/40 font-bold uppercase tracking-widest">
            No battles found for this slot
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4">
            {filteredMatches.map((match, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={match.id}
                className="bg-black/50 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
              >
                {match.status === 'completed' && (
                  <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
                )}
                
                {/* Team 1 */}
                <div className={`flex-1 text-center md:text-right p-4 rounded-xl border ${match.winner_id === match.team1_id ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-xl font-black text-white">{match.team1?.team_name || match.team1?.full_name || 'Deleted Team'}</h3>
                  <p className="text-sm text-white/50 mb-4">ID: {match.team1?.bgmi_id || 'N/A'}</p>
                  
                  {match.status !== 'completed' ? (
                    <button 
                      onClick={() => handleSetWinner(match.id, match.team1_id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors uppercase tracking-wider"
                    >
                      Set Win
                    </button>
                  ) : match.winner_id === match.team1_id ? (
                    <span className="inline-flex items-center gap-1 text-green-500 font-bold uppercase tracking-widest text-sm bg-green-500/20 px-4 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> Winner
                    </span>
                  ) : (
                    <span className="text-white/20 font-bold uppercase tracking-widest text-sm">Loss</span>
                  )}
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center justify-center shrink-0 min-w-[100px]">
                  <span className="bg-red-500/20 text-red-500 border border-red-500/30 w-12 h-12 flex items-center justify-center rounded-full font-black text-lg z-10 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    {match.tournament_type === 'squad' ? '4v4' : '2v2'}
                  </span>
                  <div className="text-xs text-white/40 mt-2 font-bold uppercase tracking-widest text-center whitespace-nowrap">
                    {match.tournament_type}
                  </div>
                  <button 
                    onClick={() => handleDeleteMatch(match.id)}
                    className="mt-2 text-white/20 hover:text-red-500 transition-colors p-1"
                    title="Delete Battle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Team 2 */}
                <div className={`flex-1 text-center md:text-left p-4 rounded-xl border ${match.winner_id === match.team2_id ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
                  <h3 className="text-xl font-black text-white">{match.team2?.team_name || match.team2?.full_name || 'Deleted Team'}</h3>
                  <p className="text-sm text-white/50 mb-4">ID: {match.team2?.bgmi_id || 'N/A'}</p>
                  
                  {match.status !== 'completed' ? (
                    <button 
                      onClick={() => handleSetWinner(match.id, match.team2_id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors uppercase tracking-wider"
                    >
                      Set Win
                    </button>
                  ) : match.winner_id === match.team2_id ? (
                    <span className="inline-flex items-center gap-1 text-green-500 font-bold uppercase tracking-widest text-sm bg-green-500/20 px-4 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4" /> Winner
                    </span>
                  ) : (
                    <span className="text-white/20 font-bold uppercase tracking-widest text-sm">Loss</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
