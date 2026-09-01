import type { RaffleReport } from "@raffle_v2/shared";
import { Button, Card, cn } from "@raffle_v2/ui";
import { Download, FileText, Gift, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";
import Layout from "../components/layout";
import { useRaffleReportPdf } from "../hooks/pdf/use-raffle-report-pdf";
import { useReport } from "../hooks/use-report";

const EMPTY_REPORT: RaffleReport = {
  raffle: {
    id: "",
    name: "Raffle report",
    date: "-",
    status: "-",
    generatedAt: new Date().toISOString(),
  },
  summary: {
    totalParticipants: 0,
    eligibleParticipants: 0,
    totalWinners: 0,
    validWinners: 0,
    invalidatedWinners: 0,
    totalPrizeUnits: 0,
    awardedPrizeUnits: 0,
    unclaimedPrizeUnits: 0,
  },
  prizes: [],
  winners: [],
  invalidatedWinners: [],
  unclaimedPrizes: [],
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function RaffleReportPage() {
  const [raffleId, setRaffleId] = useState("RFL-2026-001");
  const { data: report, isLoading, isError, error } = useReport(raffleId);

  const reportData = report ?? EMPTY_REPORT;

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Participants",
        value: formatNumber(reportData.summary.totalParticipants),
        icon: Users,
      },
      {
        label: "Eligible Participants",
        value: formatNumber(reportData.summary.eligibleParticipants),
        icon: Users,
      },
      {
        label: "Total Winners",
        value: formatNumber(reportData.summary.totalWinners),
        icon: Trophy,
      },
      {
        label: "Valid Winners",
        value: formatNumber(reportData.summary.validWinners),
        icon: FileText,
      },
      {
        label: "Invalidated Winners",
        value: formatNumber(reportData.summary.invalidatedWinners),
        icon: Trophy,
      },
      {
        label: "Total Prize Units",
        value: formatNumber(reportData.summary.totalPrizeUnits),
        icon: Gift,
      },
      {
        label: "Awarded Prize Units",
        value: formatNumber(reportData.summary.awardedPrizeUnits),
        icon: Gift,
      },
      {
        label: "Unclaimed Prize Units",
        value: formatNumber(reportData.summary.unclaimedPrizeUnits),
        icon: Gift,
      },
    ],
    [reportData],
  );

  const handleDownloadPdf = useRaffleReportPdf(reportData, raffleId);

  return (
    <Layout pageTitle="Raffle Report">
      <div className="space-y-6">
        {isLoading && (
          <Card className={cn("p-6")}>
            <div className="text-slate-300">Loading raffle report from the database...</div>
          </Card>
        )}

        {isError && (
          <Card className={cn("p-6 border-red-500/30 bg-red-950/30")}>
            <div className="text-red-200">
              Unable to load the raffle report.{" "}
              {error instanceof Error ? error.message : "Please try again."}
            </div>
          </Card>
        )}

        {!isLoading && !isError && (
          <>
            <Card className={cn("p-6")}>
              <div className="relative mb-6 border-b border-slate-700 pb-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                  RAFFLE REPORT
                </p>
                <h2 className="mt-3 text-3xl font-bold text-white">{reportData.raffle.name}</h2>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={isLoading || isError}
                  className="absolute top-0 right-0 gap-2 bg-amber-400 text-slate-900 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                      Draw Date
                    </span>
                    <span>{reportData.raffle.date}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                      Status
                    </span>
                    <span>{reportData.raffle.status}</span>
                  </div>
                  <div>
                    <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">
                      Report Generated
                    </span>
                    <span>{new Date(reportData.raffle.generatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryCards.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-700 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-[0.18em]">{label}</span>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="mt-5 text-3xl font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={cn("p-6")}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Prize Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="px-3 py-2">Prize</th>
                      <th className="px-3 py-2">Sponsor</th>
                      <th className="px-3 py-2">Tier</th>
                      <th className="px-3 py-2">Allocated</th>
                      <th className="px-3 py-2">Awarded</th>
                      <th className="px-3 py-2">Unclaimed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.prizes.map((item) => (
                      <tr key={item.id} className="border-t border-slate-700 text-slate-200">
                        <td className="px-3 py-3">{item.prize}</td>
                        <td className="px-3 py-3">{item.sponsor ?? "-"}</td>
                        <td className="px-3 py-3">{item.type ?? "-"}</td>
                        <td className="px-3 py-3">{item.allocated}</td>
                        <td className="px-3 py-3">{item.awarded}</td>
                        <td className="px-3 py-3">{item.unclaimed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className={cn("p-6")}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Winners</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-300">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Winner</th>
                      <th className="px-3 py-2">Position</th>
                      <th className="px-3 py-2">School</th>
                      <th className="px-3 py-2">Division</th>
                      <th className="px-3 py-2">Region</th>
                      <th className="px-3 py-2">Prize</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.winners.map((winner) => (
                      <tr
                        key={`${winner.drawNumber}-${winner.winnerName}`}
                        className="border-t border-slate-700 text-slate-200"
                      >
                        <td className="px-3 py-3">{winner.drawNumber}</td>
                        <td className="px-3 py-3">{winner.winnerName}</td>
                        <td className="px-3 py-3">{winner.position ?? "-"}</td>
                        <td className="px-3 py-3">{winner.school ?? "-"}</td>
                        <td className="px-3 py-3">{winner.division ?? "-"}</td>
                        <td className="px-3 py-3">{winner.region ?? "-"}</td>
                        <td className="px-3 py-3">{winner.prize}</td>
                        <td className="px-3 py-3">{winner.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* {reportData.invalidatedWinners.length > 0 && (
              <Card className={cn("p-6")}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Invalidated Winners</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-3 py-2">Draw #</th>
                        <th className="px-3 py-2">Winner</th>
                        <th className="px-3 py-2">School</th>
                        <th className="px-3 py-2">Prize</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.invalidatedWinners.map((winner) => (
                        <tr
                          key={`${winner.drawNumber}-${winner.winnerName}`}
                          className="border-t border-slate-700 text-slate-200"
                        >
                          <td className="px-3 py-3">{winner.drawNumber}</td>
                          <td className="px-3 py-3">{winner.winnerName}</td>
                          <td className="px-3 py-3">{winner.school ?? "-"}</td>
                          <td className="px-3 py-3">{winner.prize}</td>
                          <td className="px-3 py-3">{winner.status}</td>
                          <td className="px-3 py-3">{winner.reason ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )} */}

            {/* {reportData.unclaimedPrizes.length > 0 && (
              <Card className={cn("p-6")}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Unclaimed Prizes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-3 py-2">Prize</th>
                        <th className="px-3 py-2">Sponsor</th>
                        <th className="px-3 py-2">Allocated</th>
                        <th className="px-3 py-2">Awarded</th>
                        <th className="px-3 py-2">Unclaimed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.unclaimedPrizes.map((item) => (
                        <tr key={item.prize} className="border-t border-slate-700 text-slate-200">
                          <td className="px-3 py-3">{item.prize}</td>
                          <td className="px-3 py-3">{item.sponsor ?? "-"}</td>
                          <td className="px-3 py-3">{item.allocated}</td>
                          <td className="px-3 py-3">{item.awarded}</td>
                          <td className="px-3 py-3">{item.unclaimed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm font-semibold text-slate-200">
                  Total Unclaimed Prize Units: {reportData.summary.unclaimedPrizeUnits}
                </div>
              </Card>
            )} */}
          </>
        )}
      </div>
    </Layout>
  );
}
