"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, Bot, Globe, Shield, Activity, Terminal } from "lucide-react";
import { fetchUpdates } from "@/lib/api";

const CategoryIcon = ({ cat }: { cat: string }) => {
  if (cat === 'BOT') return <Bot size={18} className="text-[#6c63ff]" />;
  if (cat === 'WEBSITE') return <Globe size={18} className="text-[#9d4edd]" />;
  return <Shield size={18} className="text-emerald-400" />;
};

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates()
      .then(d => setUpdates(d.updates || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-[#0b0f19] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin glow-ring" />
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f19] min-h-screen pt-32 pb-24 px-6 text-white selection:bg-[#6c63ff]/30 leading-relaxed font-sans">
      <div className="max-w-4xl mx-auto">
        <motion.div
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-20 text-center">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 mb-6 text-xs font-black uppercase tracking-[0.3em] text-[#9ca3af]">
                <Activity size={14} className="text-[#6c63ff] animate-pulse" />
                Quiz Meister System Log: ON
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
              Update <span className="bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent">Quiz Meister</span>
            </h1>
            <p className="text-[#9ca3af] text-lg font-bold uppercase tracking-widest">Tracking the evolution of the Quiz Meister protocol.</p>
          </div>

          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#6c63ff]/40 via-white/5 to-transparent -translate-x-1/2 md:block hidden" />

            {/* Updates List */}
            <div className="space-y-16">
              {updates.length > 0 ? updates.map((update, i) => (
                <motion.div 
                    key={update.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                    {/* Node in the Middle */}
                    <div className="absolute left-0 md:left-1/2 w-4 h-4 rounded-full bg-[#6c63ff] -translate-x-1/2 z-10 hidden md:block border-4 border-[#0b0f19] shadow-[0_0_15px_rgba(108,99,255,0.6)]" />

                    <div className="flex-1 w-full">
                        <div className={`glass-card p-8 border-white/5 relative group hover:border-[#6c63ff]/30 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                            <div className={`flex items-center gap-4 mb-4 ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                                {i % 2 === 0 && <CategoryIcon cat={update.category} />}
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6c63ff]">
                                    {update.category} UPDATE
                                </span>
                                {i % 2 !== 0 && <CategoryIcon cat={update.category} />}
                            </div>

                            <div className="text-sm font-black text-[#9ca3af] mb-4 uppercase tracking-widest">{update.version} • {new Date(update.created_at).toLocaleDateString()}</div>
                            <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">{update.title}</h3>
                            <p className="text-[#9ca3af] font-medium leading-[1.8] text-sm">
                                {update.content}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 md:block hidden" />
                </motion.div>
              )) : (
                  <div className="text-center py-20 text-[#9ca3af] font-black italic">No logic gates identified. Check back later.</div>
              )}
            </div>
          </div>

          <div className="mt-32 text-center">
             <div className="glass-card p-10 border-[#6c63ff]/20 bg-gradient-to-br from-[#6c63ff]/5 to-transparent">
                  <Terminal size={32} className="mx-auto mb-6 text-[#6c63ff]" />
                  <h3 className="text-xl font-black mb-4 uppercase tracking-widest">Protocol Alignment</h3>
                  <p className="text-sm text-[#9ca3af] max-w-lg mx-auto font-medium">Any changes made to the bot or website are logged here in real-time. We continuously optimize for efficiency and engagement.</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
