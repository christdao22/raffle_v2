import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Person } from "../components/Custom/DrawResultModal";
import { PrizeCard } from "../components/Custom/PrizeCard";
import { MultipleWinnersModal } from "../components/Modals/MultipleWinnerModal";
import { WinnerModal } from "../components/Modals/WinnerModal";
import { usePrize } from "../hooks/use-prizes";
import { useSession } from "../lib/auth-client";
import { StandBy } from "../views/live/stand-by";

const apiHost = (import.meta.env.VITE_API_URL ?? "localhost:3000").replace(/^https?:\/\//, "");

export function LiveDraw() {
  const { data: sessionData } = useSession();
  const queryClient = useQueryClient();

  const [displayType, setDisplayType] = useState("standby");
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);

  const [persons, setPersons] = useState<Person[]>([]);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawDuration, setdrawDuration] = useState(5000);

  const [countdownRemaining, setCountdownRemaining] = useState<number | null>(null);
  const countdownTickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const lastWinnerKeyRef = useRef<string | null>(null);
  const lastCountdownKeyRef = useRef<string | null>(null);

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

        if (data.type === "COUNTDOWN") {
          const { duration, startedAt } = data.payload as {
            duration: number;
            startedAt: number;
          };

          // Dedupe: ignore a re-broadcast of the same countdown start
          const countdownKey = `${duration}-${startedAt}`;
          if (lastCountdownKeyRef.current === countdownKey) {
            return;
          }
          lastCountdownKeyRef.current = countdownKey;

          // Compute remaining time from elapsed wall-clock time, so this
          // stays in sync even if this display connected mid-countdown
          // or the message arrived late.
          const elapsedSeconds = (Date.now() - startedAt) / 1000;
          const remaining = Math.max(0, Math.ceil(duration - elapsedSeconds));

          if (countdownTickRef.current) {
            clearInterval(countdownTickRef.current);
          }

          setPersons([]);
          setIsDrawing(true);
          setIsWinnerModalOpen(true);
          setCountdownRemaining(remaining);

          countdownTickRef.current = setInterval(() => {
            setCountdownRemaining((prev) => {
              if (prev === null || prev <= 1) {
                if (countdownTickRef.current) {
                  clearInterval(countdownTickRef.current);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }

        if (data.type === "WINNERS") {
          const winnerPersons = data.payload.persons as Person[];

          if (!winnerPersons?.length) {
            return;
          }

          /*
           * Create a stable key from the winner IDs.
           *
           * If the server sends the exact same winners repeatedly,
           * we ignore the duplicate message.
           */
          const winnerKey = winnerPersons.map((person) => person.id).join(",");

          if (lastWinnerKeyRef.current === winnerKey) {
            console.log("Ignoring duplicate WINNERS message");
            return;
          }

          lastWinnerKeyRef.current = winnerKey;

          // Winners arrived — countdown is done, stop any local tick.
          if (countdownTickRef.current) {
            clearInterval(countdownTickRef.current);
          }
          setCountdownRemaining(null);

          console.log("New winners:", winnerPersons);
          console.log(data.payload.spinDuration);

          setPersons(winnerPersons);
          setdrawDuration((data.payload.spinDuration ?? 5) * 1000);
          setIsDrawing(true);
          setIsWinnerModalOpen(true);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    return () => {
      if (countdownTickRef.current) {
        clearInterval(countdownTickRef.current);
      }
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      } else if (socket.readyState === WebSocket.CONNECTING) {
        socket.onopen = () => socket.close();
      }
    };
  }, [queryClient]);

  const handleCloseWinnerModal = () => {
    setIsWinnerModalOpen(false);
    setIsDrawing(false);
    setCountdownRemaining(null);

    // Allow the same winner to be drawn again later
    lastWinnerKeyRef.current = null;
    lastCountdownKeyRef.current = null;
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full h-full  border-8">
            {displayType === "standby" ? (
              <StandBy className="flex flex-col gap-6 lg:col-span-12 space-y-6" />
            ) : (
              <div className="flex flex-col gap-6 lg:col-span-12 space-y-6 h-full">
                <PrizeCard currentPrize={currentPrize} />
              </div>
            )}
          </div>

          {persons.length > 1 ? (
            <MultipleWinnersModal
              persons={persons}
              isOpen={isWinnerModalOpen}
              onClose={handleCloseWinnerModal}
            />
          ) : (
            <WinnerModal
              persons={persons}
              isOpen={isWinnerModalOpen}
              isDrawing={isDrawing}
              countdownRemaining={countdownRemaining}
              onClose={handleCloseWinnerModal}
              prizeTitle={currentPrize?.prize}
              prizeImageUrl={currentPrize?.imageUrl}
              sponsor={currentPrize?.sponsor}
            />
          )}
        </main>
      </div>
    </div>
  );
}
