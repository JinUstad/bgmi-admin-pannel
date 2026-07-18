"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Image as ImageIcon, Type, Trophy, Plus, X, IndianRupee } from "lucide-react";
import { updateSettingsAction } from '../settings/actions';

const HOURS = Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0'));
const MINS = ['00', '15', '30', '45'];
const AMPM = ['AM', 'PM'];
const PREDEFINED_MAPS = ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik', 'Karakin', 'Nusa', 'WoW', 'Quick Match', 'TDM'];

export default function UpcomingTournamentAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    headline: "Upcoming Tournament",
    match_name: "TDM Knockout match coming soon",
    bg_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070",
    tournament_date: "2026-01-08",
    match_mode: "Squad",
    map_area: "TDM",
    custom_map_area: "",
    prize: "TBA",
    slots: [
      { startHour: "10", startMin: "00", startAmPm: "AM", endHour: "11", endMin: "00", endAmPm: "AM", capacity: 6 }
    ]
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [fee, setFee] = useState<string>('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
        headline: data.headline || "",
        match_name: data.match_name || "",
        bg_image_url: data.bg_image_url || "",
        tournament_date: data.tournament_date || "",
        match_mode: data.match_mode || "Squad",
        prize: data.prize || "TBA",
        map_area: (data.map_area && PREDEFINED_MAPS.includes(data.map_area)) ? data.map_area : (data.map_area ? 'Custom' : 'TDM'),
        custom_map_area: (data.map_area && !PREDEFINED_MAPS.includes(data.map_area)) ? data.map_area : "",
        slots: Array.isArray(data.slots) && data.slots.length > 0
          ? data.slots.map((s: any) => {
              if (s.startHour) return s; // already new format
              // fallback for older formats
              return { 
                startHour: "10", startMin: "00", startAmPm: "AM", 
                endHour: "11", endMin: "00", endAmPm: "AM", 
                capacity: s.capacity || data.slot_capacity || 6 
              };
            })
          : [
              { startHour: "10", startMin: "00", startAmPm: "AM", endHour: "11", endMin: "00", endAmPm: "AM", capacity: 6 }
            ]
      });
    }

    const { data: settingsData } = await supabase
      .from('settings')
      .select('registration_fee')
      .eq('id', 1)
      .single();

    if (settingsData) {
      setFee(settingsData.registration_fee.toString());
    }

    setLoading(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);

    const numericFee = parseFloat(fee);
    if (isNaN(numericFee) || numericFee < 0) {
      setSettingsMessage({ type: 'error', text: 'Please enter a valid positive number.' });
      setSavingSettings(false);
      return;
    }

    const result = await updateSettingsAction(numericFee);

    if (result.error) {
      console.error('Error saving settings:', result.error);
      setSettingsMessage({ type: 'error', text: `Failed to save settings: ${result.error}` });
    } else {
      setSettingsMessage({ type: 'success', text: 'Pricing saved successfully!' });
    }
    setSavingSettings(false);

    setTimeout(() => {
      setSettingsMessage((prev) => prev?.type === 'success' ? null : prev);
    }, 3000);
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
            tournament_date: formData.tournament_date,
            match_mode: formData.match_mode,
            prize: formData.prize,
            map_area: formData.map_area === 'Custom' ? formData.custom_map_area : formData.map_area,
            slots: formData.slots,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('upcoming_tournaments')
          .insert([{
            headline: formData.headline,
            match_name: formData.match_name,
            bg_image_url: formData.bg_image_url,
            tournament_date: formData.tournament_date,
            match_mode: formData.match_mode,
            prize: formData.prize,
            map_area: formData.map_area === 'Custom' ? formData.custom_map_area : formData.map_area,
            slots: formData.slots
          }])
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

      {/* Tournament Pricing Settings */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
          Tournament Pricing
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-bold uppercase tracking-widest">
              Registration Fee (₹)
            </label>
            <div className="relative max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IndianRupee className="w-5 h-5 text-white/40" />
              </div>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-colors text-lg font-bold"
                placeholder="e.g. 220"
              />
            </div>
            <p className="text-white/40 text-xs mt-2">
              This amount will be displayed and charged when users register for a tournament.
            </p>
          </div>

          {settingsMessage && (
            <div className={`p-4 rounded-xl text-sm font-bold max-w-sm ${settingsMessage.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {settingsMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={savingSettings}
            className="flex items-center justify-center gap-2 max-w-sm w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {savingSettings ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{savingSettings ? 'Saving...' : 'Save Pricing'}</span>
          </button>
        </form>
      </div>

      <form onSubmit={handleSave} className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
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

            {/* Date, Mode, Map, and Prize Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                  <Type className="w-4 h-4 text-yellow-500" />
                  Tournament Date
                </label>
                <input 
                  type="date"
                  min="2024-01-01"
                  max="2099-12-31"
                  value={formData.tournament_date}
                  onChange={(e) => setFormData({ ...formData, tournament_date: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                  <Type className="w-4 h-4 text-yellow-500" />
                  Match Mode
                </label>
                <select 
                  value={formData.match_mode}
                  onChange={(e) => setFormData({ ...formData, match_mode: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
                >
                  <option value="Solo">Solo</option>
                  <option value="Duo">Duo</option>
                  <option value="Squad">Squad</option>
                  <option value="TDM">TDM</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                  <Type className="w-4 h-4 text-yellow-500" />
                  Tournament Map/Area
                </label>
                <select 
                  value={formData.map_area}
                  onChange={(e) => setFormData({ ...formData, map_area: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
                >
                  {PREDEFINED_MAPS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Custom">Custom...</option>
                </select>
                {formData.map_area === 'Custom' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter custom map/area..."
                    value={formData.custom_map_area}
                    onChange={(e) => setFormData({ ...formData, custom_map_area: e.target.value })}
                    className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors mt-3"
                  />
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Prize
                </label>
                <input 
                  type="text"
                  required
                  value={formData.prize}
                  onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                  className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                  placeholder="e.g. 10,000 INR"
                />
              </div>
            </div>
            {/* Dynamic Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Time Slots
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, slots: [...formData.slots, { startHour: "12", startMin: "00", startAmPm: "PM", endHour: "01", endMin: "00", endAmPm: "PM", capacity: 6 }] })}
                  className="text-xs flex items-center gap-1 bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-lg transition-colors text-white"
                >
                  <Plus className="w-3 h-3" /> Add Slot
                </button>
              </div>
              <div className="space-y-4">
                {formData.slots.map((slot, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                    {/* Time Selectors */}
                    <div className="flex items-center gap-2 flex-wrap flex-1">
                      {/* Start Time */}
                      <div className="flex items-center gap-1 bg-black rounded-lg px-2 py-1 border border-white/10">
                        <select 
                          value={slot.startHour}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].startHour = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-white focus:outline-none appearance-none cursor-pointer"
                        >
                          {HOURS.map(h => <option className="bg-[#111] text-white" key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-white/50">:</span>
                        <select 
                          value={slot.startMin}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].startMin = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-white focus:outline-none appearance-none cursor-pointer"
                        >
                          {MINS.map(m => <option className="bg-[#111] text-white" key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          value={slot.startAmPm}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].startAmPm = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-pubg-yellow font-bold focus:outline-none appearance-none cursor-pointer ml-1"
                        >
                          {AMPM.map(a => <option className="bg-[#111] text-white" key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      
                      <span className="text-white/40 text-sm font-medium">to</span>

                      {/* End Time */}
                      <div className="flex items-center gap-1 bg-black rounded-lg px-2 py-1 border border-white/10">
                        <select 
                          value={slot.endHour}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].endHour = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-white focus:outline-none appearance-none cursor-pointer"
                        >
                          {HOURS.map(h => <option className="bg-[#111] text-white" key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-white/50">:</span>
                        <select 
                          value={slot.endMin}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].endMin = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-white focus:outline-none appearance-none cursor-pointer"
                        >
                          {MINS.map(m => <option className="bg-[#111] text-white" key={m} value={m}>{m}</option>)}
                        </select>
                        <select 
                          value={slot.endAmPm}
                          onChange={(e) => { const s = [...formData.slots]; s[idx].endAmPm = e.target.value; setFormData({...formData, slots: s}); }}
                          className="bg-transparent text-pubg-yellow font-bold focus:outline-none appearance-none cursor-pointer ml-1"
                        >
                          {AMPM.map(a => <option className="bg-[#111] text-white" key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Capacity Input */}
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm whitespace-nowrap">Teams:</span>
                      <input 
                        type="number"
                        required
                        min="1"
                        value={slot.capacity}
                        onChange={(e) => {
                          const newSlots = [...formData.slots];
                          newSlots[idx].capacity = parseInt(e.target.value) || 1;
                          setFormData({ ...formData, slots: newSlots });
                        }}
                        className="w-16 bg-black border border-white/10 rounded-lg py-1.5 px-3 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-center"
                        title="Max teams for this slot"
                      />
                    </div>

                    {formData.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSlots = formData.slots.filter((_, i) => i !== idx);
                          setFormData({ ...formData, slots: newSlots });
                        }}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors shrink-0"
                        title="Remove Slot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
  );
}
