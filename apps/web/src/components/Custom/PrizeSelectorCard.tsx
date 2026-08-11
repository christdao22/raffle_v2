import type { Region } from "@raffle_v2/shared";
import { Card, cn } from "@raffle_v2/ui";
import {
  Award,
  Check,
  Dice4,
  Globe,
  LucideTowerControl,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import * as React from "react";
import { useDebouncedValue } from "../../hooks/use-debounced-value";
import { usePrizes } from "../../hooks/use-prizes";

export interface PrizeItem {
  id: string;
  tierNumber: number;
  name: string;
  imageUrl?: string;
  icon?: React.ReactNode;
}

export interface PrizeSelectorCardProps {
  prizes?: PrizeItem[];
  selectedPrizeId?: string;
  onSelectPrize?: (prizeId: string) => void;
  selectedRegion?: Region;
  onSelectRegion?: (region: Region) => void;
  includeGlobalPool?: boolean;
  onToggleGlobalPool?: (include: boolean) => void;
  className?: string;
}

const REGIONS: Region[] = [
  "Region IX",
  "Region X",
  "Region XI",
  "Region XII",
  "Region XIII",
  "BARMM",
];

export function PrizeSelectorCard({
  selectedPrizeId: externalSelectedPrizeId,
  onSelectPrize,
  selectedRegion: externalSelectedRegion,
  onSelectRegion,
  includeGlobalPool: externalIncludeGlobalPool,
  onToggleGlobalPool,
  className,
}: PrizeSelectorCardProps) {
  // Local state fallbacks

  const [searchInput, setSearchInput] = React.useState("");
  const search = useDebouncedValue(searchInput, 300);

  const { data: prizeData, isLoading: isPrizesLoading } = usePrizes({
    page: 1,
    pageSize: 100,
    search,
  });

  const [internalPrizeId, setInternalPrizeId] = React.useState<string>("");
  const [internalRegion, setInternalRegion] = React.useState<Region>("Region X");
  const [internalGlobalPool, setInternalGlobalPool] = React.useState<boolean>(true);
  const isToogle = false;
  if (!prizeData) {
    return (
      <Card
        className={cn(
          "w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface",
          className,
        )}
      >
        <div className="flex items-center justify-center gap-4">
          <div className="w-7 h-7 rounded-md border border-primary-container/40 bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(255,215,0,0.15)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-sans font-bold text-lg text-primary tracking-wide">
            No prizes found
          </h2>
        </div>
      </Card>
    );
  }

  const selectedPrizeId = externalSelectedPrizeId ?? internalPrizeId;
  const selectedRegion = externalSelectedRegion ?? internalRegion;
  const includeGlobalPool = externalIncludeGlobalPool ?? internalGlobalPool;

  const handlePrizeClick = (id: string) => {
    setInternalPrizeId(id);
    onSelectPrize?.(id);
  };

  const handleRegionClick = (region: Region) => {
    setInternalRegion(region);
    onSelectRegion?.(region);
  };

  const handleGlobalToggle = () => {
    const nextValue = !includeGlobalPool;
    setInternalGlobalPool(nextValue);
    onToggleGlobalPool?.(nextValue);
  };

  const filteredPrizes = prizeData.data?.filter((p) =>
    p.prize.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card
      className={cn(
        "w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface",
        className,
      )}
    >
      {/* 1. Header & Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md border border-primary-container/40 bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(255,215,0,0.15)]">
            <LucideTowerControl className="w-4 h-4" />
          </div>
          <h2 className="font-sans font-bold text-lg text-primary tracking-wide">
            Live Draw Control
          </h2>
        </div>
        <div className="relative flex items-center w-48">
          <Search className="w-3.5 h-3.5 text-on-surface-variant/50 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search prizes..."
            className="w-full bg-surface-container-lowest/80 border border-slate-800/80 rounded-md py-2 pl-8 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* 3. Target Region Pool */}
      <div className="space-y-3 pt-1 mb-10">
        <div className="flex items-center gap-2 text-primary font-sans font-bold text-sm tracking-wide">
          <Globe className="w-4 h-4 text-primary" />
          <span>Target Region Pool</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const isSelected = region === selectedRegion;
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleRegionClick(region)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "bg-secondary-container text-on-secondary-container border border-secondary/40 shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant/80 border border-outline-variant/15 hover:bg-surface-container-high hover:text-on-surface",
                )}
              >
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                )}
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Prize Grid */}
      <div className="flex items-center gap-2 text-primary font-sans font-bold text-sm tracking-wide">
        <Dice4 className="w-4 h-4 text-primary" />
        <span>Select Prize Tier</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {filteredPrizes.map((prize) => {
          const isSelected = prize.id === selectedPrizeId;

          return (
            <button
              key={prize.id}
              type="button"
              onClick={() => handlePrizeClick(prize.id)}
              className={cn(
                "relative border border-slate-800/80 flex items-center gap-2.5 p-2 rounded-md text-left transition-all cursor-pointer select-none h-14",
                "bg-surface-container-low/80 hover:bg-surface-container-high/60",
                isSelected
                  ? "border-primary-container ring-1 ring-primary-container bg-surface-container-high shadow-[0_0_12px_rgba(255,215,0,0.15)]"
                  : " hover:border-outline-variant/40",
              )}
            >
              {/* Checkmark Badge */}
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container z-10">
                  <Check className="w-2.5 h-2.5 stroke-3" />
                </div>
              )}

              {/* Icon or Thumbnail */}
              <div className="shrink-0 w-9 h-9 rounded-md bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center">
                {prize.imageUrl ? (
                  <img
                    src={prize.imageUrl}
                    alt={prize.prize}
                    className="w-full h-full object-cover"
                  />
                ) : prize.imageUrl ? (
                  <img
                    src={prize.imageUrl}
                    alt={prize.prize}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Award className="w-4 h-4 text-on-surface-variant/60" />
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-label text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">
                  TIER {prize.id}
                </span>
                <span className="font-sans font-bold text-xs text-on-surface truncate mt-0.5 leading-snug">
                  {prize.prize}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {isToogle && (
        <div className="flex items-center justify-between p-3.5 rounded-md bg-surface-container-low border border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-center text-on-surface">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="font-sans font-bold text-xs text-on-surface">Include Global Pool</p>
              <p className="font-sans text-[11px] text-on-surface-variant/70">
                Override regional filter and include all registered employees.
              </p>
            </div>
          </div>

          {/* Custom Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={includeGlobalPool}
            onClick={handleGlobalToggle}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
              includeGlobalPool ? "bg-primary-container" : "bg-surface-container-highest",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-primary-container shadow-md ring-0 transition duration-200 ease-in-out my-0.5 ml-0.5",
                includeGlobalPool
                  ? "translate-x-5 bg-on-primary-container"
                  : "translate-x-0 bg-on-surface-variant",
              )}
            />
          </button>
        </div>
      )}
    </Card>
  );
}
