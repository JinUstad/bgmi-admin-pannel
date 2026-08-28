"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Search, Bell, Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-close sidebar on mobile devices
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-surface-0 flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Global Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }} />
        
        {/* Ambient purple glow - top left */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[8%] w-[45%] h-[45%] rounded-full bg-purple-600/30 blur-[150px]"
        />
        
        {/* Ambient indigo glow - right */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[35%] -right-[8%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[180px]"
        />

        {/* Ambient cyan glow - bottom */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] left-[15%] w-[40%] h-[40%] rounded-full bg-cyan-500/15 blur-[140px]"
        />
      </div>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full relative ${isSidebarOpen ? 'md:ml-[272px]' : 'md:ml-20'}`}>
        {/* Premium Header */}
        <header className="h-16 border-b border-white/[0.06] flex items-center px-4 md:px-6 glassmorphism sticky top-0 z-30 justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] transition-colors text-white/60 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2 w-72 group focus-within:border-purple-500/30 focus-within:bg-white/[0.05] transition-all">
              <Search className="w-4 h-4 text-white/30 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none w-full"
              />
              <kbd className="hidden lg:inline-flex text-[10px] text-white/20 bg-white/[0.05] px-1.5 py-0.5 rounded-md border border-white/[0.06] font-mono">⌘K</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* System status */}
            <div className="hidden md:flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-emerald-500/80 text-[11px] font-semibold tracking-wide">System Online</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-white/40 hover:text-white/70">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-purple-500 border-2 border-surface-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
            </button>

            {/* Admin avatar */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/15 cursor-pointer hover:shadow-purple-500/30 transition-shadow">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
