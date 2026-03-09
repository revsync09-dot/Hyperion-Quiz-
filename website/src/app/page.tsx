"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Zap, Target, Activity, Globe } from "lucide-react";
import { fetchStats, fetchBotStatus } from "@/lib/api";
import Link from "next/link";

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [botStatus, setBotStatus] = useState<any>({ status: "connecting", active_games: 0 });

  useEffect(() => {
    fetchStats().then(setStats);

    const updateBotStatus = () => {
      fetchBotStatus().then(setBotStatus);
    };

    updateBotStatus();
    const interval = setInterval(updateBotStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { title: "Dynamic Quizzes", desc: "Five rounds of escalating difficulty from Easy to Extreme.", icon: Zap },
    { title: "Global Economy", desc: "Earn coins and climb the ranks with every win.", icon: Shield },
    { title: "Live Dashboards", desc: "Track leaderboards and system activity in real time.", icon: Activity },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0b0f19] text-white selection:bg-[#6c63ff]/30">
      <section className="relative overflow-hidden px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20">
        <div className="pointer-events-none absolute top-0 left-1/2 h-[520px] w-full -translate-x-1/2 bg-gradient-to-b from-[#6c63ff]/10 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="group relative mb-6 inline-flex max-w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl sm:mb-8 sm:gap-3 sm:px-6">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              <div className={`h-3 w-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.5)] ${botStatus.status === "online" ? "bg-emerald-400 shadow-emerald-400/50" : "bg-red-500 shadow-red-500/50"}`} />
              <span className="flex flex-wrap items-center justify-center gap-2 text-center text-[10px] font-black uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]">
                <span>Quiz Meister {botStatus.status === "online" ? "Online" : "Offline"}</span>
                {botStatus.status === "online" && botStatus.active_games > 0 ? (
                  <span className="text-[#6c63ff]">{botStatus.active_games} Active Sessions</span>
                ) : null}
              </span>
            </div>

            <h1 className="mb-5 text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:mb-6 md:text-8xl lg:text-9xl">
              Quiz <span className="text-gradient">Meister</span>
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-sm font-bold uppercase tracking-[0.24em] text-[#9ca3af] sm:text-base md:mb-12 md:text-xl">
              The official Hyperion server hub for live rankings, stats, and updates.
            </p>

            <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href="/leaderboard" className="btn-gradient w-full text-center sm:w-auto">
                Access Leaderboard
              </Link>
              <a
                href="https://discord.gg/zsW99Y3m"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-center font-black uppercase tracking-[0.2em] transition-all hover:bg-white/10 sm:w-auto"
              >
                Join Guild
              </a>
            </div>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-24 lg:grid-cols-4">
            <StatCard label="Total Players" value={stats?.stats?.totalUsers || "..."} icon={Users} color="from-[#6c63ff] to-[#9d4edd]" />
            <StatCard label="Games Analyzed" value={stats?.stats?.totalGamesPlayed || "..."} icon={Globe} color="from-blue-400 to-cyan-500" />
            <StatCard label="Server Accuracy" value={`${stats?.stats?.globalAccuracy || "0"}%`} icon={Target} color="from-emerald-400 to-teal-500" />
            <StatCard label="Total Capital" value={(stats?.stats?.totalCoins || 0).toLocaleString()} icon={Shield} color="from-amber-400 to-orange-500" />
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div key={index} whileHover={{ y: -6 }} className="glass-card group relative p-8 sm:p-10 lg:p-12">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#6c63ff]/10 transition-all group-hover:bg-[#6c63ff]/20">
                  <feature.icon size={32} className="text-[#6c63ff]" />
                </div>
                <h3 className="mb-4 text-xl font-black uppercase italic tracking-[0.12em] sm:text-2xl">{feature.title}</h3>
                <p className="leading-relaxed text-[#9ca3af]">{feature.desc}</p>
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
    <div className="glass-card group border-white/5 p-6 transition-all hover:border-[#6c63ff]/30 sm:p-8">
      <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-xl transition-transform group-hover:scale-110`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="mb-2 text-sm font-black uppercase tracking-widest text-[#9ca3af]">{label}</div>
      <div className="text-3xl font-black tracking-tighter sm:text-4xl">{value}</div>
    </div>
  );
}
