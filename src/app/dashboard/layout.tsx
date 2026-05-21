import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Sparkles, LayoutDashboard, User } from "lucide-react";
import { dark } from "@clerk/themes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
              <img src="/logo.png" alt="SummifyAI Logo" className="h-8 w-8 rounded object-cover shadow-md shadow-indigo-500/10" />
              <span className="hidden sm:inline">Summify<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span></span>
            </Link>

            {/* Nav links */}
            <nav className="flex space-x-1 sm:space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-400" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/dashboard/profile" 
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800/60 hover:text-white transition-colors"
              >
                <User className="h-4 w-4 text-purple-400" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Free Plan
            </span>
            
            <UserButton 
              appearance={{
                baseTheme: dark,
                elements: {
                  avatarBox: "h-9 w-9 border border-indigo-500/30 rounded-full hover:scale-105 transition-transform",
                  userButtonPopoverCard: "border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl",
                  userButtonPopoverFooter: "border-t border-slate-900 bg-slate-950 text-slate-400",
                  userButtonPopoverActionButton: "hover:bg-slate-905 text-slate-300 hover:text-white transition-colors",
                  userButtonPopoverActionButtonText: "text-slate-300 hover:text-white font-medium",
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
