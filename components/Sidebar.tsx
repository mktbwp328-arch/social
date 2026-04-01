"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Home,
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  Key,
  LogOut,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Post", href: "/create", icon: PlusCircle },
  { name: "History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Platform Credentials", href: "/credentials", icon: Key },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  if (pathname === "/login") return null;

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-lg font-extrabold tracking-tight text-foreground">SocialSched</span>
      </div>

      <nav className="space-y-1 flex-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Local Mode Indicator */}
      <div className="mt-auto pt-6 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">Local User</p>
            <p className="text-[10px] text-muted-foreground">Admin Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
