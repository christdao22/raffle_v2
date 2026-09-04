import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useCallback } from "react";
import { PrizeCard } from "../components/Custom/PrizeCard";
import { RecentWinnersCard } from "../components/Custom/RecentWinnersCard";
import { MultipleWinnersModal } from "../components/Modals/MultipleWinnerModal";
import { WinnerModal } from "../components/Modals/WinnerModal";
import { useLiveSocket } from "../hooks/use-live-socket";
import { usePrize } from "../hooks/use-prizes";
import { useSession } from "../lib/auth-client";
import { StandBy } from "../views/live/stand-by";

const apiHost = (import.meta.env.VITE_API_URL ?? "localhost:3000").replace(/^https?:\/\//, "");

export function LiveDraw() {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();

  const handlePrizeSelected = useCallback(
    (prizeId: string) => {
      queryClient.invalidateQueries({ queryKey: ["prizes", "detail", prizeId] });
    },
    [queryClient],
  );

  const { state, connectionStatus } = useLiveSocket(apiHost, handlePrizeSelected);
  const { displayType, selectedPrizeId, persons, isWinnerModalOpen, count } = state;

  const { data: currentPrize } = usePrize(selectedPrizeId ?? "");

  return (
    <div className="flex h-screen min-h-dvh w-full bg-white font-sans overflow-hidden">
      <div className="flex-1 flex flex-col h-full relative">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-4 bg-tr-background backdrop-blur-sm z-10">
          <div className="flex gap-3 items-center">
            <img src="/Bagong-Pilipinas.png" alt="Deped Logo" className="w-15" loading="lazy" />
            <img
              src="/deped-logo-philippines.png"
              alt="Deped Logo"
              className="w-20"
              loading="lazy"
            />
            <h2 className="lg:text-3xl xl:text-4xl font-bold text-white tracking-tighter">
              <span className="text-tr-secondary">NATIONAL</span>{" "}
              <span className="text-tr-primary">TEACHERS'</span>{" "}
              <span className="text-tr-tertiary-fixed-dim">MONTH KICK-OFF</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span
                className={`h-2 w-2 rounded-full ${
                  connectionStatus === "connected" ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="text-tr-primary">
                {connectionStatus === "connected" ? "Live" : connectionStatus}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <div className="absolute bottom-0 left-0 w-100 h-100 rotate-90 pointer-events-none opacity-90 overflow-hidden">
            <img src="/iso.png" alt="iso" loading="lazy" />
          </div>
          <div className="absolute right-0 top-0 w-50 h-50 rotate-270 pointer-events-none opacity-90 overflow-hidden">
            <img src="/iso.png" alt="iso" loading="lazy" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full h-full">
            {displayType === "standby" && (
              <StandBy className="flex flex-col gap-6 lg:col-span-12 space-y-6" />
            )}

            {displayType === "live" && (
              <div className="flex flex-col gap-6 lg:col-span-12 space-y-6 h-full">
                <PrizeCard currentPrize={currentPrize} count={count} />
              </div>
            )}

            {displayType === "live-unclaimed" && (
              <>
                <div className="flex flex-col gap-6 lg:col-span-9 space-y-6 h-[83dvh]">
                  <PrizeCard currentPrize={currentPrize} count={count} />
                </div>
                <div className="flex flex-col gap-6 lg:col-span-3 space-y-6 h-full">
                  <RecentWinnersCard />
                </div>
              </>
            )}
          </div>

          {persons.length > 1 ? (
            <MultipleWinnersModal
              persons={persons}
              isOpen={isWinnerModalOpen}
              prizeTitle={currentPrize?.prize}
              prizeType={currentPrize?.type}
              prizeImageUrl={currentPrize?.imageUrl}
              sponsoredBy={currentPrize?.sponsor ?? ""}
              sponsorImageUrl={currentPrize?.sponsorImage}
            />
          ) : (
            <WinnerModal
              persons={persons}
              isOpen={isWinnerModalOpen}
              prizeTitle={currentPrize?.prize}
              prizeType={currentPrize?.type}
              prizeImageUrl={currentPrize?.imageUrl}
              sponsor={currentPrize?.sponsor}
              sponsorImageUrl={currentPrize?.sponsorImage}
            />
          )}
        </main>
      </div>
    </div>
  );
}
