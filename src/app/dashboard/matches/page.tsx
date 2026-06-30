"use client";

import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Matches</h1>
          <p className="text-white/60">Manage your tournament matches here.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4"
      >
        <div className="w-16 h-16 bg-purple-500/20 text-purple-500 rounded-2xl flex items-center justify-center mb-2">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
        <p className="text-white/50 max-w-md">
          The matches management interface is currently under development. Soon you will be able to create, schedule, and manage all your tournament matches from here.
        </p>
      </motion.div>
    </div>
  );
}
