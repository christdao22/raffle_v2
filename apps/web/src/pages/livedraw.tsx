import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { PrizeCard } from "../components/Custom/PrizeCard";
import { RaffleStats } from "../components/Custom/RaffleStats";
import { RecentWinnersCard } from "../components/Custom/RecentWinnersCard";
import { WinnerReveal } from "../components/Custom/WinnerReveal";
import { usePrize } from "../hooks/use-prizes";
import { useSession } from "../lib/auth-client";
import { StandBy } from "../views/live/stand-by";

const apiHost = import.meta.env.API_URL ?? "localhost:3000";

export function LiveDraw() {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();

  const [displayType, setDisplayType] = useState("live");
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);

  // Fetch current prize details whenever selectedPrizeId updates
  const { data: currentPrize, isLoading: isPrizeLoading } = usePrize(selectedPrizeId ?? "");

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${apiHost}/ws`);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "PRIZE_SELECTED") {
          const prizeId = data.payload.prizeId;
          setSelectedPrizeId(prizeId);
          setDisplayType("active"); // Switch away from standby to show draw screen

          queryClient.invalidateQueries({ queryKey: ["prizes", "detail", prizeId] });
        }

        if (data.type === "DISPLAY_SELECTION") {
          setDisplayType(data.payload);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => socket.close();
      }
    };
  }, [queryClient]);

  if (isPrizeLoading) {
    return <p>Loading</p>;
  }

  return (
    <div className={"flex h-screen min-h-dvh w-full bg-white font-sans overflow-hidden"}>
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-4 bg-tr-background backdrop-blur-sm z-10">
          <div className="flex gap-3 items-center">
            <img src="/Bagong-Pilipinas.png" alt="Deped Logo" className="w-15" />
            <img src="/deped-logo-philippines.png" alt="Deped Logo" className="w-20" />
            <h2 className="text-4xl font-bold text-white tracking-tighter">
              <span className="text-tr-secondary">NATIONAL</span>{" "}
              <span className="text-tr-primary">TEACHER'S</span>{" "}
              <span className="text-tr-tertiary-fixed-dim">DAY</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button type="button" className="flex items-center gap-3 group text-left">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-tr-secondary group-hover:text-[#FFD000] transition-colors leading-tight">
                  {sessionData?.user.name}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 capitalize">
                  {sessionData?.user.role}
                </p>
              </div>

              <div className="hidden sm:flex w-10 h-10 rounded-full bg-tr-secondary items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                {sessionData?.user && sessionData?.user.image !== null ? (
                  <img
                    src={sessionData.user.image}
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <div className="absolute bottom-0 left-0 w-100 h-100 rotate-90 pointer-events-none opacity-90 overflow-hidden">
            <img src="/iso.png" alt="iso" />
          </div>
          <div className="absolute right-0 top-0 w-50 h-50 rotate-270 pointer-events-none opacity-90 overflow-hidden">
            <img src="/iso.png" alt="iso" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {displayType === "standby" ? (
              <StandBy />
            ) : (
              <>
                <div className="flex flex-col gap-6 lg:col-span-9 space-y-6">
                  <PrizeCard currentPrize={currentPrize} />
                  <WinnerReveal />
                  <RaffleStats />
                </div>
                <div className="lg:col-span-3 flex justify-center lg:justify-end max-h-[80dvh] z-10">
                  <RecentWinnersCard />
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
