import { Button, cn } from "@raffle_v2/ui";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import type { Person } from "../Custom/DrawResultModal";

export interface WinnerModalProps {
  isOpen?: boolean;
  isDrawing?: boolean;
  drawDuration?: number;
  onClose?: () => void;
  onClaim?: () => void;
  persons?: Person[];
  division?: string;
  prizeTitle?: string;
  showConfetti?: boolean;
  prizeImageUrl?: string;
  className?: string;
}

export function WinnerModal({
  isOpen = false,
  isDrawing = false,
  drawDuration = 5000,
  onClose,
  persons = [],
  prizeTitle = "NETHERBook Pro",
  prizeImageUrl = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  className,
  showConfetti = true,
}: WinnerModalProps) {
  const [randomText, setRandomText] = useState("");
  const [remainingTime, setRemainingTime] = useState(drawDuration);
  const [isFinished, setIsFinished] = useState(false);

  /*
   * The actual state used by the modal.
   *
   * If drawDuration is 0, immediately finish the draw.
   */
  const showWinner = !isDrawing || isFinished || drawDuration === 0;

  useEffect(() => {
    // Modal is not drawing
    if (!isDrawing) {
      setRandomText("");
      setRemainingTime(drawDuration);
      setIsFinished(false);
      return;
    }

    // Instant draw
    if (drawDuration === 0) {
      setRandomText("");
      setRemainingTime(0);
      setIsFinished(true);
      return;
    }

    setIsFinished(false);
    setRemainingTime(drawDuration);

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const generateRandomText = () => {
      return Array.from({ length: 20 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length)),
      ).join(" ");
    };

    // Random letters animation
    const randomInterval = setInterval(() => {
      setRandomText(generateRandomText());
    }, 80);

    // Start countdown
    const startTime = Date.now();

    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(drawDuration - elapsed, 0);

      setRemainingTime(remaining);

      // Timer finished
      if (remaining === 0) {
        clearInterval(timerInterval);
        clearInterval(randomInterval);

        setRandomText("");
        setIsFinished(true);
      }
    }, 50);

    return () => {
      clearInterval(randomInterval);
      clearInterval(timerInterval);
    };
  }, [isDrawing, drawDuration]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tr-surface/85 backdrop-blur-md animate-in fade-in duration-300 p-12">
      {showConfetti && showWinner && <Confetti recycle={true} numberOfPieces={50} />}

      <div
        className={cn(
          "relative w-full max-w-8xl overflow-hidden rounded-3xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-2xl font-sans text-tr-on-surface transition-all duration-700",
          showWinner ? "h-full" : "h-full",
          className,
        )}
      >
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(#0b4db8_1px,transparent_1px)] [background-size:18px_18px]" />

        {/* Close */}
        <Button
          onClick={onClose}
          disabled={isDrawing && !isFinished}
          className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-tr-surface-container-high/80 text-tr-on-surface-variant hover:bg-tr-surface-container-highest hover:text-tr-on-surface transition-all p-0 flex items-center justify-center border-0 shadow-sm"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Main content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-8 sm:px-12">
          {/* HEADER */}
          <div
            className={cn(
              "flex flex-col items-center text-center transition-all duration-700 ease-in-out",
              !showWinner
                ? "-translate-y-32 opacity-0 pointer-events-none absolute"
                : "translate-y-0 opacity-100",
            )}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <img src="/Bagong-Pilipinas.png" alt="Bagong Pilipinas" className="w-20" />

              <img src="/deped-logo-philippines.png" alt="DepEd" className="w-24" />
            </div>

            <p className="font-display font-extrabold text-sm uppercase tracking-[0.2em] text-tr-primary">
              National Teacher's Day
            </p>

            <h3 className="mt-1 font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-tr-secondary leading-none">
              Congratulations!
            </h3>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-tr-tertiary-container" />
          </div>

          {/* WINNER / DRAW CONTAINER */}
          <div
            className={cn(
              "relative w-full max-w-6xl mt-8 rounded-3xl border transition-all duration-700 ease-in-out overflow-hidden",
              showWinner
                ? "min-h-[220px] border-tr-secondary/10 bg-tr-secondary/5"
                : "min-h-[520px] scale-[1.02] border-tr-primary-container/40 bg-tr-secondary shadow-2xl",
            )}
          >
            {/* Drawing glow */}
            {!showWinner && (
              <>
                <div className="absolute inset-0 bg-tr-primary/10 animate-pulse" />

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-tr-primary-container/10 blur-3xl" />
              </>
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full min-h-[inherit] flex-col items-center justify-center p-8">
              {showWinner ? (
                persons.map((p) => {
                  return (
                    <>
                      <p className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-tr-on-surface-variant">
                        Our Lucky Winner
                      </p>

                      <h2 className="font-display font-black text-4xl sm:text-7xl lg:text-8xl uppercase tracking-tight text-tr-primary leading-none break-words text-center">
                        {p?.fullname ?? "Winner"}
                      </h2>

                      {p?.region && (
                        <div className="mt-5 rounded-full bg-tr-primary-container/10 border border-tr-primary-container/20 px-5 py-2 text-sm font-bold uppercase text-tr-primary">
                          {p.region.region}
                        </div>
                      )}
                    </>
                  );
                })
              ) : (
                <>
                  {/* Random characters */}
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-tr-on-secondary/60 text-center mb-5">
                      Randomizing Entries
                    </p>

                    <div className="font-mono font-black text-4xl sm:text-6xl lg:text-8xl tracking-tight text-tr-on-secondary text-center drop-shadow-lg">
                      {randomText || "• • • • • • • • • • • •"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* PRIZE */}
          <div
            className={cn(
              "w-full max-w-3xl transition-all duration-700",
              !showWinner ? "mt-6 opacity-50 scale-95" : "mt-6 opacity-100 scale-100",
            )}
          >
            <div className="relative overflow-hidden rounded-2xl border border-tr-tertiary-container/30 bg-tr-surface-container-low shadow-sm">
              <div className="flex items-center gap-4 p-3.5">
                <div className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-tr-surface-container-lowest border border-tr-outline-variant/20 shadow-xs">
                  <img
                    src={prizeImageUrl}
                    alt={prizeTitle}
                    className="h-full w-full object-contain p-1.5"
                  />
                </div>

                <div className="min-w-0 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-tr-primary">
                    Grand Prize
                  </span>

                  <h4 className="font-display font-black text-lg sm:text-xl uppercase text-tr-secondary truncate leading-tight">
                    {prizeTitle}
                  </h4>

                  <span className="text-xs font-semibold text-tr-on-surface-variant">
                    Sponsored: MAMBA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
