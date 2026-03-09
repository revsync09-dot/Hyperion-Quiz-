"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Coins, Star, Target, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchLeaderboard } from "@/lib/api";
import Link from "next/link";

const TABS = [
  { key: "total_points", label: "Total Points", icon: Target },
  { key: "coins", label: "Coins", icon: Coins },
  { key: "quiz_wins", label: "Quiz Wins", icon: Trophy },
  { key: "level", label: "Level", icon: Star },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState("total_points");
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const d = await fetchLeaderboard(tab, page);
      setUsers(d?.users || []);
      setTotal(d?.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tab, page]);

  const totalPages = Math.ceil(total / 10) || 1;

  const rankEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `${rank}`;
  };

  const getValueDisplay = (user: any) => {
    if (tab === "coins") return `${(user.coins || 0).toLocaleString()} 🪙`;
    if (tab === "quiz_wins") return `${user.quiz_wins || 0} Wins`;
    if (tab === "level") return `Level ${user.level || 1}`;
    return `${(user.total_points || 0).toLocaleString()} Pts`;
  };

  return (
    <div className="bg-[#0b0f19] min-h-screen pt-32 pb-24 px-6 text-white selection:bg-[#6c63ff]/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
              QUIZ MEISTER{" "}
              <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
                RANKINGS
              </span>
            </h1>
            <p className="text-[#9ca3af] text-lg font-medium">The elite of the server. Updated in real-time.</p>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setPage(1); }}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    tab === t.key
                      ? "bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] text-white shadow-[0_0_20px_rgba(108,99,255,0.3)]"
                      : "bg-white/5 text-[#9ca3af] border border-white/5 hover:border-[#6c63ff]/30 hover:text-white"
                  }`}
                >
                  <t.icon size={18} />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative w-full max-w-sm">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Find a player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#6c63ff]/60 focus:ring-4 focus:ring-[#6c63ff]/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Leaderboard Grid */}
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
            ) : users.length === 0 ? (
              <div className="text-center py-32 text-[#9ca3af] font-bold text-xl uppercase tracking-tighter">No biological entities identified.</div>
            ) : (
              users
                .filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.discord_id?.includes(search))
                .map((user: any, i: number) => {
                  const rank = (page - 1) * 10 + i + 1;
                  const isTop3 = rank <= 3;

                  return (
                    <Link href={`/player/${user.discord_id}`} key={user.id || i}>
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
                          <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black transition-all group-hover:glow-ring ${
                            isTop3
                              ? "bg-gradient-to-br from-[#6c63ff] to-[#9d4edd] text-white shadow-xl"
                              : "bg-white/10 text-[#9ca3af]"
                          }`}>
                            {user.username?.[0]?.toUpperCase() || "Q"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-lg truncate leading-tight group-hover:text-[#6c63ff] transition-colors">{user.username || "Anonymous"}</span>
                            <span className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-widest">{user.discord_id}</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-right font-bold text-[#9ca3af]">
                          {(user.coins || 0).toLocaleString()} 🪙
                        </div>
                        <div className="col-span-2 text-right font-black text-[#9ca3af]">
                          LEVEL {user.level || 1}
                        </div>
                        <div className="col-span-2 text-right font-black text-xl bg-gradient-to-b from-white to-[#9ca3af] bg-clip-text text-transparent">
                          {getValueDisplay(user)}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })
            )}
          </div>

          {/* Pagination */}
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
