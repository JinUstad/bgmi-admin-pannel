"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Settings, Save, Loader2, IndianRupee } from 'lucide-react';
import { updateSettingsAction } from './actions';

export default function SettingsPage() {
  const [fee, setFee] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('settings')
      .select('registration_fee')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      if (error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        setMessage({ type: 'error', text: 'Failed to load settings.' });
      }
    } else if (data) {
      setFee(data.registration_fee.toString());
    }
    setLoading(false);
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

    const result = await updateSettingsAction(numericFee);

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
          Tournament Pricing
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
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

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full md:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-3 px-8 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
