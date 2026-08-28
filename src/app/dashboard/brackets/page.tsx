"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Trophy, Save, Plus, Trash2, Loader2, GitMerge, X } from "lucide-react";

type Match = {
  id: string;
  team1: string;
  team2: string;
  winner: string;
};

type Round = {
  id: string;
  title: string;
  matches: Match[];
};

type BracketData = {
  rounds: Round[];
};

export default function BracketsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGame, setActiveGame] = useState<any>(null);
  const [bracketData, setBracketData] = useState<BracketData>({ rounds: [] });
  const [allGames, setAllGames] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: games } = await supabase.from('games').select('*').order('name');
      if (games) setAllGames(games);

      const { data: config } = await supabase.from("active_game_config").select("active_game_id").eq("id", 1).single();
      
      if (config?.active_game_id && games) {
        const initialGame = games.find(g => g.id === config.active_game_id);
        if (initialGame) {
          await loadGameData(initialGame);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const loadGameData = async (game: any) => {
    setActiveGame(game);
    setLoading(true);
    try {
      const { data: users } = await supabase
        .from("registrations")
        .select("*")
        .eq("game_id", game.id)
        .eq("payment_status", "verified");
      if (users) setRegisteredUsers(users);

      const { data: bracket } = await supabase
        .from("tournament_brackets")
        .select("*")
        .eq("game_id", game.id)
        .single();
      
      if (bracket && bracket.bracket_data) {
        setBracketData(bracket.bracket_data);
      } else {
        setBracketData({ rounds: [] });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const saveBracket = async () => {
    if (!activeGame) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("tournament_brackets").upsert(
        {
          game_id: activeGame.id,
          bracket_data: bracketData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "game_id" },
      );

      if (error) {
        alert("Failed to save brackets: " + error.message);
      } else {
        alert("Tournament brackets saved successfully!");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };



  const updateMatch = (
    roundId: string,
    matchId: string,
    field: keyof Match,
    value: string,
  ) => {
    setBracketData({
      rounds: bracketData.rounds.map((r) =>
        r.id === roundId
          ? {
              ...r,
              matches: r.matches.map((m) =>
                m.id === matchId ? { ...m, [field]: value } : m,
              ),
            }
          : r,
      ),
    });
  };



  const generateAutoBracket = () => {
    if (!activeGame) return;
    if (registeredUsers.length < 2) {
      alert("Need at least 2 verified players to generate a bracket.");
      return;
    }
    
    // Randomize seeding
    const players = [...registeredUsers].sort(() => 0.5 - Math.random());
    
    // Find closest power of 2
    let slots = 2;
    while (slots < players.length) slots *= 2;
    if (slots > 64) slots = 64; // limit

    const byesCount = slots - players.length;
    
    const firstRoundMatches: Match[] = [];
    const numMatches = slots / 2;
    
    let playerIndex = 0;
    
    for (let i = 0; i < numMatches; i++) {
      const matchId = crypto.randomUUID();
      if (i < byesCount) {
        // This match has a BYE
        const p1 = players[playerIndex++];
        const team1Name = p1 ? `${p1.full_name} (${p1.bgmi_id})` : "";
        firstRoundMatches.push({
          id: matchId,
          team1: team1Name,
          team2: "BYE",
          winner: team1Name // auto advance
        });
      } else {
        // Standard match
        const p1 = players[playerIndex++];
        const p2 = players[playerIndex++];
        firstRoundMatches.push({
          id: matchId,
          team1: p1 ? `${p1.full_name} (${p1.bgmi_id})` : "",
          team2: p2 ? `${p2.full_name} (${p2.bgmi_id})` : "",
          winner: ""
        });
      }
    }

    const rounds: Round[] = [{
      id: crypto.randomUUID(),
      title: `Round of ${slots}`,
      matches: firstRoundMatches
    }];

    // Next rounds
    let currentMatches = numMatches;
    let roundIndex = 2;
    while (currentMatches > 1) {
      currentMatches /= 2;
      const nextRoundMatches: Match[] = [];
      for (let i = 0; i < currentMatches; i++) {
        nextRoundMatches.push({
          id: crypto.randomUUID(),
          team1: "",
          team2: "",
          winner: ""
        });
      }
      let title = `Round ${roundIndex}`;
      if (currentMatches === 4) title = "Quarter-Finals";
      if (currentMatches === 2) title = "Semi-Finals";
      if (currentMatches === 1) title = "Final Match";
      
      rounds.push({
        id: crypto.randomUUID(),
        title,
        matches: nextRoundMatches
      });
      roundIndex++;
    }

    setBracketData({ rounds });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!activeGame) {
    return (
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white/30" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Game</h2>
        <p className="text-white/50">
          Please activate a game from the Games tab to manage its tournament
          brackets.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-2"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <span className="text-[11px] text-white/40 font-semibold uppercase tracking-[0.2em]">
              Tournament Brackets
            </span>
          </motion.div>
          <h1 className="text-3xl font-black font-heading text-white tracking-tight flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-purple-500" />
            <select
              value={activeGame?.id || ""}
              onChange={(e) => {
                const g = allGames.find((game) => game.id === e.target.value);
                if (g) loadGameData(g);
              }}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-white cursor-pointer hover:text-purple-400 transition-colors"
            >
              <option value="" disabled className="bg-zinc-900">Select Game...</option>
              {allGames.map((game) => (
                <option key={game.id} value={game.id} className="bg-zinc-900 text-sm">
                  {game.name}
                </option>
              ))}
            </select>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={generateAutoBracket}
            disabled={saving}
            className="bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all"
          >
            Generate Auto Bracket
          </button>
          <button
            onClick={saveBracket}
            disabled={saving}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : "Save Brackets"}
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-6 hide-scrollbar pb-10 pt-4">
        {bracketData.rounds.map((round, rIndex) => (
          <div
            key={round.id}
            className="min-w-[300px] max-w-[300px] shrink-0 space-y-4"
          >
            <div className="flex items-center justify-between glassmorphism p-3 rounded-xl border border-white/[0.05]">
              <input
                type="text"
                value={round.title}
                readOnly
                className="bg-transparent border-none text-white font-bold uppercase tracking-wider text-sm focus:outline-none w-full"
              />
            </div>

            <div className="space-y-4 relative">
              {round.matches.map((match, mIndex) => (
                <div
                  key={match.id}
                  className="glassmorphism p-4 rounded-xl border border-white/[0.05] relative"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40 font-bold uppercase">
                      Match {mIndex + 1}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <select
                      value={match.team1}
                      onChange={(e) => updateMatch(round.id, match.id, "team1", e.target.value)}
                      className={`w-full bg-black/40 border ${match.winner === match.team1 && match.team1 !== "" ? "border-emerald-500/50 text-emerald-400" : "border-white/[0.05] text-white"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 appearance-none`}
                    >
                      <option value="">- TBD -</option>
                      {registeredUsers.map(u => (
                        <option key={u.id} value={`${u.full_name} (${u.bgmi_id})`}>{u.full_name} ({u.bgmi_id})</option>
                      ))}
                      {!registeredUsers.find(u => `${u.full_name} (${u.bgmi_id})` === match.team1) && match.team1 !== "" && (
                        <option value={match.team1}>{match.team1}</option>
                      )}
                    </select>

                    <div className="text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                      VS
                    </div>
                    
                    <select
                      value={match.team2}
                      onChange={(e) => updateMatch(round.id, match.id, "team2", e.target.value)}
                      className={`w-full bg-black/40 border ${match.winner === match.team2 && match.team2 !== "" ? "border-emerald-500/50 text-emerald-400" : "border-white/[0.05] text-white"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500/50 appearance-none`}
                    >
                      <option value="">- TBD -</option>
                      {registeredUsers.map(u => (
                        <option key={u.id} value={`${u.full_name} (${u.bgmi_id})`}>{u.full_name} ({u.bgmi_id})</option>
                      ))}
                      {!registeredUsers.find(u => `${u.full_name} (${u.bgmi_id})` === match.team2) && match.team2 !== "" && (
                        <option value={match.team2}>{match.team2}</option>
                      )}
                    </select>
                  </div>

                  <div className="mt-3">
                    <label className="text-[10px] text-white/40 font-bold uppercase tracking-wider mb-1 block">
                      Winner
                    </label>
                    <select
                      value={match.winner}
                      onChange={(e) =>
                        updateMatch(
                          round.id,
                          match.id,
                          "winner",
                          e.target.value,
                        )
                      }
                      className="w-full bg-surface-1 border border-white/[0.05] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                    >
                      <option value="">- Undecided -</option>
                      {match.team1 && (
                        <option value={match.team1}>{match.team1}</option>
                      )}
                      {match.team2 && (
                        <option value={match.team2}>{match.team2}</option>
                      )}
                    </select>
                  </div>
                </div>
              ))}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
