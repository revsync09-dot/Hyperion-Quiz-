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
    if (rank === 1) return <DiscordEmoji name="FIRST" className="h-8 w-8 glow-ring rounded-full" />;
    if (rank === 2) return <DiscordEmoji name="SECOND" className="h-8 w-8" />;
    if (rank === 3) return <DiscordEmoji name="THIRD" className="h-8 w-8" />;
    return `${rank}`;
  }

  function getValueDisplay(user: any) {
    if (tab === "coins") {
      return (
        <div className="flex items-center gap-2">
          {(user.coins || 0).toLocaleString()}
          <DiscordEmoji name="COIN" className="h-5 w-5" />
        </div>
      );
    }

    if (tab === "quiz_wins") return `${user.quiz_wins || 0} Wins`;

    if (tab === "level") {
      return (
        <div className="flex items-center gap-2 text-[#9ca3af]">
          Level {user.level || 1}
          <DiscordEmoji name="LEVEL" className="h-4 w-4 opacity-70" />
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
    <div className="min-h-screen bg-[#0b0f19] px-4 pt-28 pb-20 text-white selection:bg-[#6c63ff]/30 sm:px-6 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="mb-10 text-center sm:mb-14">
            <h1 className="mb-5 text-4xl font-black tracking-tighter sm:text-5xl md:text-7xl">
              QUIZ MEISTER{" "}
              <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
                RANKINGS
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#9ca3af] sm:text-lg">The elite of the server, formatted properly for every screen.</p>
          </div>

          <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => {
                      setTimeframe(tf.key);
                      setPage(1);
                    }}
                    className={`rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                      timeframe === tf.key ? "bg-[#6c63ff] text-white" : "bg-white/5 text-[#9ca3af] hover:bg-white/10"
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {TABS.map((currentTab) => (
                  <button
                    key={currentTab.key}
                    disabled={timeframe !== "all"}
                    onClick={() => {
                      setTab(currentTab.key);
                      setPage(1);
                    }}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition-all sm:px-5 ${
                      timeframe !== "all"
                        ? "cursor-not-allowed opacity-30 grayscale"
                        : tab === currentTab.key
                          ? "bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] text-white shadow-[0_0_20px_rgba(108,99,255,0.3)]"
                          : "border border-white/5 bg-white/5 text-[#9ca3af] hover:border-[#6c63ff]/30 hover:text-white"
                    }`}
                  >
                    <currentTab.icon size={16} />
                    <span className="whitespace-nowrap">{currentTab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
              <input
                type="text"
                placeholder="Find a player..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pr-4 pl-11 text-white placeholder-[#9ca3af] transition-all focus:border-[#6c63ff]/60 focus:outline-none focus:ring-4 focus:ring-[#6c63ff]/10"
              />
            </div>
          </div>

          <div className="glass-card relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-[#6c63ff]/40 to-transparent" />

            <div className="hidden grid-cols-12 gap-6 border-b border-white/5 px-10 py-6 text-xs font-black uppercase tracking-widest text-[#9ca3af] md:grid">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player Entity</div>
              <div className="col-span-2 text-right">Wealth</div>
              <div className="col-span-2 text-right">Progress</div>
              <div className="col-span-2 text-right">Rating</div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center gap-6 py-28 sm:py-40">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent glow-ring" />
                <p className="text-sm font-bold tracking-widest text-[#9ca3af] sm:text-base">SYNCING DATA...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-6 py-24 text-center text-lg font-bold tracking-tight text-[#9ca3af] sm:text-xl">
                No players matched the current filters.
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  {filteredUsers.map((user: any, index: number) => {
                    const rank = (page - 1) * 10 + index + 1;
                    const isTop3 = rank <= 3;

                    return (
                      <Link href={`/player/${user.discord_id}`} key={user.id || index}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`lb-row grid grid-cols-12 items-center gap-6 border-b border-white/5 px-10 py-6 ${isTop3 ? "bg-white/[0.02]" : ""}`}
                        >
                          <div className="col-span-1 text-2xl font-black text-[#9ca3af]">{rankEmoji(rank)}</div>
                          <div className="col-span-5 flex items-center gap-5">
                            <DiscordAvatar
                              src={user.avatar}
                              alt={user.username || "Anonymous"}
                              fallback={user.username?.[0]?.toUpperCase() || "Q"}
                              className={`h-12 w-12 rounded-2xl object-cover transition-all ${isTop3 ? "bg-gradient-to-br from-[#6c63ff] to-[#9d4edd] text-white shadow-xl" : "bg-white/10 text-[#9ca3af]"}`}
                              textClassName="text-lg font-black"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-lg font-black leading-tight">{user.username || "Anonymous"}</div>
                              <div className="truncate text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{user.discord_id}</div>
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end font-bold text-[#9ca3af]">
                            <div className="flex items-center gap-2">
                              {(user.coins || 0).toLocaleString()}
                              <DiscordEmoji name="COIN" className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="col-span-2 flex justify-end font-black text-[#9ca3af]">
                            <div className="flex items-center gap-2">
                              LEVEL {user.level || 1}
                              <DiscordEmoji name="LEVEL" className="h-4 w-4 opacity-70" />
                            </div>
                          </div>
                          <div className="col-span-2 text-right text-xl font-black">{getValueDisplay(user)}</div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-3 p-3 md:hidden">
                  {filteredUsers.map((user: any, index: number) => {
                    const rank = (page - 1) * 10 + index + 1;

                    return (
                      <Link href={`/player/${user.discord_id}`} key={user.id || index}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border border-white/8 bg-white/[0.03] p-4"
                        >
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-xl font-black text-[#9ca3af]">
                                {rankEmoji(rank)}
                              </div>
                              <DiscordAvatar
                                src={user.avatar}
                                alt={user.username || "Anonymous"}
                                fallback={user.username?.[0]?.toUpperCase() || "Q"}
                                className="h-12 w-12 rounded-2xl object-cover bg-white/10"
                                textClassName="text-lg font-black"
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-black">{getValueDisplay(user)}</div>
                              <div className="mt-1 flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-widest text-[#9ca3af]">
                                <span>Lv {user.level || 1}</span>
                                <DiscordEmoji name="LEVEL" className="h-4 w-4 opacity-70" />
                              </div>
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-lg font-black">{user.username || "Anonymous"}</div>
                            <div className="truncate text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">{user.discord_id}</div>
                          </div>

                          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-[#9ca3af]">
                            <span className="font-bold uppercase tracking-widest">Coins</span>
                            <div className="flex items-center gap-2 font-black text-white">
                              {(user.coins || 0).toLocaleString()}
                              <DiscordEmoji name="COIN" className="h-5 w-5" />
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="mt-10 flex items-center justify-center gap-3 sm:mt-16 sm:gap-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              title="Previous Page"
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[#9ca3af] transition-all hover:bg-[#6c63ff]/20 hover:text-white disabled:opacity-20 sm:p-4"
            >
              <ChevronLeft size={22} />
            </button>

            <span className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-base font-black text-white sm:px-8 sm:text-xl">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              title="Next Page"
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-[#9ca3af] transition-all hover:bg-[#6c63ff]/20 hover:text-white disabled:opacity-20 sm:p-4"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
