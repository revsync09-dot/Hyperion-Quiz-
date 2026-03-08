"use client";
import { motion, Variants } from "framer-motion";
import { Users, Gamepad2, Coins, Zap } from "lucide-react";
import AnimatedCounter from "@/components/AnimatedCounter";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchStats } from "@/lib/api";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function HomePage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats().then((d) => {
      if (d?.stats) setStats(d.stats);
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: "Total Players", value: stats?.totalPlayers || 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "Quiz Games Played", value: stats?.totalGamesPlayed || 0, icon: Gamepad2, color: "from-[#6c63ff] to-[#9d4edd]" },
    { label: "Total Coins", value: stats?.totalCoins || 0, icon: Coins, color: "from-amber-500 to-orange-500" },
    { label: "Server Accuracy", value: `${stats?.globalAccuracy}%` || "0%", icon: Zap, color: "from-emerald-500 to-teal-500", isPercent: true },
  ];

  return (
    <div className="bg-[#0b0f19] min-h-screen text-white selection:bg-[#6c63ff]/30">
      {/* Hero Section */}
      <section className="hero-bg relative min-h-screen flex items-center justify-center pt-24 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#6c63ff]/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-[#9d4edd]/8 rounded-full blur-[140px] animate-pulse" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-[#9ca3af] mb-10 shadow-2xl backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#6c63ff] animate-ping" />
            Exclusive to the Hyperion Server
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
          >
            <span className="bg-gradient-to-b from-white to-[#9ca3af] bg-clip-text text-transparent">
              HYPERION
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
              QUIZ
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-2xl text-[#9ca3af] max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
          >
            The official competitive ecosystem of the Hyperion server. 
            Win rounds, earn coins, and cement your legacy on the leaderboard.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="btn-gradient !px-10 !py-4 text-lg shadow-[0_0_30px_rgba(108,99,255,0.3)]">
              Join the Server
            </button>
            <Link href="/leaderboard" className="px-10 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-lg backdrop-blur-sm">
              View Rankings
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-30">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              variants={itemVariants}
              className="glass-card p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-bl-[100px] transition-all group-hover:scale-110" />
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-xl mb-6 group-hover:rotate-6 transition-transform`}>
                <card.icon size={26} className="text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter target={typeof card.value === 'string' ? parseFloat(card.value) : card.value} />
                {card.isPercent && <span className="text-2xl font-bold bg-gradient-to-b from-white to-[#9ca3af] bg-clip-text text-transparent">%</span>}
              </div>
              <p className="text-sm font-bold text-[#9ca3af] uppercase tracking-widest mt-3">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <motion.div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black mb-6">BUILT FOR <span className="text-[#6c63ff]">COMPETITION</span></h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] mx-auto rounded-full" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: "Relational Tracking", desc: "Every game, every answer, every transaction is logged in our Supabase cluster for 100% data integrity.", icon: "🔮" },
            { title: "Relentless Difficulty", desc: "From Easy to Extreme. Only the sharpest minds survive the Music, Anime, and Gaming rounds.", icon: "⚡" },
            { title: "Economy Sink", desc: "Earn coins through merit. Spend them in the server. Be the richest or the smartest. Your choice.", icon: "💎" },
          ].map((feat, i) => (
            <motion.div key={i} className="glass-card p-12 text-center border-white/5 hover:border-[#6c63ff]/30 transition-all">
              <div className="text-6xl mb-8">{feat.icon}</div>
              <h3 className="text-2xl font-black mb-4">{feat.title}</h3>
              <p className="text-[#9ca3af] leading-relaxed text-lg">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
