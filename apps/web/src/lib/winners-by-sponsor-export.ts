import type { Winner } from "@raffle_v2/shared";
import * as XLSX from "xlsx";

const UNKNOWN_SPONSOR = "Unknown Sponsor";
const INVALID_SHEET_NAME_CHARACTERS = /[\\/?*[\]:]/g;
type WorksheetRow = Array<string | number>;

export interface SponsorWinnerGroup {
  sponsor: string;
  winners: Winner[];
}

function normalizeSponsorName(sponsor: string | null | undefined): string {
  const normalized = sponsor?.trim().replace(/\s+/g, " ");
  return normalized ? normalized.toLocaleLowerCase() : UNKNOWN_SPONSOR.toLocaleLowerCase();
}

function displaySponsorName(sponsor: string | null | undefined): string {
  return sponsor?.trim().replace(/\s+/g, " ") || UNKNOWN_SPONSOR;
}

export function getUniqueSponsors(winners: Winner[]): string[] {
  return [...groupWinnersBySponsor(winners).values()].map(({ sponsor }) => sponsor);
}

export function groupWinnersBySponsor(winners: Winner[]): Map<string, SponsorWinnerGroup> {
  const groups = new Map<string, SponsorWinnerGroup>();

  for (const winner of winners) {
    const sponsor = displaySponsorName(winner.prize.sponsor);
    const key = normalizeSponsorName(winner.prize.sponsor);
    const group = groups.get(key);

    if (group) {
      group.winners.push(winner);
    } else {
      groups.set(key, { sponsor, winners: [winner] });
    }
  }

  return groups;
}

function createUniqueSheetName(sponsor: string, usedNames: Set<string>): string {
  const sanitized = sponsor.replace(INVALID_SHEET_NAME_CHARACTERS, " ").trim() || UNKNOWN_SPONSOR;
  let index = 1;
  let sheetName = sanitized.slice(0, 31);

  while (usedNames.has(sheetName.toLocaleLowerCase())) {
    index += 1;
    const suffix = ` (${index})`;
    sheetName = `${sanitized.slice(0, 31 - suffix.length)}${suffix}`;
  }

  usedNames.add(sheetName.toLocaleLowerCase());
  return sheetName;
}

function formatClaimedDate(receivedAt: Winner["receivedAt"]): string {
  return receivedAt ? new Date(receivedAt).toLocaleString() : "";
}

function setColumnWidths(worksheet: XLSX.WorkSheet, widths: number[]) {
  worksheet["!cols"] = widths.map((width) => ({ wch: width }));
}

export function exportWinnersBySponsor(winners: Winner[]): void {
  const groups = [...groupWinnersBySponsor(winners).values()].sort((left, right) =>
    left.sponsor.localeCompare(right.sponsor),
  );
  const totalPrizes = new Set(winners.map((winner) => winner.prize.id)).size;
  const winnersWithoutSponsor = winners.filter(
    (winner) => normalizeSponsorName(winner.prize.sponsor) === UNKNOWN_SPONSOR.toLocaleLowerCase(),
  ).length;
  const workbook = XLSX.utils.book_new();
  const summaryRows: WorksheetRow[] = [
    ["Winners by Sponsor"],
    ["Export Date/Time", new Date().toLocaleString()],
    ["Total Sponsors", groups.length],
    ["Total Winners", winners.length],
    ["Total Prizes", totalPrizes],
    ["Winners Without Sponsor", winnersWithoutSponsor],
    [],
    ["Sponsor", "Number of Prizes", "Number of Winners"],
    ...groups.map(({ sponsor, winners: sponsorWinners }) => [
      sponsor,
      new Set(sponsorWinners.map((winner) => winner.prize.id)).size,
      sponsorWinners.length,
    ]),
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  setColumnWidths(summarySheet, [42, 20, 20]);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  const usedSheetNames = new Set(["summary"]);
  for (const { sponsor, winners: sponsorWinners } of groups) {
    const sortedWinners = [...sponsorWinners].sort((left, right) => {
      const prizeComparison = left.prize.prize.localeCompare(right.prize.prize);
      return prizeComparison || left.person.fullname.localeCompare(right.person.fullname);
    });
    const rows: WorksheetRow[] = [
      ["Sponsor:", sponsor],
      ["Number of Prizes:", new Set(sponsorWinners.map((winner) => winner.prize.id)).size],
      ["Total Winners:", sponsorWinners.length],
      [],
      [
        "No.",
        "Winner ID",
        "Full Name",
        "Division/Region",
        "Prize",
        "Winner Status",
        "Received/Claimed Date",
        "Signature",
      ],
      ...sortedWinners.map((winner, index) => [
        index + 1,
        winner.id,
        winner.person.fullname,
        [winner.person.schoolsDivision, winner.person.region?.region].filter(Boolean).join(" / "),
        winner.prize.prize,
        winner.isReceived ? "Claimed" : "Unclaimed",
        formatClaimedDate(winner.receivedAt),
        "",
      ]),
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    setColumnWidths(worksheet, [8, 38, 30, 18, 30, 32, 18, 24, 40]);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      createUniqueSheetName(sponsor, usedSheetNames),
    );
  }

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `winners-by-sponsor-${date}.xlsx`);
}
