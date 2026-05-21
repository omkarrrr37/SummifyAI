import { UserProfile } from "@clerk/nextjs";
import { Sparkles, Shield, Mail, Calendar, Key } from "lucide-react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { dark } from "@clerk/themes";

export default async function ProfilePage() {
  const { userId } = await auth();
  const user = await currentUser();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Visual Header card */}
      <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10 -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl -z-10"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-500 shadow-xl">
              <img 
                src={user?.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"} 
                alt="Profile Avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                {user?.fullName || "Active User"}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Free
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Mail className="h-3.5 w-3.5" />
                {user?.emailAddresses[0]?.emailAddress || "user@example.com"}
              </p>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "recently"}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 w-full sm:w-64">
            <span className="text-xs text-slate-500 font-semibold uppercase block mb-1.5">Usage / Limits</span>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm text-slate-300">Generations Quota</span>
              <span className="text-sm font-bold text-white">5 / Day</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[20%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Quota resets daily. Upgrade to Premium for unlimited summaries.
            </p>
          </div>
        </div>
      </div>

      {/* Clerk UserProfile view integration with elegant theme styling options */}
      <div className="flex justify-center border border-slate-800 rounded-2xl bg-slate-900/20 p-2 sm:p-4 overflow-x-auto">
        <UserProfile 
          routing="hash"
          appearance={{
            baseTheme: dark,
            elements: {
              cardBox: "mx-auto w-full max-w-full shadow-none bg-transparent border-0",
              card: "bg-slate-900/60 border border-slate-800 text-slate-100 shadow-none w-full max-w-full",
              navbar: "border-r border-slate-800/80 bg-slate-950/30",
              navbarLink: "text-slate-300 hover:text-white hover:bg-slate-800",
              navbarLinkActive: "bg-slate-800 text-white font-semibold",
              headerTitle: "text-slate-100",
              headerSubtitle: "text-slate-400",
              profileSectionTitle: "text-slate-200 border-b border-slate-800",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium",
              formButtonReset: "text-slate-400 hover:text-white hover:bg-slate-800",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-950 border-slate-800 text-slate-100 focus:border-indigo-500 focus:ring-indigo-500",
              badge: "bg-slate-800 text-slate-200 border-slate-700",
              accordionTriggerButton: "text-slate-300 hover:text-white",
              userPreviewTitle: "text-slate-200",
              userPreviewSecondaryIdentifier: "text-slate-400",
              breadcrumbsItem: "text-slate-400",
              breadcrumbsItemActive: "text-slate-200",
              breadcrumbsConnector: "text-slate-600",
            }
          }}
        />
      </div>
    </div>
  );
}
