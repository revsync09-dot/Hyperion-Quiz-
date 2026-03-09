"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Shield, Zap, Target, Activity, Globe, Server } from "lucide-react";
import { fetchStats, fetchBotStatus } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<any>({ status: 'connecting', active_games: 0 });

  useEffect(() => {
    fetchStats().then(setStats);
    
    const updateBotStatus = () => {
      fetchBotStatus().then(setBotStatus);
    };

    updateBotStatus();
    const interval = setInterval(updateBotStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const features = [
    { title: "Dynamic Quizzes", desc: "5 rounds of escalating difficulty from Easy to Extreme.", icon: Zap },
    { title: "Global Economy", desc: "Earn Coins and climb the Hyperion ranks with every win.", icon: Shield },
    { title: "Live Dashboards", desc: "Real-time accuracy and performance charts for every player.", icon: Activity },
  ];

  return (
    <div className="bg-[#0b0f19] min-h-screen text-white selection:bg-[#6c63ff]/30 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-[#6c63ff]/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Bot Status Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-8 group overflow-hidden relative">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] ${botStatus.status === 'online' ? 'bg-emerald-400 shadow-emerald-400/50' : 'bg-red-500 shadow-red-500/50'}`} />
               <span className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                 Hyperion Core {botStatus.status === 'online' ? 'Online' : 'Offline'}
                 {botStatus.status === 'online' && botStatus.active_games > 0 && (
                   <span className="text-[#6c63ff] ml-2">• {botStatus.active_games} Active Sessions</span>
                 )}
               </span>
            </div>

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic uppercase mb-6 leading-none">
              Hyperion <span className="text-gradient">Quiz</span>
            </h1>
            <p className="text-[#9ca3af] text-xl md:text-2xl font-bold uppercase tracking-widest max-w-3xl mx-auto mb-12">
              The Official Hyperion Server Guild STATS LIVE 'CHECK IT OUT' 
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/leaderboard" className="btn-gradient w-full sm:w-auto text-center">
                Access Leaderboard
              </Link>
              <a href="https://discord.gg/zsW99Y3m" className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest hover:bg-white/10 transition-all w-full sm:w-auto text-center">
                Join Guild
              </a>
            </div>
          </motion.div>

          {/* Aggregated Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
             <StatCard label="Total Players" value={stats?.stats?.totalPlayers || "..."} icon={Users} color="from-[#6c63ff] to-[#9d4edd]" />
             <StatCard label="Games Analyzed" value={stats?.stats?.totalGamesPlayed || "..."} icon={Globe} color="from-blue-400 to-cyan-500" />
             <StatCard label="Server Accuracy" value={`${stats?.stats?.globalAccuracy || "0"}%`} icon={Target} color="from-emerald-400 to-teal-500" />
             <StatCard label="Total Capital" value={(stats?.stats?.totalCoins || 0).toLocaleString()} icon={Shield} color="from-amber-400 to-orange-500" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-12 relative group"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#6c63ff]/10 flex items-center justify-center mb-8 group-hover:bg-[#6c63ff]/20 transition-all">
                   <f.icon size={32} className="text-[#6c63ff]" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest mb-4 italic">{f.title}</h3>
                <p className="text-[#9ca3af] font-bold uppercase tracking-tighter leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="glass-card p-8 border-white/5 group hover:border-[#6c63ff]/30 transition-all">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="text-sm font-black text-[#9ca3af] uppercase tracking-widest mb-2">{label}</div>
      <div className="text-4xl font-black tracking-tighter">{value}</div>
    </div>
  );
}
