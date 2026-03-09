"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Trophy, Home, BarChart3, Radio, LogOut, User as UserIcon } from "lucide-react";
import { fetchBotStatus } from "@/lib/api";
import { supabaseBrowser } from "@/lib/supabase-browser";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/updates", label: "Updates", icon: Radio },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<any>({ status: 'connecting', active_games: 0 });
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    setAuthError("");

    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: `${window.location.origin}/` }
    });

    if (error) {
      if (error.message.toLowerCase().includes('provider is not enabled')) {
        setAuthError('Discord OAuth is not enabled in Supabase yet. Enable Discord under Supabase Auth > Providers and add your Vercel callback URL.');
        return;
      }

      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
  };

  useEffect(() => {
    const update = () => fetchBotStatus().then(setStatus);
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="Quiz Meister Logo" 
                className="w-10 h-10 rounded-xl shadow-lg shadow-[#6c63ff]/30 object-cover"
              />
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-muted bg-clip-text text-transparent group-hover:from-[#6c63ff] group-hover:to-[#9d4edd] transition-all duration-300">
                Quiz Meister
              </span>
            </Link>

            {/* Live Status Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div className={`w-2 h-2 rounded-full animate-pulse ${status.status === 'online' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">
                {status.status === 'online' ? 'System Live' : 'Maintenance'}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Login / User */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 group hover:border-[#6c63ff]/30 transition-all">
                  <img 
                    src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.user_metadata?.full_name || 'H'}`} 
                    alt="User"
                    className="w-7 h-7 rounded-lg ring-2 ring-[#6c63ff]/20"
                  />
                  <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                    {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleLogin}
                  className="btn-gradient text-sm !py-2.5 !px-5 inline-flex items-center gap-2"
                >
                  <svg width="18" height="14" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978Z" />
                  </svg>
                  Login with Discord
                </button>
                {authError ? (
                  <p className="max-w-xs text-right text-[11px] font-medium text-rose-300">
                    {authError}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/5"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden border-t border-white/5 bg-[#0b0f19]/95 backdrop-blur-xl"
            >
                <div className="px-4 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#9ca3af] hover:text-white hover:bg-white/5 transition-all"
                        >
                            <link.icon size={18} />
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-2">
                        {user ? (
                           <button onClick={handleLogout} className="btn-gradient w-full text-sm !py-3 !from-rose-500 !to-rose-600">
                             Logout Session
                           </button>
                        ) : (
                          <div className="space-y-2">
                            <button onClick={handleLogin} className="btn-gradient w-full text-sm !py-3">
                              Login with Discord
                            </button>
                            {authError ? (
                              <p className="text-xs text-rose-300 leading-relaxed">
                                {authError}
                              </p>
                            ) : null}
                          </div>
                        )}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
