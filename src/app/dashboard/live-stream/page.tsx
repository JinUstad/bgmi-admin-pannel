"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateLiveStreamAction } from './actions';
import { MonitorPlay, Save, Loader2 } from 'lucide-react';

export default function LiveStreamPage() {
  const [url, setUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
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

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
  );
}
