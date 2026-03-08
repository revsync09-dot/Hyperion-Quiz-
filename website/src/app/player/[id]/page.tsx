"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Coins, Star, Gamepad2, Target, Zap, Clock, TrendingUp } from "lucide-react";
import { fetchPlayer } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Link from "next/link";

export default function PlayerPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPlayer(id as string)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#0b0f19] min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#6c63ff] border-t-transparent rounded-full animate-spin glow-ring" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="bg-[#0b0f19] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4">ENTITY NOT FOUND</h1>
        <p className="text-[#9ca3af] mb-8">The player ID {id} was not identified in the Hyperion database.</p>
        <Link href="/leaderboard" className="btn-gradient">Return to Leaderboard</Link>
      </div>
    );
  }

  const p = data.player;
  const history = data.history || [];
  
  // Calculate stats
  const accuracy = p.games_played > 0 
    ? ((p.correct_answers / (p.games_played * 5)) * 100).toFixed(1)
    : 0;

  // Chart data mapping
  const chartData = history.slice().reverse().map((h: any, i: number) => ({
    name: `Game ${i + 1}`,
    score: h.score,
    pos: h.position
  }));

  const statCards = [
    { label: "Current Rank", value: `#${p.rank || "?"}`, icon: Trophy, color: "from-[#6c63ff] to-[#9d4edd]" },
    { label: "Hyperion Coins", value: (p.coins || 0).toLocaleString(), icon: Coins, color: "from-amber-400 to-orange-500" },
    { label: "Total Points", value: (p.total_points || 0).toLocaleString(), icon: Star, color: "from-emerald-400 to-teal-500" },
    { label: "Current Level", value: p.level || 1, icon: TrendingUp, color: "from-blue-400 to-cyan-500" },
  ];

  return (
    <div className="bg-[#0b0f19] min-h-screen pt-32 pb-24 px-6 text-white selection:bg-[#6c63ff]/30 leading-relaxed">
      <div className="max-w-7xl mx-auto">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          {/* Hero Header */}
          <div className="glass-card p-12 mb-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6c63ff]/10 to-transparent pointer-events-none" />
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-[#6c63ff] to-[#9d4edd] p-1 shadow-2xl skew-y-2">
                <div className="w-full h-full rounded-2xl bg-[#0b0f19] flex items-center justify-center text-6xl font-black -skew-y-2 overflow-hidden">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.username} className="w-full h-full object-cover opacity-90" />
                  ) : (
                    p.username?.[0]?.toUpperCase() || "H"
                  )}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center font-black text-2xl shadow-xl">
                Lv{p.level || 1}
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4">
                Verified Player Session
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase italic">
                {p.username || "Anonymous"}
              </h1>
              <p className="text-[#9ca3af] text-lg font-bold uppercase tracking-widest max-w-xl">
                Member of the Hyperion Server Guild since {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((s, i) => (
              <div key={i} className="glass-card p-8 border-white/5 group hover:border-[#6c63ff]/30 transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} className="text-white" />
                </div>
                <div className="text-sm font-black text-[#9ca3af] uppercase tracking-widest mb-2">{s.label}</div>
                <div className="text-3xl font-black tracking-tighter">{s.value}</div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Performance Stats */}
            <div className="lg:col-span-1 space-y-6">
               <div className="glass-card p-10 border-white/5">
                  <h3 className="text-xl font-black mb-8 border-l-4 border-[#6c63ff] pl-4 uppercase tracking-widest">Performance Matrix</h3>
                  <div className="space-y-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-black text-[#9ca3af] uppercase tracking-widest mb-1">Accuracy Factor</p>
                        <p className="text-4xl font-black tracking-tighter text-[#6c63ff]">{accuracy}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#9ca3af] uppercase tracking-widest mb-1">Total Hits</p>
                        <p className="text-2xl font-black tracking-tighter">{p.correct_answers || 0}</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${accuracy}%` }}
                        className="h-full bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] glow-ring"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-xs font-black text-[#9ca3af] uppercase tracking-widest mb-1">Sessions</p>
                        <p className="text-2xl font-black tracking-tighter">{p.games_played || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#9ca3af] uppercase tracking-widest mb-1">Victories</p>
                        <p className="text-2xl font-black tracking-tighter">{p.quiz_wins || 0}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="glass-card p-10 border-white/5 bg-gradient-to-br from-[#6c63ff]/5 to-transparent">
                  <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Active Status</h3>
                  <div className="flex items-center gap-4 text-emerald-400 font-black tracking-tighter text-lg">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
                    SYNCED WITH HYPERION CORE
                  </div>
               </div>
            </div>

            {/* Charts & Activity */}
            <div className="lg:col-span-2 space-y-10">
               <div className="glass-card p-10 border-white/5 min-h-[400px]">
                  <h3 className="text-xl font-black mb-10 border-l-4 border-[#9d4edd] pl-4 uppercase tracking-widest">Activity Pulse (Last 10 Games)</h3>
                  <div className="w-full h-[300px]">
                    {chartData.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={chartData}>
                           <defs>
                             <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                             </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                           <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                           <YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                           <Tooltip 
                              contentStyle={{ background: '#121826', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '12px', fontSize: '12px' }}
                              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                           />
                           <Area type="monotone" dataKey="score" stroke="#6c63ff" fillOpacity={1} fill="url(#colorScore)" strokeWidth={4} />
                         </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-[#9ca3af] gap-6">
                        <Gamepad2 size={64} className="opacity-10" />
                        <p className="font-bold tracking-widest uppercase text-sm">Insufficient Pulse Data Identified</p>
                      </div>
                    )}
                  </div>
               </div>

               <div className="glass-card p-10 border-white/5">
                  <h3 className="text-xl font-black mb-8 border-l-4 border-emerald-400 pl-4 uppercase tracking-widest">Engagement Log</h3>
                  <div className="space-y-4">
                    {history.length > 0 ? history.map((h: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#6c63ff]/20 transition-all group">
                         <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${h.position <= 3 ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[#9ca3af]"}`}>
                                {h.position || "?"}º
                            </div>
                            <div>
                               <p className="font-black tracking-tight text-lg group-hover:text-[#6c63ff] transition-colors">Quiz Performance Result</p>
                               <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest">{new Date(h.quiz_games.started_at).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black tracking-tighter">{h.score} Pts</p>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Validated</p>
                         </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-[#9ca3af] font-bold italic">No log entries identified for this entity.</div>
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
