import {
  ChevronLeft,
  ChevronRight,
  CloudCheck,
  Gift,
  History,
  LayoutGrid,
  Loader2,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { signOut } from "../lib/auth-client";

export default function CollapsibleSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Automatically collapse sidebar on screens smaller than 768px (mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { name: "DASHBOARD", icon: LayoutGrid, path: "/dashboard" },
    { name: "PRIZES", icon: Gift, path: "/prizes" },
    { name: "WINNERS", icon: Trophy, path: "/winners" },
    { name: "HISTORY", icon: History, path: "/history" },
    { name: "SETTINGS", icon: Settings, path: "/settings" },
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/login";
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      className={`relative h-screen bg-[#0d1326] text-white flex flex-col justify-between p-4 transition-all duration-300 ease-in-out border-r border-slate-800/40 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 bg-[#1a233d] border border-slate-700 text-slate-300 hover:text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110 z-20"
        aria-label="Toggle Sidebar"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div>
        {/* Brand Logo & Name */}
        <div className={`flex items-center gap-3 mb-10 ${isCollapsed ? "justify-center" : "px-2"}`}>
          <div className="w-12 h-12 bg-[#FFD000] rounded-md flex-shrink-0 flex items-center justify-center text-[#0d1326] shadow-lg shadow-yellow-500/10">
            <img src="/deped-logo-philippines.png" width="40" alt="DEPED Logo" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden transition-opacity duration-200">
              <h1 className="font-extrabold text-lg tracking-wider leading-none text-white whitespace-nowrap">
                DEPED
              </h1>
              <span className="font-bold text-sm tracking-widest text-slate-300 whitespace-nowrap">
                ADMIN
              </span>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Matches active route based on current path
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={`nav-btn ${isCollapsed ? "justify-center px-0" : "px-4"} ${
                  isActive
                    ? "bg-[#FFD000] text-[#0d1326] shadow-md shadow-yellow-500/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/40"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? "text-[#0d1326]" : "text-slate-400"
                  }`}
                />

                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.name}</span>
                )}
              </Link>
            );
          })}

          <hr className="border-slate-800/80 my-4" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={isCollapsed ? "LOGOUT" : undefined}
            className={`nav-btn w-full ${
              isCollapsed ? "justify-center px-0" : "px-4"
            } text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50`}
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin text-red-400" />
            ) : (
              <LogOut className="w-5 h-5 flex-shrink-0 text-slate-400" />
            )}

            {!isCollapsed && (
              <span className="whitespace-nowrap overflow-hidden">
                {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Status Indicator */}
      <div
        className={`flex items-center text-xs text-slate-400 py-1 ${
          isCollapsed ? "justify-center" : "justify-between px-2"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium text-slate-300 whitespace-nowrap">Version 1.0</span>
          )}
        </div>

        {!isCollapsed && <CloudCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </div>
    </aside>
  );
}
