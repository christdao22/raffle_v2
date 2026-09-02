import type { Person } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";
import { MapPin, Trophy } from "lucide-react";
import Confetti from "react-confetti";

export interface MultipleWinnerModalProps {
  isOpen?: boolean;
  persons?: Person[];
  prizeTitle?: string;
  prizeImageUrl?: string;
  sponsoredBy?: string;
  showConfetti?: boolean;
  className?: string;
}

export function MultipleWinnersModal({
  isOpen = false,
  persons = [],
  prizeTitle = "NETHERBook Pro",
  sponsoredBy = "MAMBA",
  showConfetti = true,
  className,
}: MultipleWinnerModalProps) {
  const winners = persons.slice(0, 10);
  const showWinner = winners.length > 0;

  if (!isOpen) return null;

  const winnerCount = winners.length;

  const getCardWidthClass = () => {
    if (winnerCount === 2) {
      return "w-full lg:w-[calc(50%-0.5rem)]";
    }

    if (winnerCount <= 4) {
      return "w-full md:w-[calc(50%-0.5rem)]";
    }

    if (winnerCount <= 8) {
      return "w-full md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]";
    }

    return "w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]";
  };

  const getNameSize = () => {
    if (winnerCount <= 2) {
      return "text-3xl sm:text-4xl xl:text-6xl";
    }

    if (winnerCount <= 4) {
      return "text-2xl sm:text-3xl xl:text-6xl";
    }

    if (winnerCount <= 6) {
      return "text-xl sm:text-2xl lg:text-3xl xl:text-5xl";
    }

    if (winnerCount <= 8) {
      return "text-xl lg:text-xl xl:text-5xl";
    }

    return "text-lg sm:text-xl lg:text-[18px] xl:text-3xl";
  };

  const getCardSize = () => {
    if (winnerCount <= 2) return "min-h-52 sm:min-h-64";
    if (winnerCount <= 4) return "min-h-fit lg:min-h-40 xl:min-h-60";
    if (winnerCount <= 6) return "min-h-36 sm:min-h-60 lg:min-h-20 xl:min-h-60";
    return "min-h-32 sm:min-h-36  lg:min-h-20 xl:min-h-50";
  };

  const getCongratsSize = () => {
    if (winnerCount <= 2) {
      return "text-2xl lg:text-3xl xl:text-7xl";
    }

    if (winnerCount <= 4) {
      return "text-2xl lg:text-3xl xl:text-6xl";
    }

    if (winnerCount <= 6) {
      return "text-2xl lg:text-3xl xl:text-5xl";
    }

    return "text-2xl lg:text-2xl xl:text-4xl";
  };

  const getPrizeSize = () => {
    if (winnerCount <= 2) {
      return "text-base lg:text-7xl";
    }

    if (winnerCount <= 4) {
      return "text-base lg:text-6xl";
    }

    if (winnerCount <= 6) {
      return "text-base lg:text-3xl xl:text-5xl";
    }

    return "text-base lg:text-xl xl:text-4xl";
  };

  const getSponsorSize = () => {
    const sponsorLength = sponsoredBy.length;

    if (sponsorLength > 60) return "text-sm sm:text-base lg:text-2xl";
    if (sponsorLength > 35) return "text-base sm:text-lg lg:text-2xl";
    return "text-lg sm:text-xl lg:text-lg  xl:text-3xl";
  };

  //

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tr-surface/85 backdrop-blur-md animate-in fade-in duration-300 p-0">
      {showConfetti && showWinner && (
        <Confetti
          recycle
          numberOfPieces={30}
          gravity={0.18}
          className="pointer-events-none w-full"
        />
      )}

      <div
        className={cn(
          "relative flex h-full w-full max-w-8xl flex-col overflow-hidden rounded-3xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest shadow-2xl font-sans text-tr-on-surface",
          className,
        )}
      >
        {/* Background */}

        <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(#0b4db8_1px,transparent_1px)] bg-size-[18px_18px]" />

        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-tr-primary-container/10 blur-3xl pointer-events-none" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-tr-error/10 blur-3xl pointer-events-none" />

        {/* Main */}

        <div className="relative z-10 flex h-full flex-col items-center px-6 py-8 sm:px-10">
          {/* Header */}

          {showWinner && (
            <div
              className={cn(
                "shrink-0 flex flex-col items-center text-center transition-all duration-700",
                !showWinner ? "opacity-0 -translate-y-10" : "opacity-100 translate-y-0",
              )}
            >
              <div className="flex items-center gap-6 justify-center">
                <img
                  src="/Bagong-Pilipinas.png"
                  alt="Bagong Pilipinas"
                  className="w-14"
                  loading="lazy"
                />

                <p className="font-display font-extrabold text-xs sm:text-sm uppercase tracking-[0.2em] text-tr-primary">
                  National Teachers' Month Kick-off
                </p>

                <img
                  src="/deped-logo-philippines.png"
                  alt="DepEd"
                  className="w-15"
                  loading="lazy"
                />
              </div>
              <h1
                className={cn(
                  "mt-1 font-display font-black uppercase tracking-tight text-tr-secondary leading-none",
                  getCongratsSize(),
                )}
              >
                Congratulations!
              </h1>

              <div className="mt-4 h-1 w-16 rounded-full bg-tr-tertiary-container" />
            </div>
          )}

          {/* Winner Area */}

          <div
            className={cn(
              "relative flex min-h-0 w-full flex-1 justify-center overflow-y-auto rounded-3xl border transition-all duration-700 items-center",
              showWinner
                ? "mt-6 border-tr-secondary/10 bg-tr-secondary/5"
                : "mt-0 border-tr-primary-container/40 bg-tr-secondary shadow-2xl",
            )}
          >
            {/* Drawing */}

            {!showWinner && (
              <>
                <div className="absolute inset-0 bg-tr-primary/10 animate-pulse" />

                <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tr-primary-container/10 blur-3xl" />

                <div className="relative z-10 flex w-full flex-col items-center px-6">
                  <p className="mb-6 text-xs font-bold uppercase tracking-[0.3em] text-tr-on-secondary animate-pulse">
                    Selecting Multiple Winners
                  </p>

                  <span className="flex items-center justify-center gap-3  text-5xl sm:text-8xl lg:text-9xl text-white">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: for dot animation
                        key={index}
                        className="animate-dot-bounce"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        •
                      </span>
                    ))}
                  </span>

                  <div className="mt-8 flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full bg-tr-tertiary-container animate-pulse" />

                    <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-tr-on-secondary/60">
                      Drawing {winnerCount || "multiple"} winners
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Winners */}

            {showWinner && (
              <div className="relative z-10 h-full w-full px-4 py-8 sm:px-8">
                <div className="mb-6 flex items-center justify-center gap-2">
                  <Trophy className="h-5 w-5 text-tr-tertiary-container" />

                  <p className="font-display font-bold text-xs sm:text-sm xl:text-xl  uppercase tracking-[0.2em] text-tr-on-surface-variant">
                    {winnerCount} Lucky Winners
                  </p>

                  <Trophy className="h-5 w-5 text-tr-tertiary-container" />
                </div>
                <div className="text-center mb-5 flex flex-col xl:gap-5">
                  <h4
                    className={cn(
                      "font-display font-black uppercase text-tr-primary truncate leading-tight text-center",
                      getPrizeSize(),
                    )}
                  >
                    {prizeTitle}
                  </h4>
                  <span
                    className={cn(
                      "block max-w-full wrap-break-word font-semibold text-tr-on-surface-variant",
                      getSponsorSize(),
                    )}
                  >
                    {sponsoredBy}
                  </span>
                </div>
                <div className="mx-auto flex w-full max-w-8xl flex-wrap justify-center gap-4 pb-4">
                  {winners.map((person) => (
                    <div
                      key={person.id}
                      className={cn(
                        "group relative flex flex-col items-center justify-center rounded-2xl border border-tr-outline-variant/20 bg-tr-surface-container-lowest/95 px-4 py-4 text-center shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
                        getCardWidthClass(),
                        getCardSize(),
                      )}
                    >
                      {/* Winner */}

                      <h2
                        className={cn(
                          "max-w-full font-display font-black uppercase  text-tr-secondary wrap-break-word leading-2.5",
                          getNameSize(),
                        )}
                      >
                        {person.fullname ?? "Winner"}
                      </h2>

                      {/* Location */}
                      {person.region?.region && (
                        <div className="mt-4 flex max-w-full flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 text-tr-primary">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />

                            <span className="text-xs font-bold uppercase tracking-[0.12em] sm:text-sm">
                              {person.region.region}
                            </span>
                          </div>

                          {(person.schoolsDivision || person.station) && (
                            <p className="max-w-full break-words text-[10px] font-medium uppercase tracking-wide text-tr-on-surface-variant sm:text-xs">
                              {[person.schoolsDivision, person.station].filter(Boolean).join(" • ")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
