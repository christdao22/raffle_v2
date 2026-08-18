import type { Prize } from "@raffle_v2/shared";
import { Card, cn } from "@raffle_v2/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import LiveScreenDisplayMode from "../components/Custom/LiveScreenDisplayMode";
import { PrizeSelectorCard } from "../components/Custom/PrizeSelectorCard";
import RaffleConfigCard from "../components/Custom/RaffleConfig";
import Layout from "../components/layout";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { usePrizes } from "../hooks/use-prizes";
import { useRegions } from "../hooks/use-regions";

export function Dashboard() {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const { data: prizeData, isLoading: loadingPrize } = usePrizes({
    ...pagination,
    search,
  });

  // Track ID instead of copying the full object into state
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>();
  const [regionId, setRegionId] = useState<string[]>();

  const { data: regions, isLoading: loadingRegion } = useRegions({
    page: 1,
    pageSize: 100,
  });

  // Derive the active prize dynamically from fresh query data
  const prizesList: Prize[] = Array.isArray(prizeData)
    ? prizeData
    : ((prizeData as { data?: Prize[] })?.data ?? []);
  const prize = prizesList.find((p) => p.id === selectedPrizeId);

  // Calculate sum of eligible candidates based on selected regions (or all regions if none selected)
  const regionsList = regions?.data ?? [];
  const targetRegions =
    regionId && regionId.length > 0
      ? regionsList.filter((r) => regionId.includes(r.id))
      : regionsList;

  const totalEligibleCount = targetRegions.reduce(
    (acc, item) => acc + (item.eligibleCount ?? 0),
    0,
  );

  const handlePageChange = (newPage: number, totalPages: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, totalPages)),
    }));
  };

  const handlePrize = (value: string) => {
    setSelectedPrizeId(value);
  };

  const handleRegion = (value: string[]) => {
    setRegionId(value);
  };

  if (loadingPrize || loadingRegion) {
    return <p>Loading...</p>;
  }

  return (
    <Layout pageTitle="Raffle Control & Prize Selector">
      <LiveScreenDisplayMode />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-8">
          {prizeData && regions ? (
            <PrizeSelectorCard
              regions={regions.data}
              prizes={prizeData}
              searchInput={searchInput}
              onSearchInput={(val: string) => {
                setSearchInput(val);
              }}
              handlePageChange={handlePageChange}
              onSelectPrize={handlePrize}
              onSelectRegion={handleRegion}
            />
          ) : (
            <Card
              className={cn(
                "w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface",
              )}
            >
              <div className="flex items-center justify-center gap-4">
                <h2 className="font-sans font-bold text-lg text-primary tracking-wide">Loading</h2>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <RaffleConfigCard
            prize={prize}
            regionId={regionId}
            totalEligibleCount={totalEligibleCount}
          />
        </div>
      </div>
    </Layout>
  );
}
