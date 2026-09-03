import type { RaffleReport } from "@raffle_v2/shared";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useCallback } from "react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function capitalizeWords(value: string | null | undefined) {
  if (!value) return "-";
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export function useRaffleReportPdf(reportData: RaffleReport, raffleId: string) {
  return useCallback(() => {
    const doc = new jsPDF({ orientation: "portrait" });

    doc.setFontSize(11);
    doc.text(reportData.raffle.name, 14, 20);
    doc.setFontSize(11);
    doc.text(
      `Generated: ${new Date(reportData.raffle.generatedAt).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`,
      14,
      35,
    );

    doc.setFontSize(12);
    doc.text("SUMMARY", 14, 45);
    const summaryRows = [
      ["Total Participants", formatNumber(reportData.summary.totalParticipants)],
      ["Remaining Eligible Participants", formatNumber(reportData.summary.eligibleParticipants)],
      ["Total Winners", formatNumber(reportData.summary.totalWinners)],
      ["Valid Winners", formatNumber(reportData.summary.validWinners)],
      ["Invalidated Winners", formatNumber(reportData.summary.invalidatedWinners)],
      ["Total Prize Units", formatNumber(reportData.summary.totalPrizeUnits)],
      ["Awarded Prize Units", formatNumber(reportData.summary.awardedPrizeUnits)],
      ["Unclaimed Prize Units", formatNumber(reportData.summary.unclaimedPrizeUnits)],
    ];

    const summaryStartY = 50;
    autoTable(doc, {
      startY: summaryStartY,
      head: [["Metric", "Value"]],
      body: summaryRows,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [17, 24, 39] },
    });

    const summaryBottomY =
      ((doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ??
        summaryStartY + 30) + 10;

    doc.setFontSize(12);
    doc.text("PRIZE SUMMARY", 14, summaryBottomY);
    autoTable(doc, {
      startY: summaryBottomY + 6,
      head: [["Prize", "Sponsor", "Tier", "Allocated", "Awarded", "Unclaimed"]],
      body: reportData.prizes.map((item) => [
        capitalizeWords(item.prize),
        capitalizeWords(item.sponsor),
        item.type ?? "-",
        String(item.allocated),
        String(item.awarded),
        String(item.unclaimed),
      ]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 24, 39] },
    });

    if (reportData.winners.length > 0) {
      const majorWinners = reportData.winners.filter(
        (w) => w.type?.toLowerCase() === "major prize",
      );
      const minorWinners = reportData.winners.filter(
        (w) => w.type?.toLowerCase() === "minors prize",
      );

      if (majorWinners.length > 0) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text("MAJOR PRIZE WINNERS", 14, 20);
        autoTable(doc, {
          startY: 28,
          head: [["#", "Winner", "Position", "School", "Division", "Region", "Prize", "Drawn At"]],
          body: majorWinners.map((winner) => [
            String(winner.drawNumber),
            capitalizeWords(winner.winnerName),
            capitalizeWords(winner.position ?? "-"),
            capitalizeWords(winner.school ?? "-"),
            capitalizeWords(winner.division ?? "-"),
            winner.region ?? "-",
            capitalizeWords(winner.prize),
            new Date(winner.drawnAt).toLocaleString("en-PH", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          ]),
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [17, 24, 39] },
        });
      }

      if (minorWinners.length > 0) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text("MINOR PRIZE WINNERS", 14, 20);
        autoTable(doc, {
          startY: 28,
          head: [["#", "Winner", "Position", "School", "Division", "Region", "Prize", "Drawn At"]],
          body: minorWinners.map((winner) => [
            String(winner.drawNumber),
            capitalizeWords(winner.winnerName),
            capitalizeWords(winner.position ?? "-"),
            capitalizeWords(winner.school ?? "-"),
            capitalizeWords(winner.division ?? "-"),
            winner.region ?? "-",
            capitalizeWords(winner.prize),
            new Date(winner.drawnAt).toLocaleString("en-PH", {
              timeZone: "Asia/Manila",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          ]),
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [17, 24, 39] },
        });
      }
    }

    if (reportData.invalidatedWinners.length > 0) {
      doc.addPage();
      doc.setFontSize(12);
      doc.text("INVALIDATED WINNERS", 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [["Draw #", "Winner", "School", "Prize", "Drawn At", "Reason"]],
        body: reportData.invalidatedWinners.map((winner) => [
          String(winner.drawNumber),
          capitalizeWords(winner.winnerName),
          capitalizeWords(winner.school ?? "-"),
          capitalizeWords(winner.prize),
          new Date(winner.drawnAt).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          winner.reason ?? "-",
        ]),
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [17, 24, 39] },
      });
    }

    doc.save(`raffle-report-${reportData.raffle.id || raffleId}.pdf`);
  }, [raffleId, reportData]);
}
