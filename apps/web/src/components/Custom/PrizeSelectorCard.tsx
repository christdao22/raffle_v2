import type { Prize } from "@raffle_v2/shared";
import { Button, Card, cn } from "@raffle_v2/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Dice4,
  Globe,
  LucideTowerControl,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSetRegions } from "../../hooks/use-live";
import { useLiveSocket } from "../../hooks/use-live-socket";
import { useSelectPrizeMutation } from "../../hooks/use-prizes";

export interface RegionPersonCounter {
  id: string;
  region: string;
  regionName: string;
  eligibleCount: number;
}

export interface PrizeSelectorCardProps {
  regions: RegionPersonCounter[];
  prizes: {
    data: Prize[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    };
  };
  searchInput: string;
  onSearchInput: (val: string) => void;
  selectedPrizeId?: string;
  onSelectPrize?: (value: string) => void;
  selectedRegion?: string[];
  onSelectRegion?: (regionIds: string[]) => void;
  includeGlobalPool?: boolean;
  onToggleGlobalPool?: (include: boolean) => void;
  handlePageChange: (newPage: number, totalPages: number) => void;
  className?: string;
}

const apiHost = (import.meta.env.VITE_API_URL ?? "localhost:3000").replace(/^https?:\/\//, "");

export function PrizeSelectorCard({
  regions,
  prizes,
  searchInput,
  onSearchInput,
  selectedPrizeId: externalSelectedPrizeId,
  onSelectPrize,
  selectedRegion: externalSelectedRegion,
  onSelectRegion,
  includeGlobalPool: externalIncludeGlobalPool,
  onToggleGlobalPool,
  handlePageChange,
  className,
}: PrizeSelectorCardProps) {
  const [internalPrizeId, setInternalPrizeId] = useState<string>("");
  const [internalRegion, setInternalRegion] = useState<string[]>([]);
  const [internalGlobalPool, setInternalGlobalPool] = useState<boolean>(true);
  const isToogle = false;

  const queryClient = useQueryClient();

  const handlePrizeSelected = useCallback(
    (prizeId: string) => {
      queryClient.invalidateQueries({ queryKey: ["prizes", "detail", prizeId] });
    },
    [queryClient],
  );

  const { state } = useLiveSocket(apiHost, handlePrizeSelected);
  const { selectedPrizeId: statePrize, selectedRegionIds } = state;

  // biome-ignore lint/correctness/useExhaustiveDependencies: get websockets state
  useEffect(() => {
    if (statePrize !== null) {
      setInternalPrizeId(statePrize);
      onSelectPrize?.(statePrize);
    }
    if (selectedRegionIds && selectedRegionIds.length > 0) {
      setInternalRegion(selectedRegionIds);
      onSelectRegion?.(selectedRegionIds);
    }
  }, [statePrize, selectedRegionIds]);

  const selectedPrizeId = externalSelectedPrizeId ?? internalPrizeId;
  const selectedRegion = externalSelectedRegion ?? internalRegion;
  const includeGlobalPool = externalIncludeGlobalPool ?? internalGlobalPool;

  const selectPrize = useSelectPrizeMutation();
  const selectRegions = useSetRegions();

  const handlePrizeClick = (value: string) => {
    setInternalPrizeId(value);
    onSelectPrize?.(value);
    selectPrize.mutate(value);
  };

  const handleRegionClick = (regionId: string) => {
    const nextSelected = selectedRegion.includes(regionId)
      ? selectedRegion.filter((id) => id !== regionId)
      : [...selectedRegion, regionId];

    setInternalRegion(nextSelected);
    onSelectRegion?.(nextSelected);
    selectRegions.mutate(nextSelected);
  };

  const handleGlobalToggle = () => {
    const nextValue = !includeGlobalPool;
    setInternalGlobalPool(nextValue);
    onToggleGlobalPool?.(nextValue);
  };

  return (
    <Card
      className={cn(
        "w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface",
        className,
      )}
    >
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
            onChange={(e) => onSearchInput(e.target.value)}
            placeholder="Search prizes..."
            className="w-full bg-surface-container-lowest/80 border border-slate-800/80 rounded-md py-2 pl-8 pr-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
          />
        </div>
      </div>

      <div className="space-y-3 pt-1 mb-10">
        <div className="flex items-center gap-2 text-primary font-sans font-bold text-sm tracking-wide">
          <Globe className="w-4 h-4 text-primary" />
          <span>Target Region Pool</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {regions.map((region) => {
            const isSelected = selectedRegion.includes(region.id);
            return (
              <button
                key={region.id}
                type="button"
                title={region.regionName}
                onClick={() => handleRegionClick(region.id)}
                className={cn(
                  "group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 select-none cursor-pointer active:scale-95",
                  isSelected
                    ? "bg-secondary-container text-on-secondary-container border border-secondary/40 shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant border border-outline-variant/15 hover:bg-surface-container-high hover:text-on-surface hover:border-outline-variant/30",
                )}
              >
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none hidden group-hover:flex flex-col items-center z-20 transition-all opacity-0 group-hover:opacity-100">
                  <span className="bg-surface-container-highest text-on-surface text-[11px] font-medium px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap border border-outline-variant/20">
                    {region.regionName}
                  </span>
                  <span className="w-2 h-2 -mt-1 rotate-45 bg-surface-container-highest border-r border-b border-outline-variant/20" />
                </span>

                <span
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200 shrink-0",
                    isSelected
                      ? "bg-secondary animate-pulse"
                      : "bg-outline-variant/40 group-hover:bg-outline-variant",
                  )}
                />

                <span className="font-semibold tracking-wide">{region.region}</span>

                <span
                  className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none transition-colors shrink-0",
                    isSelected
                      ? "bg-secondary/20 text-on-secondary-container"
                      : "bg-surface-container-highest text-on-surface-variant/80 group-hover:bg-surface-container",
                  )}
                >
                  {region.eligibleCount ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 text-primary font-sans font-bold text-sm tracking-wide">
        <Dice4 className="w-4 h-4 text-primary" />
        <span>Select Prize Tier</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {prizes.data.map((prize) => {
          const isSelected = prize.id === selectedPrizeId;

          return (
            <button
              key={prize.id}
              type="button"
              onClick={() => handlePrizeClick(prize.id)}
              className={cn(
                "relative border border-slate-800/80 flex items-center gap-2.5 px-2 py-10 rounded-md text-left transition-all cursor-pointer select-none h-14",
                "bg-surface-container-low/80 hover:bg-surface-container-high/60",
                isSelected
                  ? "border-primary-container ring-1 ring-primary-container bg-surface-container-high shadow-[0_0_12px_rgba(255,215,0,0.15)]"
                  : " hover:border-outline-variant/40",
              )}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container z-10">
                  <Check className="w-2.5 h-2.5 stroke-3" />
                </div>
              )}

              <div className="shrink-0 w-12 h-12 rounded-md bg-surface-container-lowest border border-outline-variant/20 overflow-hidden flex items-center justify-center">
                {prize.imageUrl || prize.sponsorImage ? (
                  <img
                    src={prize.imageUrl ?? prize.sponsorImage ?? ""}
                    alt={prize.prize}
                    loading="lazy"
                    className="w-full h-full object-cover bg-white"
                  />
                ) : (
                  <Award className="w-4 h-4 text-on-surface-variant/60" />
                )}
              </div>

              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-label text-[9px] font-bold text-on-surface-variant uppercase tracking-wider leading-none">
                  {prize.sponsor}
                </span>
                <span className="font-sans font-bold text-xs text-on-surface truncate mt-0.5 leading-snug">
                  {prize.prize}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-surface-container-high pt-4 mt-4 px-2 ">
        <div className="text-body-md text-on-surface-variant font-body">
          Page <span className="font-bold text-on-surface">{prizes.meta.pagination.page}</span> of{" "}
          <span className="font-bold text-on-surface">
            {prizes.meta.pagination.totalPages || 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(prizes.meta.pagination.page - 1, prizes.meta.pagination.totalPages)
            }
            disabled={prizes.meta.pagination.page <= 1}
            className="border-2 border-surface-dim hover:bg-surface-container text-on-surface disabled:opacity-40 rounded-md p-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Previous Page</span>
          </Button>

          {Array.from({ length: prizes.meta.pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => {
              const isActive = pageNum === prizes.meta.pagination.page;
              return (
                <Button
                  key={pageNum}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum, prizes.meta.pagination.totalPages)}
                  className={cn(
                    "w-9 h-9 font-body font-semibold rounded-md transition-all text-sm",
                    isActive
                      ? "bg-primary text-on-primary shadow-sm"
                      : "border-2 border-surface-dim hover:bg-surface-container text-on-surface",
                  )}
                >
                  {pageNum}
                </Button>
              );
            },
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handlePageChange(prizes.meta.pagination.page + 1, prizes.meta.pagination.totalPages)
            }
            disabled={prizes.meta.pagination.page >= prizes.meta.pagination.totalPages}
            className="border-2 border-surface-dim hover:bg-surface-container text-on-surface disabled:opacity-40 rounded-md p-2"
          >
            <ChevronRight className="w-4 h-4" />
            <span className="sr-only">Next Page</span>
          </Button>
        </div>
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
