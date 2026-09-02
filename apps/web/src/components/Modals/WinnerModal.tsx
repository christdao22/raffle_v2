import type { Person } from "@raffle_v2/shared";
import { cn } from "@raffle_v2/ui";
import { Trophy } from "lucide-react";
import Confetti from "react-confetti";

export interface WinnerModalProps {
  isOpen?: boolean;
  persons?: Person[];
  prizeTitle?: string;
  showConfetti?: boolean;
  prizeImageUrl?: string | null;
  sponsor?: string | null;
  sponsorImageUrl?: string | null;
  className?: string;
}

export function WinnerModal({
  isOpen = false,
  persons = [],
  prizeTitle = "",
  prizeImageUrl = "",
  showConfetti = true,
  sponsor,
  sponsorImageUrl,
  className,
}: WinnerModalProps) {
  const showWinner = persons.length > 0;

  if (!isOpen) return null;

  const winnerCount = persons.length;
  const multipleWinners = winnerCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-5 backdrop-blur-md">
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
          "relative flex h-[min(94vh,900px)] w-full max-w-375 flex-col overflow-hidden rounded-3xl border border-tr-outline-variant/30 bg-tr-surface-container-lowest text-tr-on-surface shadow-2xl",
          className,
        )}
      >
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Ambient glow */}
        {showWinner && (
          <>
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-tr-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-tr-tertiary-container/10 blur-3xl" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          {/* ================= HEADER ================= */}
          <header
            className={cn(
              "shrink-0 px-5 pt-5 text-center transition-all duration-500 sm:px-8 sm:pt-7",
              !showWinner && "pointer-events-none absolute -translate-y-10 opacity-0",
            )}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <img
                src="/Bagong-Pilipinas.png"
                alt="Bagong Pilipinas"
                className="h-10 w-auto object-contain sm:h-12"
              />

              <div className="h-7 w-px bg-tr-outline-variant/40" />

              <p className="font-display text-[10px] font-extrabold uppercase tracking-[0.18em] text-tr-primary sm:text-xs">
                National Teachers' Month Kick-off
              </p>

              <div className="h-7 w-px bg-tr-outline-variant/40" />

              <img
                src="/deped-logo-philippines.png"
                alt="DepEd"
                className="h-10 w-auto object-contain sm:h-8"
              />
            </div>

            <h3 className="mt-3 font-display text-3xl font-black uppercase leading-none tracking-tight text-tr-secondary sm:text-4xl lg:text-5xl">
              Congratulations!
            </h3>

            <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-tr-tertiary-container" />
          </header>

          {/* ================= MAIN ================= */}
          <main className="flex min-h-0 flex-1 w-full">
            {showWinner ? (
              <div className="flex w-full min-h-0 flex-col items-center ">
                {/* Lucky winner label */}
                <div className="mb-3 flex shrink-0 items-center gap-2 text-tr-tertiary-container sm:mb-4">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />

                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-tr-on-surface-variant sm:text-xs">
                    {multipleWinners ? "Our Lucky Winners" : "Our Lucky Winner"}
                  </span>

                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                {/* ================= PRIZE ================= */}
                <section className="flex w-full shrink-0 flex-col items-center">
                  {/* Prize image */}
                  {prizeImageUrl && (
                    <div className="relative flex h-32 w-full items-center justify-center sm:h-40 lg:h-44">
                      <div className="absolute h-28 w-28 rounded-full bg-tr-primary/15 blur-3xl sm:h-36 sm:w-36" />

                      <img
                        src={prizeImageUrl}
                        alt={prizeTitle || "Prize"}
                        loading="lazy"
                        className="relative z-10 h-full max-w-70 object-contain drop-shadow-[0_18px_25px_rgba(0,0,0,0.25)]"
                      />
                    </div>
                  )}

                  {/* Prize title */}
                  <h4
                    className={cn(
                      "mt-2 max-w-4xl text-center font-display font-black uppercase leading-tight tracking-tight text-tr-primary",
                      multipleWinners
                        ? "text-xl sm:text-2xl lg:text-3xl"
                        : "text-2xl sm:text-3xl lg:text-4xl",
                    )}
                  >
                    {prizeTitle || "Prize"}
                  </h4>

                  {/* Sponsor */}
                  {(sponsor || sponsorImageUrl) && (
                    <div className="mt-3 flex items-center justify-center gap-3">
                      {sponsorImageUrl && (
                        <div className="flex h-10 w-20 items-center justify-center overflow-hidden rounded-lg bg-white px-2 py-1 shadow-sm sm:h-12 sm:w-24">
                          <img
                            src={sponsorImageUrl}
                            alt={`${sponsor ?? "Sponsor"} logo`}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      )}

                      {sponsor && (
                        <span className="max-w-xs text-sm font-semibold text-tr-on-surface-variant sm:text-base">
                          {sponsor}
                        </span>
                      )}
                    </div>
                  )}
                </section>

                {/* Divider */}
                <div className="my-4 h-px w-full max-w-4xl bg-tr-outline-variant/20 sm:my-5" />

                {/* ================= WINNERS ================= */}
                <section
                  className={cn(
                    "flex min-h-0 w-full flex-col items-center justify-center",
                    multipleWinners ? "max-h-[35vh] overflow-y-auto" : "max-h-[40vh]",
                  )}
                >
                  <div
                    className={cn(
                      "grid w-full items-center justify-items-center gap-3",
                      multipleWinners ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1",
                    )}
                  >
                    {persons.map((person) => (
                      <div
                        key={person.id}
                        className={cn(
                          "flex w-full flex-col items-center text-center",
                          multipleWinners &&
                            "rounded-2xl border border-tr-outline-variant/20 bg-tr-surface-container-low/60 px-4 py-4",
                        )}
                      >
                        <h2
                          className={cn(
                            "max-w-full wrap-break-word font-display font-black uppercase leading-[0.9] tracking-tight text-tr-secondary",
                            multipleWinners
                              ? "text-3xl sm:text-4xl lg:text-5xl"
                              : "text-5xl sm:text-6xl lg:text-8xl xl:text-9xl",
                          )}
                        >
                          {person.fullname ?? "Winner"}
                        </h2>

                        {person.region?.region && (
                          <div
                            className={cn(
                              "mt-2 rounded-full border border-tr-primary-container/20 bg-tr-primary-container/10 font-bold uppercase text-tr-primary",
                              multipleWinners
                                ? "px-3 py-1 text-xs"
                                : "px-4 py-1.5 text-sm sm:text-base",
                            )}
                          >
                            {person.region.region} - {person.schoolsDivision} - {person.station}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              /* ================= DRAWING ================= */
              <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-tr-primary-container/30 bg-tr-secondary px-6 py-10 shadow-2xl">
                <div className="absolute inset-0 bg-tr-primary/10 animate-pulse" />

                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tr-primary-container/15 blur-3xl sm:h-96 sm:w-96" />

                <div className="relative z-10 flex flex-col items-center">
                  <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                    The moment of truth...
                  </p>

                  <div className="flex h-16 items-center justify-center gap-1 text-5xl font-black text-white sm:h-24 sm:text-7xl lg:text-9xl">
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
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
