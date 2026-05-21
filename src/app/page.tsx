import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Sparkles, Brain, Clock, Zap, ShieldCheck, Check, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full filter blur-3xl -z-10 animate-pulse delay-1000"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-pink-500/5 rounded-full filter blur-3xl -z-10"></div>

      {/* Header / Navigation */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <img src="/logo.png" alt="SummifyAI Logo" className="h-9 w-9 rounded-lg object-cover shadow-md shadow-indigo-500/20" />
            <span>Summify<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span></span>
          </div>

          <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {userId ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link 
                  href="/sign-in" 
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/sign-up" 
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20 lg:py-32 max-w-5xl mx-auto z-10">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8">
          Read Faster, Understand Deeper with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block sm:inline">
            Smarter AI Summaries
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Instantly condense complex articles, research papers, or walls of text into crisp, high-level summaries and simple-to-digest explanations. Keep track of your reading history effortlessly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          {userId ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Access Your Dashboard
              <ArrowRight className="ml-2.5 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/sign-up"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Get Started for Free
                <ArrowRight className="ml-2.5 h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all duration-300"
              >
                Learn More
              </a>
            </>
          )}
        </div>

        {/* Floating dashboard preview visual */}
        <div className="mt-16 sm:mt-24 w-full rounded-2xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/0 to-pink-500/10 rounded-2xl -z-10"></div>
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <div className="text-xs text-slate-500 ml-4 font-mono">summify-ai.com/dashboard</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="col-span-2 space-y-4">
              <div className="h-44 rounded-lg bg-slate-950/80 border border-slate-800/60 p-4 flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-semibold uppercase">Paste your text here</span>
                <span className="text-sm text-slate-400 italic">"Artificial intelligence is transforming every industry... Explain this in a simple 3-point bullet summary."</span>
                <div className="self-end px-3 py-1.5 rounded-md bg-indigo-600/80 text-xs font-bold text-white">Generate</div>
              </div>
              <div className="h-48 rounded-lg bg-slate-950/80 border border-slate-800/60 p-4">
                <span className="text-xs text-indigo-400 font-bold uppercase block mb-2">Streaming Response</span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  ✦ Summary points:<br/>
                  1. AI automates complex reasoning & pattern identification.<br/>
                  2. Enables custom output generations like summaries instantly.<br/>
                  3. Accelerates productivity across documents and databases.
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-slate-950/80 border border-slate-800/60 p-4 flex flex-col gap-3">
              <span className="text-xs text-slate-500 font-semibold uppercase">History Log</span>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs truncate text-slate-300">Quantum Theory Overview</div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs truncate text-slate-300">Global Economy Trends 2026</div>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs truncate text-slate-300">Next.js App Router Setup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 border-t border-slate-900 bg-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to digest text faster</h2>
            <p className="text-slate-400">Packed with premium features to accelerate your workflow, research, and general reading.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Gemini AI Explainer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Configure your generation to act as a summary, bulleted brief, or simple analogies tailored to your comprehension level.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart History Tracking</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                All generations are instantly persisted to a Supabase database. Retrieve, review, or copy your past work at any time.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-pink-500/30 transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Vercel AI SDK Streaming</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero loading spin screens. Watch the AI build your summaries character-by-character in real-time, matching modern standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-900 bg-slate-900/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start with our free tier, and upgrade as your reading volume grows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between relative overflow-hidden">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Free Tier</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-xl text-slate-500">/ forever</span>
                </div>
                <p className="mt-6 text-slate-400 text-sm">Perfect for occasional readers who want to try out summarizing.</p>
                
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>5 generations per day</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Access to Gemini 2.5 Flash</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Persistent history logs</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={userId ? "/dashboard" : "/sign-up"}
                  className="block w-full py-3 px-4 text-center rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 hover:text-white transition-colors"
                >
                  {userId ? "Go to Dashboard" : "Sign Up Free"}
                </Link>
              </div>
            </div>

            {/* Premium Tier */}
            <div className="p-8 rounded-2xl bg-slate-900/90 border-2 border-indigo-500 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-indigo-950/40">
              <div className="absolute top-0 right-0 bg-indigo-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                Popular
              </div>
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-indigo-400">Premium Pro</span>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold tracking-tight">$9</span>
                  <span className="ml-1 text-xl text-slate-500">/ month</span>
                </div>
                <p className="mt-6 text-slate-400 text-sm">Best for students, researchers, and professionals who handle massive texts.</p>
                
                <ul className="mt-8 space-y-4 text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold text-white">Unlimited generations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Priority model access (Gemini Pro)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Advanced configurations & exporting</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                    <span>Dedicated customer support</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href={userId ? "/dashboard?upgrade=true" : "/sign-up"}
                  className="block w-full py-3 px-4 text-center rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-sm text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-bold">
            <img src="/logo.png" alt="SummifyAI Logo" className="h-6 w-6 rounded object-cover" />
            <span>SummifyAI</span>
          </div>
          <p>© {new Date().getFullYear()} SummifyAI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
