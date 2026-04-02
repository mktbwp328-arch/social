"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { 
  UploadCloud, 
  Sparkles, 
  Calendar, 
  Clock,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

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
  { id: "facebook", name: "Facebook", icon: FacebookIcon, color: "hover:bg-blue-600/20 hover:text-blue-500 hover:border-blue-500" },
  { id: "tiktok", name: "TikTok", icon: TikTokIcon, color: "hover:bg-slate-800 hover:text-white hover:border-slate-400" },
  { id: "youtube", name: "YouTube", icon: YoutubeIcon, color: "hover:bg-red-600/20 hover:text-red-500 hover:border-red-500" },
];

function CreatePostContent() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [existingMediaUrl, setExistingMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const supabase = createClient();

  useEffect(() => {
    if (editId) {
      const fetchPost = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/posts/${editId}`);
          const result = await res.json();
          if (res.ok && result.data) {
            const post = result.data;
            setCaption(post.caption);
            setSelectedPlatforms(post.platforms);
            setExistingMediaUrl(post.media_url);
            
            if (post.scheduled_at) {
              const d = new Date(post.scheduled_at);
              setDate(d.toISOString().split('T')[0]);
              setTime(d.toTimeString().split(' ')[0].substring(0, 5));
            }
          }
        } catch (err) {
          console.error("Failed to load post for editing", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    }
  }, [editId]);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSchedule = async () => {
    if (!date || !time || selectedPlatforms.length === 0 || !caption) {
      setStatus({ type: 'error', message: 'Please fill in all required fields and select a platform.' });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      let mediaUrl = existingMediaUrl || "";

      // 1. Upload file if it exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
      }

      // 2. Create or Update the post
      const url = editId ? `/api/posts/${editId}` : '/api/posts';
      const method = editId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          media_url: mediaUrl,
          scheduled_at: new Date(`${date}T${time}`).toISOString(),
          platforms: selectedPlatforms,
          // If editing a failed post, reset to pending
          status: editId ? 'pending' : undefined
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to schedule post');
      }

      setStatus({ type: 'success', message: editId ? 'Post updated successfully!' : 'Post scheduled successfully!' });
      setTimeout(() => router.push('/history'), 2000);

    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-24">
      <div className="mb-8 border-b border-border pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{editId ? "Edit Post" : "Create Post"}</h1>
          <p className="text-muted-foreground mt-2">Design and schedule your content across multiple platforms.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => router.push('/history')}
            className="px-6 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSchedule}
            disabled={isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editId ? "Save Changes" : "Schedule Post")}
          </button>
        </div>
      </div>

      {status && (
        <div className={cn(
          "mb-6 p-4 rounded-xl flex items-center gap-3 border transition-all animate-in fade-in slide-in-from-top-4",
          status.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Select Platforms</h3>
            <div className="flex gap-4">
              {PLATFORMS.map((platform) => {
                const isSelected = selectedPlatforms.includes(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 w-24 rounded-xl border transition-all duration-200",
                      isSelected 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border bg-card text-muted-foreground",
                      platform.color
                    )}
                  >
                    <platform.icon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-semibold">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Media</h3>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors cursor-pointer group relative overflow-hidden",
                (file || existingMediaUrl) && "border-primary/50 bg-primary/5"
              )}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="video/*,image/*"
              />
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-border transition-colors">
                <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-foreground font-medium mb-1">
                {file ? file.name : (existingMediaUrl ? "Media Attached (Click to change)" : "Click or drag and drop to upload")}
              </p>
              <p className="text-sm text-muted-foreground">MP4, MOV, JPG or PNG (max. 500MB)</p>
              {existingMediaUrl && !file && (
                <div className="mt-4 text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Using existing media
                </div>
              )}
              {file && (
                <div className="mt-4 text-xs font-bold text-amber-500 px-3 py-1 bg-amber-500/10 rounded-full">
                  New file selected (Will replace existing)
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Caption</h3>
              <button className="text-sm flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium">
                <Sparkles className="w-4 h-4" />
                AI Suggest
              </button>
            </div>
            <div className="relative">
              <textarea 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your amazing caption here... Add hashtags for better reach!"
                className="w-full h-48 bg-card border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none transition-all"
              />
              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-medium bg-card px-2">
                {caption.length} / 2200
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Date</label>
                <div className="flex items-center bg-card border border-border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary transition-all">
                  <Calendar className="w-5 h-5 text-muted-foreground mr-2" />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-transparent text-foreground outline-none w-full cursor-pointer" 
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs text-muted-foreground font-medium mb-1 block">Time</label>
                <div className="flex items-center bg-card border border-border rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary transition-all">
                  <Clock className="w-5 h-5 text-muted-foreground mr-2" />
                  <input 
                    type="time" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent text-foreground outline-none w-full cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatePost() {
  return (
    <Suspense fallback={
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <CreatePostContent />
    </Suspense>
  );
}
