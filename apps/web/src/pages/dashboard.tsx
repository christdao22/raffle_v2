import { Card, cn } from "@raffle_v2/ui";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { PrizeSelectorCard } from "../components/Custom/PrizeSelectorCard";
import RaffleConfigCard from "../components/Custom/RaffleConfig";
import Layout from "../components/layout";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { usePrizes, useSelectPrizeMutation } from "../hooks/use-prizes";
import { useRegions } from "../hooks/use-regions";

export function Dashboard() {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 2,
  });
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);
  const { data: prizeData } = usePrizes({
    ...pagination,
    search,
  });

  const { data: regions } = useRegions({
    page: 1,
    pageSize: 100,
  });

  const handlePageChange = (newPage: number, totalPages: number) => {
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, Math.min(newPage, totalPages)),
    }));
  };

  const selectPrize = useSelectPrizeMutation();

  const handlePrize = (value: string) => {
    selectPrize.mutate(value);
    console.log(value);
  };

  if (!regions) {
    return (
      <Card
        className={cn("w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface")}
      >
        <div className="flex items-center justify-center gap-4">
          <div className="w-7 h-7 rounded-md border border-primary-container/40 bg-surface-container-lowest flex items-center justify-center text-primary-container shadow-[0_0_10px_rgba(255,215,0,0.15)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="font-sans font-bold text-lg text-primary tracking-wide">
            No regions found
          </h2>
        </div>
      </Card>
    );
  }

  if (!prizeData) {
    return (
      <Card
        className={cn("w-full backdrop-blur-md p-6 shadow-2xl space-y-6 font-sans text-on-surface")}
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

  return (
    <Layout pageTitle="Raffle Control & Prize Selector">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-9 space-y-6">
          <PrizeSelectorCard
            regions={regions.data}
            prizes={prizeData}
            searchInput={searchInput}
            onSearchInput={(val: string) => {
              setSearchInput(val);
            }}
            handlePageChange={handlePageChange}
            onSelectPrize={handlePrize}
          />
        </div>

        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <RaffleConfigCard />
        </div>
      </div>
    </Layout>
  );
}
