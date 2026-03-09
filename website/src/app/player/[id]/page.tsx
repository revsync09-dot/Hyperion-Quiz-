"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { fetchPlayer } from "@/lib/api";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Link from "next/link";
import DiscordEmoji from "@/components/DiscordEmoji";
import DiscordAvatar from "@/components/DiscordAvatar";

export default function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (id) {
      fetchPlayer(id as string)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent glow-ring" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0b0f19] p-6 text-center text-white">
        <h1 className="mb-4 text-3xl font-black sm:text-4xl">ENTITY NOT FOUND</h1>
        <p className="mb-8 max-w-md text-[#9ca3af]">The player ID {id} was not identified in the Hyperion database.</p>
        <Link href="/leaderboard" className="btn-gradient">Return to Leaderboard</Link>
      </div>
    );
  }

  const player = data.player;
  const history = data.history || [];
  const accuracy = player.games_played > 0 ? ((player.correct_answers / (player.games_played * 5)) * 100).toFixed(1) : 0;
  const chartData = history.slice().reverse().map((entry: any, index: number) => ({
    name: `Game ${index + 1}`,
    score: entry.score,
  }));

  const statCards = [
    { label: "Current Rank", value: `#${player.rank || "?"}`, icon: <DiscordEmoji name="TROPHY" className="h-6 w-6 text-white" />, color: "from-[#6c63ff] to-[#9d4edd]" },
    { label: "Quiz Coins", value: (player.coins || 0).toLocaleString(), icon: <DiscordEmoji name="COIN" className="h-6 w-6 text-white" />, color: "from-amber-400 to-orange-500" },
    { label: "Total Points", value: (player.total_points || 0).toLocaleString(), icon: <DiscordEmoji name="LEVEL" className="h-5 w-5 text-white" />, color: "from-emerald-400 to-teal-500" },
    { label: "Current Level", value: player.level || 1, icon: <DiscordEmoji name="LEVEL" className="h-5 w-5 text-white" />, color: "from-blue-400 to-cyan-500" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] px-4 pt-28 pb-20 text-white selection:bg-[#6c63ff]/30 sm:px-6 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="glass-card relative mb-8 overflow-hidden border-white/5 p-6 sm:p-8 lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#6c63ff]/10 to-transparent" />

            <div className="relative flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">
              <div className="relative">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-[#6c63ff] to-[#9d4edd] p-1 shadow-2xl sm:h-36 sm:w-36 md:h-40 md:w-40">
                  <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.25rem] bg-[#0b0f19] text-5xl font-black">
                    <DiscordAvatar
                      src={player.avatar}
                      alt={player.username || "Anonymous"}
                      fallback={player.username?.[0]?.toUpperCase() || "H"}
                      className="h-full w-full object-cover"
                      textClassName="text-5xl font-black"
                    />
                  </div>
                </div>
                <div className="absolute -right-3 -bottom-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black shadow-xl backdrop-blur-xl sm:text-base">
                  Lv {player.level || 1}
                </div>
              </div>

              <div className="relative flex-1 text-center md:text-left">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af]">
                  Verified Player Session
                </div>
                <h1 className="mb-4 text-4xl font-black uppercase italic tracking-tighter sm:text-5xl md:text-6xl">
                  {player.username || "Anonymous"}
                </h1>
                <p className="max-w-xl text-sm uppercase tracking-[0.2em] text-[#9ca3af] sm:text-base">
                  Member of the Quiz Meister server since {new Date(player.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
            {statCards.map((stat) => (
              <div key={stat.label} className="glass-card border-white/5 p-6">
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-xl`}>
                  {stat.icon}
                </div>
                <div className="mb-2 text-xs font-black uppercase tracking-widest text-[#9ca3af]">{stat.label}</div>
                <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-10">
            <div className="space-y-6 lg:col-span-1">
              <div className="glass-card border-white/5 p-6 sm:p-8 lg:p-10">
                <h3 className="mb-8 border-l-4 border-[#6c63ff] pl-4 text-lg font-black uppercase tracking-widest sm:text-xl">Performance Matrix</h3>
                <div className="space-y-8">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">Accuracy Factor</p>
                      <p className="text-3xl font-black tracking-tighter text-[#6c63ff] sm:text-4xl">{accuracy}%</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">Total Hits</p>
                      <p className="text-2xl font-black tracking-tighter">{player.correct_answers || 0}</p>
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${accuracy}%` }} className="h-full bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] glow-ring" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">Sessions</p>
                      <p className="text-2xl font-black tracking-tighter">{player.games_played || 0}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">Victories</p>
                      <p className="text-2xl font-black tracking-tighter">{player.quiz_wins || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card border-white/5 bg-gradient-to-br from-[#6c63ff]/5 to-transparent p-6 sm:p-8">
                <h3 className="mb-4 text-lg font-black uppercase tracking-widest sm:text-xl">Active Status</h3>
                <div className="flex items-center gap-4 text-sm font-black tracking-tight text-emerald-400 sm:text-lg">
                  <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                  SYNCED WITH HYPERION CORE
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2 lg:space-y-10">
              <div className="glass-card min-h-[360px] border-white/5 p-6 sm:p-8 lg:p-10">
                <h3 className="mb-8 border-l-4 border-[#9d4edd] pl-4 text-lg font-black uppercase tracking-widest sm:text-xl">Activity Pulse</h3>
                <div className="h-[260px] w-full sm:h-[300px]">
                  {!isMounted ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6c63ff] border-t-transparent" />
                    </div>
                  ) : chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6c63ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "#121826", border: "1px solid rgba(108,99,255,0.2)", borderRadius: "12px", fontSize: "12px" }} />
                        <Area type="monotone" dataKey="score" stroke="#6c63ff" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-6 text-[#9ca3af]">
                      <Gamepad2 size={64} className="opacity-10" />
                      <p className="text-center text-sm font-bold uppercase tracking-widest">Insufficient pulse data identified</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-card border-white/5 p-6 sm:p-8 lg:p-10">
                <h3 className="mb-8 border-l-4 border-emerald-400 pl-4 text-lg font-black uppercase tracking-widest sm:text-xl">Engagement Log</h3>
                <div className="space-y-4">
                  {history.length > 0 ? history.map((entry: any, index: number) => (
                    <div key={index} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:border-[#6c63ff]/20 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-black ${entry.position <= 3 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#9ca3af]"}`}>
                            {entry.position || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-base font-black tracking-tight sm:text-lg">Quiz Performance Result</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                              {new Date(entry.quiz_games?.started_at || entry.created_at || Date.now()).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xl font-black tracking-tighter">{entry.score} Pts</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Validated</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="py-10 text-center text-[#9ca3af]">No log entries identified for this entity.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
