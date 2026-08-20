import { cn } from "@raffle_v2/ui";
import { User } from "lucide-react";
import type React from "react";
import { Toaster } from "sonner";
import { useSession } from "../lib/auth-client";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  statusText?: string;
  isConnected?: boolean;
  className?: string;
}

export default function Layout({
  children,
  pageTitle = "Page Title",
  statusText,
  isConnected = true,
  className,
}: LayoutProps) {
  const { data } = useSession();

  return (
    <div
      className={cn(
        "flex h-screen min-h-dvh w-full bg-[#0a0f1d] text-white font-sans overflow-hidden",
        className,
      )}
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-6 border-b border-slate-800/40 bg-[#0d1326]/50 backdrop-blur-sm z-10">
          {/* Left: Title & Status */}
          <div className="flex gap-3 items-center">
            <img src="/Bagong-Pilipinas.png" alt="Deped Logo" className="w-10" />
            <img src="/deped-logo-philippines.png" alt="Deped Logo" className="w-10" />
            <h2 className="text-xl font-bold text-white tracking-tight">{pageTitle}</h2>
            {statusText && (
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isConnected ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase ${
                    isConnected ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {statusText}
                </span>
              </div>
            )}
          </div>

          {/* Right: Actions & User Profile */}
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            {/* <button
              type="button"
              className="relative text-slate-400 hover:text-white transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/ Unread Indicator Dot /}
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-[#0d1326]" />
            </button> */}

            {/* Vertical Divider */}
            {/* <div className="w-px h-8 bg-slate-800 hidden sm:block" /> */}

            {/* Admin User Profile */}
            <button type="button" className="flex items-center gap-3 group text-left">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-white group-hover:text-[#FFD000] transition-colors leading-tight">
                  {data?.user.name}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 capitalize">
                  {data?.user.role}
                </p>
              </div>

              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#faecd4] items-center justify-center text-[#0d1326] shadow-sm group-hover:scale-105 transition-transform">
                {data?.user && data?.user.image !== null ? (
                  <img
                    src={data.user.image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 fill-current" />
                )}
              </div>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-linear-to-br from-[#0d1326] to-[#12192e]">
          <div className="w-full mx-auto">{children}</div>
          <Toaster />
        </main>
      </div>
    </div>
  );
}
