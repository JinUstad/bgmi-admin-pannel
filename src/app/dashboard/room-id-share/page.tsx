"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Users, Key, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';

export default function RoomIdSharePage() {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from('global_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleShare = async () => {
    if (!message && !roomId && !password) {
      alert('Please enter at least a message or Room ID details.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('global_announcements').insert([{
      message,
      room_id: roomId,
      room_password: password
    }]);

    if (error) {
      alert('Failed to send announcement: ' + error.message);
    } else {
      alert('Successfully shared with all users!');
      setMessage('');
      setRoomId('');
      setPassword('');
      fetchHistory();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this announcement?")) return;
    const { error } = await supabase.from('global_announcements').delete().eq('id', id);
    if (!error) fetchHistory();
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-yellow-500" />
          Room ID Share
        </h1>
        <p className="text-white/60">Broadcast announcements, Room IDs, and Passwords to all registered users in the Tournament Group.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Share Form */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-white/5 p-5 border-b border-white/10">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-yellow-500" /> New Broadcast
            </h3>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" /> Announcement Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write an announcement or instructions..."
                rows={4}
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Key className="w-3 h-3" /> Room ID
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="e.g. 1234567"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Key className="w-3 h-3" /> Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. xylo123"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50"
                />
              </div>
            </div>

            <button
              onClick={handleShare}
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase tracking-widest rounded-xl py-4 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              {loading ? 'Sending...' : 'Fire Room ID to All Users'}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-white/5 p-5 border-b border-white/10">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Broadcast History
            </h3>
          </div>
          <div className="p-6">
            {historyLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-center text-white/40 py-8">No broadcasts sent yet.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {history.map((item) => (
                  <div key={item.id} className="bg-black/50 border border-white/5 p-4 rounded-xl relative group">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="absolute top-2 right-2 text-xs text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                    <div className="text-xs text-white/40 mb-2">{new Date(item.created_at).toLocaleString()}</div>
                    {item.message && <div className="text-white/80 text-sm mb-3">{item.message}</div>}
                    {(item.room_id || item.room_password) && (
                      <div className="flex gap-4">
                        {item.room_id && (
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">ID</span>
                            <div className="text-yellow-500 font-mono text-sm">{item.room_id}</div>
                          </div>
                        )}
                        {item.room_password && (
                          <div>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest">Pass</span>
                            <div className="text-white font-mono text-sm">{item.room_password}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
