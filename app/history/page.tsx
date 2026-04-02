"use client";

import { useEffect, useState } from "react";
import { Search, Calendar, CheckCircle, XCircle, Clock, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

interface Post {
  id: string;
  caption: string;
  media_url: string;
  scheduled_at: string;
  platforms: string[];
  status: string;
  created_at: string;
  error_message?: string;
}

const TABS = ["All", "Pending", "Processing", "Posted", "Failed"];

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const result = await response.json();
      if (response.ok) {
        setPosts(result.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    if (isPublishing) return;
    setIsPublishing(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert("Published successfully!");
        fetchPosts();
      } else {
        alert(`Failed: ${data.error}`);
        fetchPosts();
      }
    } catch (err: any) {
      alert("Error triggering publish");
    } finally {
      setIsPublishing(null);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === "All" || post.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = post.caption?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Post History</h1>
          <p className="text-muted-foreground mt-2">View and manage all your scheduled and published content.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-card border border-border outline-none focus:ring-2 focus:ring-primary transition-all text-sm w-full md:w-64"
            />
          </div>
          <button 
            onClick={fetchPosts}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-secondary transition-all text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto pb-px">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-border bg-secondary/20 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="w-24 text-center">Platforms</div>
          <div>Content</div>
          <div className="w-32 text-center">Status</div>
          <div className="w-64 text-right pr-4">Actions / Scheduled Date</div>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <div key={post.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center hover:bg-secondary/10 transition-colors group">
                <div className="w-24 flex justify-center gap-1">
                  {post.platforms.map(platform => (
                    <div key={platform} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border" title={platform}>
                      {platform === "facebook" && <FacebookIcon className="w-4 h-4 text-blue-500" />}
                      {platform === "tiktok" && <span className="font-bold text-[10px] leading-none">TT</span>}
                      {platform === "youtube" && <YoutubeIcon className="w-4 h-4 text-red-500" />}
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground line-clamp-1">{post.caption || "No caption"}</p>
                  {post.media_url && (
                    <span className="text-[10px] text-primary font-bold uppercase mt-1 block">Has Attachment</span>
                  )}
                  {post.error_message && (
                    <p className="text-[10px] text-red-500 mt-1 line-clamp-1" title={post.error_message}>{post.error_message}</p>
                  )}
                </div>

                <div className="w-32 flex justify-center">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full flex items-center gap-1.5",
                    post.status === "posted" && "bg-green-500/10 text-green-500",
                    post.status === "failed" && "bg-red-500/10 text-red-500",
                    post.status === "processing" && "bg-amber-500/10 text-amber-500",
                    post.status === "pending" && "bg-blue-500/10 text-blue-500",
                  )}>
                    {post.status === "posted" && <CheckCircle className="w-3 h-3" />}
                    {post.status === "failed" && <XCircle className="w-3 h-3" />}
                    {(post.status === "processing" || post.status === "pending") && <Clock className="w-3 h-3" />}
                    <span className="capitalize">{post.status}</span>
                  </span>
                </div>

                <div className="w-64 flex items-center justify-end gap-3 pr-1">
                   {(post.status === 'pending' || post.status === 'failed') && (
                     <button 
                       onClick={() => handlePublishNow(post.id)}
                       disabled={isPublishing === post.id}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                     >
                       {isPublishing === post.id ? (
                         <Loader2 className="w-3 h-3 animate-spin" />
                       ) : (
                         <Play className="w-3 h-3 fill-current" />
                       )}
                       Publish Now
                     </button>
                   )}
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(post.scheduled_at), "MMM d, h:mm a")}
                  </span>
                </div>
              </div>
            ))
          ) : (
             <div className="p-12 text-center">
                 <p className="text-muted-foreground">No posts found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
