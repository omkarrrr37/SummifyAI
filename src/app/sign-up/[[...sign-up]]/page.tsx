import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-900 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-900 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span>Summify<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span></span>
          </Link>
          <h2 className="text-xl font-medium text-slate-400">Get started with SummifyAI today</h2>
        </div>

        <div className="mt-8 flex justify-center">
          <SignUp
            appearance={{
              baseTheme: dark,
              elements: {
                rootBox: "mx-auto w-full max-w-md",
                card: "bg-slate-900 border border-slate-800 shadow-2xl text-slate-100",
                headerTitle: "text-slate-100",
                headerSubtitle: "text-slate-400",
                socialButtonsBlockButton: "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200",
                socialButtonsBlockButtonText: "text-slate-200 font-medium",
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-200",
                formFieldLabel: "text-slate-300",
                formFieldInput: "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500",
                footerActionText: "text-slate-400",
                footerActionLink: "text-indigo-400 hover:text-indigo-300 hover:underline",
                dividerLine: "bg-slate-800",
                dividerText: "text-slate-500",
                identityPreviewText: "text-slate-300",
                formFieldErrorText: "text-red-400",
              },
            }}
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
