import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0b0f19]/90 backdrop-blur-xl mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="Quiz Meister Logo" 
                className="w-10 h-10 rounded-xl object-cover"
              />
              <span className="text-lg font-bold text-white">Quiz Meister</span>
            </div>
            <p className="text-sm text-[#9ca3af] leading-relaxed">
              You want do know your Stats of the Quiz bot so you came to the right place
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/leaderboard" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Leaderboard</Link></li>
              <li><Link href="/stats" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Statistics</Link></li>
              <li><Link href="/updates" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Update Log</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Support Server</a></li>
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">GitHub</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-[#9ca3af] hover:text-white transition-colors">Imprint</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#9ca3af]">
            © {new Date().getFullYear()} Quiz Meister. All rights reserved.
          </p>
          <p className="text-xs text-[#9ca3af] flex items-center gap-1">
            Made with  <Heart size={12} className="text-red-400 fill-red-400" /> by Red_thz for you
          </p>
        </div>
      </div>
    </footer>
  );
}
