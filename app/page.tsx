import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] px-4">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Schedule Your Content,{" "}
          <span className="text-primary block mt-2">Amplify Your Reach</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Manage your social media presence across Facebook, TikTok, and YouTube from one powerful dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link
            href="/create"
            className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Create Post
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
          >
            View Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Preview Section */}
        <div className="mt-20 p-8 rounded-2xl bg-card border border-border shadow-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <h3 className="font-semibold text-lg text-foreground">Select Platforms to Post</h3>
          </div>
          <div className="flex justify-center gap-4 opacity-70">
            <div className="w-16 h-16 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-600/50">FB</div>
            <div className="w-16 h-16 rounded-xl bg-black/50 flex items-center justify-center border border-gray-600">TT</div>
            <div className="w-16 h-16 rounded-xl bg-red-600/20 flex items-center justify-center border border-red-600/50">YT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
