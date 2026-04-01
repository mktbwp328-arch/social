import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

// Using a custom icon shape for TikTok since Lucide doesn't have it built-in by default
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const PLATFORMS = [
  { 
    id: "facebook", 
    name: "Facebook Pages", 
    description: "Publish directly to your connected Facebook Pages.",
    icon: FacebookIcon, 
    status: "connected",
    accountName: "My Business Page",
    buttonText: "Disconnect",
    color: "bg-blue-600/10 text-blue-500 border-blue-500/20"
  },
  { 
    id: "tiktok", 
    name: "TikTok", 
    description: "Upload videos directly to your TikTok account.",
    icon: TikTokIcon, 
    status: "disconnected",
    accountName: null,
    buttonText: "Connect TikTok",
    color: "bg-slate-800 text-white border-slate-700"
  },
  { 
    id: "youtube", 
    name: "YouTube", 
    description: "Schedule and publish YouTube Shorts and Videos.",
    icon: YoutubeIcon, 
    status: "error",
    accountName: "Awesome Channel",
    buttonText: "Reconnect",
    color: "bg-red-600/10 text-red-500 border-red-500/20"
  },
];

export default function CredentialsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Credentials</h1>
        <p className="text-muted-foreground mt-2">Manage your connected social media accounts to enable automated publishing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLATFORMS.map((platform) => (
          <div key={platform.id} className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden group">
            {/* Status indicator bar at top */}
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1 transition-colors",
              platform.status === "connected" && "bg-green-500",
              platform.status === "disconnected" && "bg-slate-500",
              platform.status === "error" && "bg-red-500"
            )} />

            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border", platform.color)}>
              <platform.icon className="w-8 h-8" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
            <p className="text-sm text-muted-foreground mb-6 flex-1">
              {platform.description}
            </p>

            <div className="w-full space-y-4">
              {/* Account Status */}
              <div className="flex items-center justify-center gap-2 text-sm">
                {platform.status === "connected" && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-foreground">{platform.accountName}</span>
                  </>
                )}
                {platform.status === "disconnected" && (
                  <span className="text-muted-foreground font-medium">Not connected</span>
                )}
                {platform.status === "error" && (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="font-medium text-red-500">Authentication expired</span>
                  </>
                )}
              </div>

              {/* Action Button */}
              <button className={cn(
                "w-full py-2.5 px-4 rounded-md font-semibold transition-all",
                platform.status === "connected" 
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                  : platform.status === "error"
                    ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}>
                {platform.buttonText}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
