import type { Person } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";
import { MapPin, Trophy } from "lucide-react";
import Confetti from "react-confetti";

function limitStationWords(station: string) {
  const words = station.trim().split(/\s+/);

  return words.length > 2 ? `${words.slice(0, 2).join(" ")}...` : station;
}

export interface MultipleWinnerModalProps {
  isOpen?: boolean;
  persons?: Person[];
  prizeTitle?: string;
  prizeType?: string | null;
  prizeImageUrl?: string | null;
  sponsoredBy?: string | null;
  sponsorImageUrl?: string | null;
  showConfetti?: boolean;
  className?: string;
}

export function MultipleWinnersModal({
  isOpen = false,
  persons = [],
  prizeTitle = "",
  prizeType = "Minor",
  prizeImageUrl,
  sponsoredBy = "",
  sponsorImageUrl,
  showConfetti = true,
  className,
}: MultipleWinnerModalProps) {
  const winners = persons.slice(0, 10);
  const showWinner = winners.length > 0;
  const winnerCount = winners.length;

  if (!isOpen) return null;

  /**
   * Keep the existing responsive card behavior.
   * This is intentionally preserved so multiple winners
   * continue to scale based on the number of winners.
   */
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

  const getNameSize = (fullname: string) => {
    const nameLength = fullname.trim().length;

    if (nameLength > 44) {
      return "text-base sm:text-lg lg:text-xl xl:text-2xl";
    }

    if (nameLength > 30) {
      return "text-lg sm:text-xl lg:text-2xl xl:text-3xl";
    }

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
      return "text-xl lg:text-xl xl:text-4xl";
    }

    return "text-lg sm:text-xl lg:text-[18px] xl:text-3xl";
  };

  /**
   * Keep the existing card sizing.
   */
  const getCardSize = () => {
    if (winnerCount <= 2) {
      return "min-h-52 sm:min-h-64";
    }

    if (winnerCount <= 4) {
      return "min-h-fit lg:min-h-40 xl:min-h-60";
    }

    if (winnerCount <= 6) {
      return "min-h-36 sm:min-h-60 lg:min-h-20 xl:min-h-60";
    }

    return "min-h-32 sm:min-h-36 lg:min-h-20 xl:min-h-40";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-5">
      {showConfetti && showWinner && (
        <Confetti recycle numberOfPieces={60} gravity={0.16} className="pointer-events-none" />
      )}

      <div
        className={cn(
          "relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-tr-outline-variant/30 bg-tr-surface-container-lowest text-tr-on-surface shadow-2xl",
          className,
        )}
      >
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Decorative glow */}
        {showWinner && (
          <>
            <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-tr-primary/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-tr-tertiary-container/10 blur-[100px]" />
          </>
        )}

        {/* Header */}
        <header className="relative z-10 shrink-0 px-5 pt-5 sm:px-8 sm:pt-7">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <img
              src="/Bagong-Pilipinas.png"
              alt="Bagong Pilipinas"
              className="h-9 w-auto object-contain sm:h-30"
            />

            <div className="h-6 w-px bg-tr-outline-variant/40" />

            <div className="text-center">
              <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-tr-primary sm:text-[36px]">
                National Teachers' Month
              </p>

              <p className="mt-0.5 font-display text-[8px] font-medium uppercase tracking-[0.12em] text-tr-on-surface-variant sm:text-[24px]">
                Kick-off Celebration
              </p>
            </div>

            <div className="h-6 w-px bg-tr-outline-variant/40" />

            <img
              src="/deped-logo-philippines.png"
              alt="Department of Education"
              className="h-9 w-auto object-contain sm:h-18"
            />
          </div>
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
          {!showWinner ? (
            /* Drawing State */
            <div className="flex flex-1 items-center justify-center p-5 sm:p-10">
              <div className="relative flex h-full w-full max-w-6xl items-center justify-center overflow-hidden rounded-[2rem] bg-tr-secondary shadow-2xl">
                <div className="absolute inset-0 animate-pulse bg-tr-primary/10" />

                <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tr-primary-container/15 blur-[100px]" />

                <div className="relative z-10 text-center">
                  <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/50 sm:text-xs">
                    Selecting Multiple Winners
                  </p>

                  <div className="flex justify-center gap-1 text-6xl font-black leading-none text-white sm:text-8xl lg:text-9xl">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: static animation dots
                        key={index}
                        className="animate-dot-bounce"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                        }}
                      >
                        •
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-center gap-3">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-tr-tertiary-container" />

                    <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                      Drawing multiple winners
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Winner State */
            <div className="flex min-h-0 flex-1 flex-col px-5 pb-6 pt-4 sm:px-10 sm:pb-8 sm:pt-5">
              {/* Congratulations */}
              {/* <section className="shrink-0 text-center">
                <h1 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-tr-secondary sm:text-2xl lg:text-3xl">
                  Congratulations!
                </h1>

                <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-tr-tertiary-container" />
              </section> */}

              {/* Prize + Sponsor */}
              <section className="mx-auto mt-5 w-full max-w-7xl shrink-0">
                <div className="relative overflow-hidden rounded-3xl border border-tr-outline-variant/20 bg-tr-surface-container-low/70 shadow-sm backdrop-blur-md  p-6">
                  {/* Decorative background */}
                  <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-tr-primary/3 via-transparent to-tr-tertiary-container/4" />

                  <div className="flex items-center justify-around">
                    <div className="flex gap-5 min-h-36 items-center justify-center sm:min-h-40 lg:min-h-44">
                      {prizeImageUrl && (
                        <div className="relative flex h-30 w-full items-center justify-center sm:h-40 lg:h-44">
                          {/* Glow */}
                          <div className="absolute h-32 w-32 rounded-full bg-tr-primary/15 blur-3xl sm:h-40 sm:w-40" />

                          <img
                            src={prizeImageUrl}
                            alt={prizeTitle || "Prize"}
                            loading="lazy"
                            decoding="async"
                            className="relative z-10 h-full w-full max-w-64 object-contain drop-shadow-[0_16px_24px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left w-full">
                        <span className="text-[18px] font-bold uppercase tracking-[0.3em] text-tr-primary/70">
                          {prizeType || "Prize"}
                        </span>

                        <h2 className="mt-2 max-w-xl wrap-break-word font-display text-2xl font-black uppercase leading-[0.95] tracking-tight text-tr-primary sm:text-3xl lg:text-6xl">
                          {prizeTitle || "Prize"}
                        </h2>

                        <div className="mt-3 h-1 w-12 rounded-full bg-tr-tertiary-container" />
                      </div>
                    </div>

                    {(sponsoredBy || sponsorImageUrl) && (
                      <>
                        {/* Mobile divider */}
                        <div className="h-px w-full bg-tr-outline-variant/15 lg:hidden" />

                        {/* Desktop divider */}
                        <div className="hidden h-28 w-px bg-tr-outline-variant/20 lg:block" />

                        <div className="flex min-w-0 flex-col items-center justify-center text-center lg:items-center">
                          <span className="text-[7px] font-bold uppercase tracking-[0.3em] text-tr-on-surface-variant/70 sm:text-[18px]">
                            Proudly Sponsored By
                          </span>

                          {/* Bigger sponsor logo */}
                          {sponsorImageUrl && (
                            <div className="mt-3 flex h-15 w-52 items-center justify-center rounded-md bg-white px-2 py-2 shadow-sm ring-1 ring-black/5 sm:h-30 sm:w-60">
                              <img
                                src={sponsorImageUrl}
                                alt={`${sponsoredBy ?? "Sponsor"} logo`}
                                loading="lazy"
                                decoding="async"
                                className="h-full w-full object-contain rounded-md"
                              />
                            </div>
                          )}

                          {sponsoredBy && (
                            <span className="mt-3 max-w-xs wrap-break-word text-xs font-bold text-tr-secondary sm:text-lg">
                              {sponsoredBy}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="mx-auto my-5 h-px w-full max-w-5xl shrink-0 bg-tr-outline-variant/20 sm:my-6" />

              {/* Winner Count */}
              <div className="flex shrink-0 items-center justify-center gap-3 text-tr-tertiary-container">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />

                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-tr-on-surface-variant sm:text-lg">
                  {winnerCount} Lucky Winners
                </span>

                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              {/* Winners */}
              <section className="mt-4 min-h-0 flex-1 overflow-y-auto px-1">
                <div className="mx-auto flex w-full max-w-[1500px] flex-wrap justify-center gap-4 pb-4">
                  {winners.map((person) => (
                    <article
                      key={person.id}
                      className={cn(
                        "group relative flex flex-col items-center justify-center rounded-2xl border border-tr-outline-variant/20 bg-tr-surface-container-lowest/95 px-4 py-0 text-center shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
                        getCardWidthClass(),
                        getCardSize(),
                      )}
                    >
                      {/* Winner Name */}
                      <h2
                        className={cn(
                          "max-w-full font-display font-black uppercase leading-[0.9] text-tr-secondary wrap-break-word",
                          getNameSize(person.fullname ?? "Winner"),
                        )}
                      >
                        {person.fullname ?? "Winner"}
                      </h2>

                      {/* Location */}
                      {person.region?.region && (
                        <div className="mt-4 flex max-w-full flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5 text-tr-primary">
                            <MapPin className="h-6 w-6 shrink-0" />

                            <span className="text-sm font-bold uppercase tracking-[0.12em] sm:text-3xl">
                              {person.region.region}
                            </span>
                          </div>

                          {(person.schoolsDivision || person.station) && (
                            <p className="max-w-full wrap-break-word text-[10px] font-medium uppercase tracking-wide text-tr-on-surface-variant sm:text-xl">
                              {[
                                person.schoolsDivision,
                                person.station ? limitStationWords(person.station) : null,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>
                          )}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
