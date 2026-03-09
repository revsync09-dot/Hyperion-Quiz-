"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Users, Gamepad2, Coins, CheckCircle2, Trophy, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";
import { fetchStats } from "@/lib/api";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

type DaySeries = {
  day: string;
  games?: number;
  players?: number;
  coins?: number;
};

type StatsPayload = {
  totalUsers: number;
  totalGamesPlayed: number;
  totalCoins: number;
  totalPoints: number;
  totalQuizWins: number;
  totalCorrectAnswers: number;
  globalAccuracy: string | number;
  gamesPerDay: DaySeries[];
  activePlayersDaily: DaySeries[];
  coinsEarnedDaily: DaySeries[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchStats()
      .then((data) => {
        if (data?.stats) setStats(data.stats);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen bg-[#0b0f19]">
        <div className="w-10 h-10 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pt-24 text-center min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <p className="text-[#9ca3af]">Could not load stats.</p>
      </div>
    );
  }

  const overviewCards = [
    { label: "Total Players", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Games Played", value: stats.totalGamesPlayed, icon: Gamepad2, color: "from-[#6c63ff] to-[#9d4edd]" },
    { label: "Total Coins", value: stats.totalCoins, icon: Coins, color: "from-amber-500 to-orange-500" },
    { label: "Correct Answers", value: stats.totalCorrectAnswers, icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
    { label: "Quiz Wins", value: stats.totalQuizWins, icon: Trophy, color: "from-purple-500 to-pink-500" },
    { label: "Total Points", value: stats.totalPoints, icon: TrendingUp, color: "from-red-500 to-rose-500" },
  ];

  const hasGamesData = stats.gamesPerDay.some((entry) => (entry.games || 0) > 0);
  const hasPlayersData = stats.activePlayersDaily.some((entry) => (entry.players || 0) > 0);
  const hasCoinsData = stats.coinsEarnedDaily.some((entry) => (entry.coins || 0) > 0);

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-[#0b0f19] px-4 pt-24 pb-16 text-white sm:px-6">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="mb-10 text-center sm:mb-12">
          <h1 className="mb-3 text-3xl font-black uppercase italic tracking-tighter sm:text-4xl md:text-5xl">
            Global{" "}
            <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
              Statistics
            </span>
          </h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9ca3af] sm:text-sm">Real system telemetry only</p>
        </motion.div>

        <motion.div variants={containerVariants} className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
          {overviewCards.map((card) => (
            <motion.div key={card.label} variants={itemVariants} className="glass-card p-4 text-center sm:p-5">
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                <card.icon size={18} className="text-white" />
              </div>
              <div className="text-lg font-black tracking-tighter sm:text-xl">{(card.value || 0).toLocaleString()}</div>
              <div className="text-[10px] text-[#9ca3af] font-black uppercase tracking-widest mt-1">{card.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <motion.div variants={itemVariants} className="glass-card min-h-[320px] p-5 sm:p-8 lg:p-10">
            <h3 className="mb-6 border-l-4 border-[#6c63ff] pl-4 text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] sm:mb-8 sm:text-sm">Games Last 14 Days</h3>
            <div className="h-[260px] w-full">
              {!isMounted ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : hasGamesData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.gamesPerDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#121826", border: "1px solid #6c63ff33", borderRadius: 12, color: "#fff" }} />
                    <Bar dataKey="games" fill="#6c63ff" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No quiz sessions recorded in the last 14 days." />
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card min-h-[320px] p-5 sm:p-8 lg:p-10">
            <h3 className="mb-6 border-l-4 border-[#22c55e] pl-4 text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] sm:mb-8 sm:text-sm">Active Players Last 14 Days</h3>
            <div className="h-[260px] w-full">
              {!isMounted ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : hasPlayersData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.activePlayersDaily}>
                    <defs>
                      <linearGradient id="gpActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#121826", border: "1px solid #22c55e33", borderRadius: 12, color: "#fff" }} />
                    <Area type="monotone" dataKey="players" stroke="#22c55e" fill="url(#gpActive)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No active player history recorded in the last 14 days." />
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card min-h-[320px] p-5 sm:p-8 lg:p-10">
            <h3 className="mb-6 border-l-4 border-amber-400 pl-4 text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] sm:mb-8 sm:text-sm">Coins Logged Last 14 Days</h3>
            <div className="h-[260px] w-full">
              {!isMounted ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : hasCoinsData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.coinsEarnedDaily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "#121826", border: "1px solid #fbbf2433", borderRadius: 12, color: "#fff" }} />
                    <Line type="monotone" dataKey="coins" stroke="#fbbf24" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No coin log activity recorded in the last 14 days." />
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card min-h-[320px] p-5 sm:p-8 lg:p-10">
            <h3 className="mb-6 border-l-4 border-[#9d4edd] pl-4 text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] sm:mb-8 sm:text-sm">Telemetry Scope</h3>
            <div className="flex h-[260px] items-center justify-center">
              <div className="max-w-sm text-center">
                <p className="mb-4 text-xl font-black tracking-tight sm:text-2xl">{stats.globalAccuracy}% Accuracy</p>
                <p className="text-sm leading-7 text-[#9ca3af]">
                  This dashboard now shows only persisted telemetry. Topic distribution is not displayed because the current quiz schema does not store per-category history yet.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <p className="max-w-xs text-sm font-bold uppercase tracking-widest text-[#9ca3af]">{message}</p>
    </div>
  );
}
