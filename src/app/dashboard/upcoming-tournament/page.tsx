"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Image as ImageIcon, Type, Trophy } from "lucide-react";

export default function UpcomingTournamentAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    headline: "Upcoming Tournament",
    match_name: "TDM Knockout match coming soon",
    bg_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('upcoming_tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setId(data.id);
      setFormData({
        headline: data.headline,
        match_name: data.match_name,
        bg_image_url: data.bg_image_url
      });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (id) {
        const { error } = await supabase
          .from('upcoming_tournaments')
          .update({
            headline: formData.headline,
            match_name: formData.match_name,
            bg_image_url: formData.bg_image_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('upcoming_tournaments')
          .insert([formData])
          .select()
          .single();
          
        if (error) throw error;
        if (data) setId(data.id);
      }
      
      setMessage({ type: 'success', text: 'Section updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save changes.' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Upcoming Tournament</h1>
          <p className="text-white/60">Manage the upcoming tournament section on the home page.</p>
        </div>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            
            {/* Headline */}
            <div>
              <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                <Type className="w-4 h-4 text-yellow-500" />
                Headline
              </label>
              <input 
                type="text"
                required
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                placeholder="e.g. Upcoming Tournament"
              />
            </div>

            {/* Match Name */}
            <div>
              <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Match Name &amp; Details
              </label>
              <input 
                type="text"
                required
                value={formData.match_name}
                onChange={(e) => setFormData({ ...formData, match_name: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                placeholder="e.g. TDM Knockout match coming soon"
              />
            </div>

            {/* Background Image URL */}
            <div>
              <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                <ImageIcon className="w-4 h-4 text-yellow-500" />
                Background Image URL
              </label>
              <input 
                type="url"
                required
                value={formData.bg_image_url}
                onChange={(e) => setFormData({ ...formData, bg_image_url: e.target.value })}
                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                placeholder="https://..."
              />
            </div>

          </div>

          {/* Preview Image */}
          {formData.bg_image_url && (
            <div className="mt-4">
              <label className="text-white/70 text-sm font-medium mb-2 block">Background Preview</label>
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${formData.bg_image_url})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <h3 className="text-3xl font-bold text-white mb-2">{formData.headline}</h3>
                  <p className="text-yellow-500 font-medium">{formData.match_name}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-white/10">
            <button 
              type="submit"
              disabled={saving}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold uppercase tracking-widest py-3 px-6 rounded-xl flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
