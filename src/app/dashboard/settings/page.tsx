"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, IndianRupee, Image as ImageIcon, ToggleLeft, ToggleRight, Upload } from 'lucide-react';
import { updateSettingsAction } from './actions';

export default function SettingsPage() {
  const [fee, setFee] = useState<string>('');
  const [categoriesBg, setCategoriesBg] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('settings')
      .select('registration_fee, tournament_categories_bg_url')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error fetching settings:', error.message, error.details, error.hint, error);
        setMessage({ type: 'error', text: 'Failed to load settings.' });
      }
    } else if (data) {
      setFee(data.registration_fee.toString());
      if (data.tournament_categories_bg_url !== null) {
        setCategoriesBg(data.tournament_categories_bg_url);
      }
    }
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBg(true);
    setMessage(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `backgrounds/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      setCategoriesBg(data.publicUrl);
      setMessage({ type: 'success', text: 'Background uploaded! Click Save to apply changes.' });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: `Failed to upload image: ${error.message}` });
    } finally {
      setUploadingBg(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const numericFee = parseFloat(fee);
    if (isNaN(numericFee) || numericFee < 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive number.' });
      setSaving(false);
      return;
    }

    const result = await updateSettingsAction(numericFee, categoriesBg || null);

    if (result.error) {
      console.error('Error saving settings:', result.error);
      setMessage({ type: 'error', text: `Failed to save settings: ${result.error}` });
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    }
    setSaving(false);

    // Clear success message after 3 seconds
    setTimeout(() => {
      setMessage((prev) => prev?.type === 'success' ? null : prev);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
          <Settings className="w-8 h-8 text-yellow-500" />
          Settings
        </h1>
        <p className="text-white/50 text-sm mt-1">Configure global tournament variables and options</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">
          Global Settings
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Registration Fee */}
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-bold uppercase tracking-widest">
                Registration Fee (₹)
              </label>
              <div className="relative">
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
                  placeholder="e.g. 99"
                />
              </div>
              <p className="text-white/40 text-xs mt-2">
                This amount will be charged when users register for a tournament.
              </p>
            </div>

            <hr className="border-white/10" />

            {/* Tournament Categories Background */}
            <div className="space-y-4">
              <div className="pt-4 space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                  <label className="text-white/70 text-sm font-bold uppercase tracking-widest">
                    Background Image / URL
                  </label>
                  
                  <div className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ImageIcon className="w-4 h-4 text-white/40" />
                      </div>
                      <input
                        type="text"
                        value={categoriesBg}
                        onChange={(e) => setCategoriesBg(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Paste URL or upload image below..."
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-2 px-4 transition-all text-sm font-medium text-white/70">
                        {uploadingBg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploadingBg ? 'Uploading...' : 'Upload Photo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploadingBg}
                        />
                      </label>
                      {categoriesBg && (
                        <button
                          type="button"
                          onClick={() => setCategoriesBg('')}
                          className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-white/40 text-xs">
                    Leave blank to use the default animated grid background.
                  </p>
                </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving || uploadingBg}
                className="flex items-center justify-center gap-2 w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-4 px-8 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
