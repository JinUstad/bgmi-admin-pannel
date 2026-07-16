"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateLiveStreamAction } from './actions';
import { addPastStream, deletePastStream, getPastStreams } from './past-streams-actions';
import { MonitorPlay, Save, Loader2, Trash2, Plus } from 'lucide-react';

export default function LiveStreamPage() {
  const [url, setUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [pastStreams, setPastStreams] = useState<any[]>([]);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [newStreamUrl, setNewStreamUrl] = useState('');
  const [addingStream, setAddingStream] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPastStreams();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('live_stream_url, is_live_stream_enabled')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching live stream settings:', error);
        setMessage({ type: 'error', text: 'Failed to load settings.' });
      } else if (data) {
        setUrl(data.live_stream_url || '');
        setEnabled(data.is_live_stream_enabled || false);
      }
    } catch (err) {
      console.error('Exception fetching live stream settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPastStreams = async () => {
    const { data } = await getPastStreams();
    setPastStreams(data);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const result = await updateLiveStreamAction(url, enabled);

      if (result.error) {
        console.error('Error saving live stream settings:', result.error);
        setMessage({ type: 'error', text: `Failed to save settings: ${result.error}` });
      } else {
        setMessage({ type: 'success', text: 'Live Stream settings saved successfully!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPastStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle || !newStreamUrl) return;
    setAddingStream(true);
    
    // Extract thumbnail from YouTube URL
    let thumbnailUrl = '';
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = newStreamUrl.match(regExp);
    if (match && match[1].length === 11) {
        thumbnailUrl = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }

    const result = await addPastStream(newStreamTitle, newStreamUrl, thumbnailUrl);
    if (result.success) {
      setNewStreamTitle('');
      setNewStreamUrl('');
      fetchPastStreams();
      setMessage({ type: 'success', text: 'Past stream added successfully!' });
    } else {
      setMessage({ type: 'error', text: `Failed to add past stream: ${result.error}` });
    }
    setAddingStream(false);
  };

  const handleDeletePastStream = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stream?')) return;
    const result = await deletePastStream(id);
    if (result.success) {
      fetchPastStreams();
      setMessage({ type: 'success', text: 'Past stream deleted successfully!' });
    } else {
      setMessage({ type: 'error', text: `Failed to delete past stream: ${result.error}` });
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Active Live Stream Settings */}
      <div>
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20">
            <MonitorPlay className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-wider">Live Streaming</h1>
            <p className="text-white/50 text-sm font-medium tracking-wide">Manage the frontend live stream visibility and link</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
          
          {message && (
            <div className={`p-4 rounded-xl border font-bold uppercase tracking-widest text-sm ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-white font-bold uppercase tracking-widest text-sm flex items-center justify-between">
              Enable Live Stream Button
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </div>
            </label>
            <p className="text-white/50 text-sm">Toggle this on to make the "Live Stream" button visible in the frontend navbar.</p>
          </div>

          <div className="space-y-4">
            <label className="text-white font-bold uppercase tracking-widest text-sm block">
              Live Stream URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. https://youtube.com/live/..."
                className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
            <p className="text-white/50 text-sm">The destination URL when users click the Live Stream button.</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Past Live Streams Section */}
      <div>
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
            <MonitorPlay className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Past Streams</h2>
            <p className="text-white/50 text-sm font-medium tracking-wide">Manage previous live streams (VODs) shown on the homepage</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 md:p-8 space-y-8">
          
          <form onSubmit={handleAddPastStream} className="space-y-4 border-b border-white/10 pb-8">
            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Add New Past Stream</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  required
                  value={newStreamTitle}
                  onChange={(e) => setNewStreamTitle(e.target.value)}
                  placeholder="Stream Title"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
              <div>
                <input
                  type="url"
                  required
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  placeholder="YouTube URL"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500/50 transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingStream}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {addingStream ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              <span>Add Stream</span>
            </button>
          </form>

          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Existing Past Streams</h3>
            {pastStreams.length === 0 ? (
              <p className="text-white/30 text-sm">No past streams added yet.</p>
            ) : (
              <div className="space-y-3">
                {pastStreams.map((stream) => (
                  <div key={stream.id} className="flex items-center justify-between p-4 bg-[#111] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-4">
                      {stream.thumbnail_url && (
                        <img src={stream.thumbnail_url} alt={stream.title} className="w-20 h-12 object-cover rounded-md" />
                      )}
                      <div>
                        <h4 className="text-white font-bold">{stream.title}</h4>
                        <a href={stream.url} target="_blank" rel="noreferrer" className="text-yellow-500 text-xs hover:underline">
                          {stream.url}
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePastStream(stream.id)}
                      className="p-2 text-white/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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

