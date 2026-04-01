"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

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
  { id: "facebook", name: "Meta (Facebook)", icon: FacebookIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, color: "text-slate-800 dark:text-white", bg: "bg-slate-800/10 dark:bg-white/10" },
  { id: "youtube", name: "Google (YouTube)", icon: YoutubeIcon, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function SettingsPage() {
  const [formData, setFormData] = useState<Record<string, { client_id: string; client_secret: string }>>({
    facebook: { client_id: "", client_secret: "" },
    tiktok: { client_id: "", client_secret: "" },
    youtube: { client_id: "", client_secret: "" },
  });
  
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Record<string, { type: 'success' | 'error', message: string } | null>>({});

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const result = await response.json();
      if (response.ok && result.data) {
        const newData = { ...formData };
        result.data.forEach((item: any) => {
          if (newData[item.platform]) {
            newData[item.platform].client_id = item.client_id;
            // Secret is not returned in GET for security, so we leave it empty unless editing
          }
        });
        setFormData(newData);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (platform: string, field: 'client_id' | 'client_secret', value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: { ...prev[platform], [field]: value }
    }));
  };

  const toggleSecret = (platform: string) => {
    setShowSecrets(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const handleSave = async (platform: string) => {
    setLoading(prev => ({ ...prev, [platform]: true }));
    setStatus(prev => ({ ...prev, [platform]: null }));

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          client_id: formData[platform].client_id,
          client_secret: formData[platform].client_secret,
        }),
      });

      if (!response.ok) throw new Error("Failed to save credentials");

      setStatus(prev => ({ ...prev, [platform]: { type: 'success', message: 'Settings saved!' } }));
      // Clear secret after save for security
      handleChange(platform, 'client_secret', '');
    } catch (err: any) {
      setStatus(prev => ({ ...prev, [platform]: { type: 'error', message: err.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Developer Settings
        </h1>
        <p className="text-muted-foreground">Manage your Social Media API credentials safely. These keys are used for OAuth connectivity.</p>
      </div>

      <div className="space-y-8">
        {PLATFORMS.map((platform) => (
          <div key={platform.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border border-border", platform.bg)}>
                  <platform.icon className={cn("w-6 h-6", platform.color)} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground">Configure Client ID and Secret</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
            </div>

            <div className="p-6 space-y-6">
              {status[platform.id] && (
                <div className={cn(
                  "p-3 rounded-lg flex items-center gap-2 text-sm font-medium border animate-in fade-in duration-300",
                  status[platform.id]?.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  {status[platform.id]?.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {status[platform.id]?.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Client ID / Key</label>
                  <input 
                    type="text"
                    value={formData[platform.id].client_id}
                    onChange={(e) => handleChange(platform.id, 'client_id', e.target.value)}
                    placeholder="Enter your Client ID"
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Client Secret</label>
                  <div className="relative">
                    <input 
                      type={showSecrets[platform.id] ? "text" : "password"}
                      value={formData[platform.id].client_secret}
                      onChange={(e) => handleChange(platform.id, 'client_secret', e.target.value)}
                      placeholder={formData[platform.id].client_id ? "•••••••• (Encrypted)" : "Enter your Client Secret"}
                      className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all pr-12"
                    />
                    <button 
                      type="button"
                      onClick={() => toggleSecret(platform.id)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showSecrets[platform.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => handleSave(platform.id)}
                  disabled={loading[platform.id]}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {loading[platform.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save {platform.name} Keys
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex gap-4 items-start">
        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-amber-500 font-bold">Important Security Note</h4>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            These keys are stored in your profile and used only for your account. 
            Ensure your Supabase project has <strong>Row Level Security (RLS)</strong> enabled for the <code>api_settings</code> table.
          </p>
        </div>
      </div>
    </div>
  );
}
