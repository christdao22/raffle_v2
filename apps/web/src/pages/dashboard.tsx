import { Card } from "@raffle_v2/ui";
import Layout from "../components/layout";
import RaffleConfigCard from "../components/raffle-config";

export function Dashboard() {
  return (
    <Layout pageTitle="Raffle Control & Prize Selector">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        <div className="lg:col-span-9 space-y-6">
          <Card>
            <h3 className="text-xl font-bold mb-4">Dashboard Controls</h3>
          </Card>
        </div>

        <div className="lg:col-span-3 flex justify-center lg:justify-end">
          <RaffleConfigCard />
        </div>
      </div>
    </Layout>
  );
}
