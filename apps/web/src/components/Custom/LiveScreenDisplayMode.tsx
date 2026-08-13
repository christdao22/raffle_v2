import { cn } from "@raffle_v2/ui";
import { Award, Eye, Monitor, Radio, Tv } from "lucide-react";
import { useState } from "react";
import { useSetDisplayTypeMutation } from "../../hooks/use-live";

export type DisplayType = "standby" | "live" | "unclaimed" | "live-unclaimed";
export default function LiveScreenDisplayMode() {
  // Track active display mode
  const [displayType, setDisplayType] = useState<DisplayType>("standby");

  //
  const display = useSetDisplayTypeMutation();

  // Display Type Action Handlers
  const handleSetStandby = () => {
    setDisplayType("standby");
    display.mutate("standby");
  };

  const handleSetLive = () => {
    setDisplayType("live");
    display.mutate("live");
  };

  const handleSetUnclaimed = () => {
    setDisplayType("unclaimed");
    display.mutate("unclaimed");
  };

  const handleSetLiveAndUnclaimed = () => {
    setDisplayType("live-unclaimed");
    display.mutate("live-unclaimed");
  };

  const displayModes = [
    {
      id: "standby" as const,
      label: "Standby",
      icon: Monitor,
      handler: handleSetStandby,
    },
    {
      id: "live" as const,
      label: "Live",
      icon: Radio,
      handler: handleSetLive,
    },
    {
      id: "unclaimed" as const,
      label: "Unclaimed",
      icon: Award,
      handler: handleSetUnclaimed,
    },
    {
      id: "live-unclaimed" as const,
      label: "Live + Unclaimed",
      icon: Eye,
      handler: handleSetLiveAndUnclaimed,
    },
  ];

  return (
    <div className="w-full backdrop-blur-md mb-5 shadow-2xl space-y-6 font-sans text-on-surface">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-7 h-7 rounded-md border border-primary-container/40 bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(255,215,0,0.15)]">
          <Tv className="w-4 h-4" />
        </div>
        <h2 className="font-sans font-bold text-lg text-primary tracking-wide">
          Live Screen Display Mode
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {displayModes.map((mode) => {
          const Icon = mode.icon;
          const isActive = displayType === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={mode.handler}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none active:scale-95",
                isActive
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface border border-outline-variant/10",
              )}
            >
              <Icon className={cn("w-4 h-4", isActive && mode.id === "live" && "animate-pulse")} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
