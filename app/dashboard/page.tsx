import { Clock, Activity, CheckCircle, XCircle, PlusCircle } from "lucide-react";
import Link from "next/link";

const metrics = [
  { title: "Scheduled", value: "12", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Processing", value: "3", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  { title: "Published", value: "148", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  { title: "Failed", value: "2", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Link
          href="/create"
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create Post
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.title} className="p-6 rounded-xl bg-card border border-border flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium">{metric.title}</span>
              <div className={`p-2 rounded-lg ${metric.bg}`}>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </div>
            <div className="text-4xl font-bold">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Upcoming Posts</h2>
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No upcoming posts</h3>
          <p className="text-muted-foreground max-w-sm">
            You don't have any posts scheduled for the future. Create a new post to get started.
          </p>
          <Link
            href="/create"
            className="mt-4 px-6 py-2 border border-border text-foreground font-medium rounded-md hover:bg-secondary transition-colors"
          >
            Create your first post
          </Link>
        </div>
      </div>
    </div>
  );
}
