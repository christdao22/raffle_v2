import { useState } from "react";
import { PrizeSelectorCard } from "../components/Custom/PrizeSelectorCard";
import RaffleConfigCard from "../components/Custom/RaffleConfig";
import Layout from "../components/layout";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { usePrizes } from "../hooks/use-prizes";

export function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 300);

  const { data: prizeData, isLoading: isPrizesLoading } = usePrizes({
    page: 1,
    pageSize: 100,
    search,
  });

  return (
    <Layout pageTitle="Raffle Control & Prize Selector">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-9 space-y-6">
          <PrizeSelectorCard />
        </div>

        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <RaffleConfigCard />
        </div>
      </div>
    </Layout>
  );
}
