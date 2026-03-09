"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Globe, Shield, Activity, Terminal } from "lucide-react";
import { fetchUpdates } from "@/lib/api";
import { siteConfig } from "@/lib/siteConfig";

const CategoryIcon = ({ cat }: { cat: string }) => {
  if (cat === "BOT") return <Bot size={18} className="text-[#6c63ff]" />;
  if (cat === "WEBSITE") return <Globe size={18} className="text-[#9d4edd]" />;
  return <Shield size={18} className="text-emerald-400" />;
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates()
      .then((data) => setUpdates(data.updates || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0f19]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#6c63ff] border-t-transparent glow-ring" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] px-4 pt-28 pb-20 text-white selection:bg-[#6c63ff]/30 sm:px-6 sm:pt-32 sm:pb-24">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="mb-14 text-center sm:mb-20">
            <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#9ca3af] sm:text-xs sm:tracking-[0.3em]">
              <Activity size={14} className="animate-pulse text-[#6c63ff]" />
              {siteConfig.botName} System Log
            </div>
            <h1 className="mb-6 text-4xl font-black uppercase italic tracking-tighter sm:text-5xl md:text-7xl">
              Update{" "}
              <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">
                Timeline
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm text-[#9ca3af] sm:text-lg">
              Every notable bot and website change, laid out cleanly for mobile and desktop.
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-[#6c63ff]/40 via-white/5 to-transparent md:block" />

            <div className="space-y-8 sm:space-y-14">
              {updates.length > 0 ? updates.map((update, index) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col gap-5 md:flex-row md:items-center md:gap-12 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-[#0b0f19] bg-[#6c63ff] shadow-[0_0_15px_rgba(108,99,255,0.6)] md:block" />

                  <div className="flex-1">
                    <div className={`glass-card border-white/5 p-5 sm:p-8 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div className={`mb-4 flex items-center gap-3 ${index % 2 === 0 ? "md:justify-end" : "md:justify-start"}`}>
                        {index % 2 === 0 ? <CategoryIcon cat={update.category} /> : null}
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c63ff] sm:text-xs">
                          {update.category} Update
                        </span>
                        {index % 2 !== 0 ? <CategoryIcon cat={update.category} /> : null}
                      </div>

                      <div className="mb-4 text-xs font-black uppercase tracking-widest text-[#9ca3af] sm:text-sm">
                        {update.version} • {new Date(update.created_at).toLocaleDateString()}
                      </div>
                      <h3 className="mb-4 text-xl font-black uppercase italic tracking-tighter sm:text-2xl">{update.title}</h3>
                      <p className="text-sm leading-7 text-[#9ca3af]">{update.content}</p>
                    </div>
                  </div>

                  <div className="hidden flex-1 md:block" />
                </motion.div>
              )) : (
                <div className="py-20 text-center text-[#9ca3af]">No update entries available yet.</div>
              )}
            </div>
          </div>

          <div className="mt-16 text-center sm:mt-28">
            <div className="glass-card border-[#6c63ff]/20 bg-gradient-to-br from-[#6c63ff]/5 to-transparent p-6 sm:p-10">
              <Terminal size={32} className="mx-auto mb-6 text-[#6c63ff]" />
              <h3 className="mb-4 text-xl font-black uppercase tracking-widest">Protocol Alignment</h3>
              <p className="mx-auto max-w-lg text-sm leading-7 text-[#9ca3af]">
                Any important bot or website change is logged here directly, so the website stays aligned with the actual deployed system.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
