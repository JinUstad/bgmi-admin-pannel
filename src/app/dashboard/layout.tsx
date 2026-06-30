import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <header className="h-20 border-b border-white/10 flex items-center px-8 bg-[#111]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse" />
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">System Online</span>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
