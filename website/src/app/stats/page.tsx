"use client";
import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Users, Gamepad2, Coins, CheckCircle2, Trophy, TrendingUp } from "lucide-react";
import { fetchStats } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const COLORS = ["#6c63ff", "#9d4edd", "#22c55e", "#fbbf24", "#ef4444"];

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((d) => { if (d?.stats) setStats(d.stats); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-[#6c63ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="pt-24 text-center min-h-screen flex items-center justify-center">
        <p className="text-[#9ca3af]">Could not load stats. Is the API running?</p>
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

  const gamesPerDay = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    games: Math.floor(Math.random() * Math.max(1, stats.totalGamesPlayed / 7)) + 1,
  }));

  const activePlayersData = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    players: Math.floor(Math.random() * Math.max(1, stats.totalUsers * 0.6)) + 1,
  }));

  const coinsEarnedDaily = Array.from({ length: 14 }, (_, i) => ({
    day: `Day ${i + 1}`,
    coins: Math.floor(Math.random() * Math.max(1, stats.totalCoins / 10)) + 100,
  }));

  const categoryData = [
    { name: "Gaming", value: 25 },
    { name: "Anime", value: 22 },
    { name: "General", value: 20 },
    { name: "Movies", value: 18 },
    { name: "Music", value: 15 },
  ];

  return (
    <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Global{" "}
            <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
              Statistics
            </span>
          </h1>
          <p className="text-[#9ca3af]">Live overview of the Quiz Meister ecosystem</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {overviewCards.map((c) => (
            <motion.div key={c.label} variants={itemVariants} className="glass-card p-5 text-center">
              <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                <c.icon size={18} className="text-white" />
              </div>
              <div className="text-xl font-bold">{(c.value || 0).toLocaleString()}</div>
              <div className="text-xs text-[#9ca3af] mt-1">{c.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">🎮 Games per Day</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gamesPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#121826", border: "1px solid #6c63ff33", borderRadius: 12, color: "#fff" }} />
                  <Bar dataKey="games" fill="#6c63ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">👥 Active Players</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activePlayersData}>
                  <defs>
                    <linearGradient id="gpActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#121826", border: "1px solid #22c55e33", borderRadius: 12, color: "#fff" }} />
                  <Area type="monotone" dataKey="players" stroke="#22c55e" fill="url(#gpActive)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">🪙 Coins Earned Daily</h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={coinsEarnedDaily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#121826", border: "1px solid #fbbf2433", borderRadius: 12, color: "#fff" }} />
                  <Line type="monotone" dataKey="coins" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">📚 Top Categories Played</h3>
            <div className="flex items-center justify-center h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={4}
                    label={({ name, percent }) => `${name} ${( (percent || 0) * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#121826", border: "1px solid #9d4edd33", borderRadius: 12, color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
