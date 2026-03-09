"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Coins, Star, Target, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { fetchLeaderboard } from "@/lib/api";
import DiscordEmoji from "@/components/DiscordEmoji";
import DiscordAvatar from "@/components/DiscordAvatar";

const TABS = [
  { key: "total_points", label: "Total Points", icon: Target },
  { key: "coins", label: "Wealth", icon: Coins },
  { key: "quiz_wins", label: "Quiz Wins", icon: Trophy },
  { key: "level", label: "Leveling", icon: Star },
];

const TIMEFRAMES = [
  { key: "all", label: "All Time" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState("total_points");
  const [timeframe, setTimeframe] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await fetchLeaderboard(tab, page, timeframe);
      setUsers(data?.users || []);
      setTotal(data?.total || 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [tab, page, timeframe]);

  const totalPages = Math.ceil(total / 10) || 1;

  function rankEmoji(rank: number) {
    if (rank === 1) return <DiscordEmoji name="FIRST" className="w-8 h-8 glow-ring rounded-full" />;
    if (rank === 2) return <DiscordEmoji name="SECOND" className="w-8 h-8" />;
    if (rank === 3) return <DiscordEmoji name="THIRD" className="w-8 h-8" />;
    return `${rank}`;
  }

  function getValueDisplay(user: any) {
    if (tab === "coins") {
      return (
        <div className="flex items-center justify-end gap-2">
          {(user.coins || 0).toLocaleString()}
          <DiscordEmoji name="COIN" className="w-6 h-6" />
        </div>
      );
    }

    if (tab === "quiz_wins") return `${user.quiz_wins || 0} Wins`;

    if (tab === "level") {
      return (
        <div className="flex items-center justify-end gap-2 text-[#9ca3af]">
          Level {user.level || 1}
          <DiscordEmoji name="LEVEL" className="w-5 h-5 opacity-50" />
        </div>
      );
    }

    return `${(user.total_points || 0).toLocaleString()} Pts`;
  }

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.discord_id?.includes(search),
  );

  return (
    <div className="bg-[#0b0f19] min-h-screen pt-32 pb-24 px-6 text-white selection:bg-[#6c63ff]/30">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
              QUIZ MEISTER{" "}
              <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
                RANKINGS
              </span>
            </h1>
            <p className="text-[#9ca3af] text-lg font-medium">The elite of the server. Updated in real-time.</p>
          </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => {
                      setTimeframe(tf.key);
                      setPage(1);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      timeframe === tf.key
                        ? "bg-[#6c63ff] text-white"
                        : "bg-white/5 text-[#9ca3af] hover:bg-white/10"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                {TABS.map((currentTab) => (
                  <button
                    key={currentTab.key}
                    disabled={timeframe !== "all"}
                    onClick={() => {
                      setTab(currentTab.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      timeframe !== "all" 
                        ? "opacity-30 cursor-not-allowed grayscale" 
                        : tab === currentTab.key
                        ? "bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] text-white shadow-[0_0_20px_rgba(108,99,255,0.3)]"
                        : "bg-white/5 text-[#9ca3af] border border-white/5 hover:border-[#6c63ff]/30 hover:text-white"
                    }`}
                  >
                    <currentTab.icon size={18} />
                    {currentTab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-sm">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Find a player..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#6c63ff]/60 focus:ring-4 focus:ring-[#6c63ff]/10 transition-all font-medium"
              />
            </div>
          </div>

          <div className="glass-card shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#6c63ff]/40 to-transparent" />

            <div className="grid grid-cols-12 gap-6 px-10 py-6 border-b border-white/5 text-xs uppercase tracking-widest text-[#9ca3af] font-black">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player Entity</div>
              <div className="col-span-2 text-right">Wealth</div>
              <div className="col-span-2 text-right">Progress</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin glow-ring" />
                <p className="text-[#9ca3af] font-bold tracking-widest animate-pulse">SYNCING DATA...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-32 text-[#9ca3af] font-bold text-xl uppercase tracking-tighter">
                No biological entities identified.
              </div>
            ) : (
              filteredUsers.map((user: any, index: number) => {
                const rank = (page - 1) * 10 + index + 1;
                const isTop3 = rank <= 3;

                return (
                  <Link href={`/player/${user.discord_id}`} key={user.id || index}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`lb-row grid grid-cols-12 gap-6 px-10 py-6 items-center border-b border-white/5 cursor-pointer relative group ${
                        isTop3 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <div className="col-span-1">
                        <span className={`text-2xl font-black ${isTop3 ? "scale-110" : "text-[#9ca3af]"}`}>
                          {rankEmoji(rank)}
                        </span>
                      </div>

                      <div className="col-span-5 flex items-center gap-5">
                        <DiscordAvatar
                          src={user.avatar}
                          alt={user.username || "Anonymous"}
                          fallback={user.username?.[0]?.toUpperCase() || "Q"}
                          className={`relative w-12 h-12 rounded-2xl object-cover flex items-center justify-center transition-all group-hover:glow-ring ${
                            isTop3
                              ? "bg-gradient-to-br from-[#6c63ff] to-[#9d4edd] text-white shadow-xl"
                              : "bg-white/10 text-[#9ca3af]"
                          }`}
                          textClassName="text-lg font-black"
                        />

                        <div className="flex flex-col">
                          <span className="font-black text-lg truncate leading-tight group-hover:text-[#6c63ff] transition-colors">
                            {user.username || "Anonymous"}
                          </span>
                          <span className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-widest">
                            {user.discord_id}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-bold text-[#9ca3af]">
                        <div className="flex items-center justify-end gap-2">
                          {(user.coins || 0).toLocaleString()}
                          <DiscordEmoji name="COIN" className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-black text-[#9ca3af]">
                        <div className="flex items-center justify-end gap-2">
                          LEVEL {user.level || 1}
                          <DiscordEmoji name="LEVEL" className="w-4 h-4 opacity-70" />
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-black text-xl hover:text-white transition-colors">
                        {getValueDisplay(user)}
                      </div>
                    </motion.div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-center gap-6 mt-16">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              title="Previous Page"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[#9ca3af] hover:text-white hover:bg-[#6c63ff]/20 disabled:opacity-20 transition-all backdrop-blur-md"
            >
              <ChevronLeft size={24} />
            </button>

            <span className="text-xl font-black bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent px-8 py-3 rounded-2xl bg-white/5 border border-white/10">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              title="Next Page"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[#9ca3af] hover:text-white hover:bg-[#6c63ff]/20 disabled:opacity-20 transition-all backdrop-blur-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
