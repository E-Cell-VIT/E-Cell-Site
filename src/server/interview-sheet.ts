import ExcelJS from "exceljs";
import type { Application } from "../types/content";

/**
 * Builds the interview-scheduling workbook from the job applications.
 *
 * Pass `previous` (a sheet downloaded earlier) to add only the new candidates: everything already typed into
 * the scheduling columns is carried over, and rows that are no longer in the database are kept as they were,
 * so nothing a person wrote is ever lost.
 */

export const SHEET_NAME = "Interview Schedule";
const FIRST_ROW = 5;
const LAST_ROW = 304; // dropdowns and formatting are ready for ~300 candidates
const SCHEDULE_FROM = 11; // columns K..Q are filled in by hand
const STATUS = ["To schedule", "Invited", "Confirmed", "Done", "Rescheduled", "No-show", "Selected", "Rejected"];
const MODE = ["Online", "In person", "Phone call"];

const COLS: { name: string; width: number }[] = [
  { name: "#", width: 5 },
  { name: "Candidate", width: 24 },
  { name: "Email", width: 32 },
  { name: "Phone", width: 15 },
  { name: "Role applied for", width: 30 },
  { name: "Company", width: 26 },
  { name: "Also applied for", width: 30 },
  { name: "LinkedIn / portfolio", width: 24 },
  { name: "CV", width: 11 },
  { name: "Applied on", width: 12 },
  { name: "Status", width: 14 },
  { name: "Meeting date", width: 15 },
  { name: "Time", width: 10 },
  { name: "Mode", width: 12 },
  { name: "Meeting link / venue", width: 28 },
  { name: "Interviewer", width: 16 },
  { name: "Notes", width: 34 },
];
const LAST_COL = String.fromCharCode(64 + COLS.length);

type Saved = { value: ExcelJS.CellValue; numFmt?: string };
type PreviousRow = { key: string; cells: Saved[] }; // cells[0] is column A

const rowKey = (email: string, role: string) => `${email.trim().toLowerCase()}|${role.trim()}`;

/** Text of a cell however Excel stored it (plain, hyperlink, rich text or formula result). */
function plain(v: ExcelJS.CellValue | undefined): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return "";
  if ("richText" in v) return v.richText.map((t) => t.text).join("");
  if ("text" in v) return plain(v.text as ExcelJS.CellValue);
  if ("result" in v) return plain(v.result as ExcelJS.CellValue);
  if ("hyperlink" in v) return String(v.hyperlink).replace(/^mailto:/i, "");
  return "";
}

/** Reads the rows of an earlier sheet. Throws a readable error when the file is not our sheet. */
export async function readPreviousSheet(data: ArrayBuffer | Uint8Array): Promise<PreviousRow[]> {
  const wb = new ExcelJS.Workbook();
  try {
    await wb.xlsx.load(data as ArrayBuffer);
  } catch {
    throw new Error("That file could not be read. Please choose the .xlsx sheet you downloaded from here.");
  }
  const ws = wb.getWorksheet(SHEET_NAME);
  if (!ws) throw new Error(`That doesn't look like the interview sheet (no "${SHEET_NAME}" tab was found).`);
  const out: PreviousRow[] = [];
  for (let r = FIRST_ROW; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const email = plain(row.getCell(3).value);
    const role = plain(row.getCell(5).value);
    if (!email && !plain(row.getCell(2).value)) continue;
    const cells: Saved[] = [];
    for (let c = 1; c <= COLS.length; c++) {
      const cell = row.getCell(c);
      cells.push({ value: cell.value, numFmt: cell.numFmt });
    }
    out.push({ key: rowKey(email, role), cells });
  }
  return out;
}

export async function buildInterviewSheet(opts: {
  applications: Application[];
  origin: string;
  previous?: PreviousRow[];
}): Promise<{ buffer: Buffer; added: number; total: number }> {
  const { origin, previous = [] } = opts;

  // One row per person and role; exact duplicate submissions are merged.
  const seen = new Set<string>();
  const apps = [...opts.applications]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .filter((a) => {
      const k = rowKey(a.email, a.role);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  const rolesByEmail = new Map<string, string[]>();
  for (const a of apps) {
    const e = a.email.trim().toLowerCase();
    rolesByEmail.set(e, [...(rolesByEmail.get(e) ?? []), a.role]);
  }
  apps.sort(
    (a, b) => a.startup.localeCompare(b.startup) || a.role.localeCompare(b.role) || a.createdAt.localeCompare(b.createdAt),
  );

  const before = new Map(previous.map((p) => [p.key, p]));
  const orphans = previous.filter((p) => !seen.has(p.key));

  const wb = new ExcelJS.Workbook();
  wb.creator = "E-Cell VIT";
  const ws = wb.addWorksheet(SHEET_NAME, {
    views: [{ state: "frozen", xSplit: 3, ySplit: 4 }],
    properties: { tabColor: { argb: "FFC7A54F" } },
  });
  const lists = wb.addWorksheet("Lists", { state: "hidden" });
  lists.getColumn(1).values = ["Status", ...STATUS];
  lists.getColumn(2).values = ["Mode", ...MODE];
  COLS.forEach((c, i) => (ws.getColumn(i + 1).width = c.width));

  ws.mergeCells(`A1:${LAST_COL}1`);
  ws.getCell("A1").value = "E-Cell VIT · Jobs board · Interview schedule";
  ws.getCell("A1").font = { size: 16, bold: true, color: { argb: "FF1F2A24" } };
  ws.getRow(1).height = 26;
  ws.mergeCells(`A2:${LAST_COL}2`);
  ws.getCell("A2").value =
    `${apps.length + orphans.length} applications · Dark columns come from the website · Gold columns are for you to fill in · CV links open only while you are logged in to the admin panel`;
  ws.getCell("A2").font = { size: 10, italic: true, color: { argb: "FF5A5A5A" } };

  const header = ws.getRow(4);
  header.height = 24;
  COLS.forEach((c, i) => {
    const cell = header.getCell(i + 1);
    const info = i + 1 < SCHEDULE_FROM;
    cell.value = c.name;
    cell.font = { bold: true, size: 11, color: { argb: info ? "FFE9D8A6" : "FF1F2A24" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: info ? "FF1F2A24" : "FFC7A54F" } };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
  });

  const thin = { style: "thin" as const, color: { argb: "FFD9D4C7" } };
  const gold = { style: "medium" as const, color: { argb: "FFC7A54F" } };
  const style = (row: ExcelJS.Row, groupStart: boolean) => {
    for (let n = 1; n <= COLS.length; n++) {
      const c = row.getCell(n);
      c.alignment = { vertical: "top", wrapText: n === 7 || n === 15 || n === 17, horizontal: "left" };
      c.border = { top: groupStart ? gold : undefined, bottom: thin };
      c.font = { size: 11, color: { argb: "FF1F2A24" } };
    }
    for (const n of [3, 8, 9]) {
      if (row.getCell(n).value) row.getCell(n).font = { size: 11, color: { argb: "FF1F5FBF" }, underline: true };
    }
  };

  let rowNo = FIRST_ROW;
  let added = 0;
  let lastCompany = "";
  for (const a of apps) {
    const row = ws.getRow(rowNo);
    const email = a.email.trim();
    const others = [...new Set((rolesByEmail.get(email.toLowerCase()) ?? []).filter((r) => r !== a.role))];
    row.getCell(1).value = rowNo - FIRST_ROW + 1;
    row.getCell(2).value = a.name.trim();
    row.getCell(3).value = { text: email, hyperlink: `mailto:${email}` };
    row.getCell(4).value = (a.phone ?? "").replace(/\s+/g, "");
    row.getCell(4).numFmt = "@";
    row.getCell(5).value = a.role;
    row.getCell(6).value = a.startup;
    row.getCell(7).value = others.join(", ");
    if (a.profileUrl)
      row.getCell(8).value = {
        text: a.profileUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/$/, ""),
        hyperlink: a.profileUrl,
      };
    if (a.cv) row.getCell(9).value = { text: "Open CV", hyperlink: `${origin}/admin/${a.cv}` };
    row.getCell(10).value = new Date(a.createdAt);
    row.getCell(10).numFmt = "dd-mmm-yy";

    const prev = before.get(rowKey(a.email, a.role));
    if (prev) {
      for (let c = SCHEDULE_FROM; c <= COLS.length; c++) {
        const saved = prev.cells[c - 1];
        if (saved?.value != null && saved.value !== "") row.getCell(c).value = saved.value;
        if (saved?.numFmt) row.getCell(c).numFmt = saved.numFmt;
      }
    } else {
      added++;
    }
    if (row.getCell(SCHEDULE_FROM).value == null || row.getCell(SCHEDULE_FROM).value === "")
      row.getCell(SCHEDULE_FROM).value = "To schedule";
    if (!prev?.cells[11]?.numFmt) row.getCell(12).numFmt = "ddd dd-mmm-yy";
    if (!prev?.cells[12]?.numFmt) row.getCell(13).numFmt = "h:mm AM/PM";

    style(row, lastCompany !== "" && lastCompany !== a.startup);
    lastCompany = a.startup;
    rowNo++;
  }
  // rows that exist only in the old sheet (e.g. a candidate whose application was deleted) are kept as written
  for (const o of orphans) {
    const row = ws.getRow(rowNo);
    o.cells.forEach((s, i) => {
      if (s.value != null) row.getCell(i + 1).value = s.value;
      if (s.numFmt) row.getCell(i + 1).numFmt = s.numFmt;
    });
    row.getCell(1).value = rowNo - FIRST_ROW + 1;
    style(row, false);
    rowNo++;
  }

  for (let r = FIRST_ROW; r <= LAST_ROW; r++) {
    ws.getCell(`K${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["Lists!$A$2:$A$9"] };
    ws.getCell(`L${r}`).dataValidation = {
      type: "date", operator: "greaterThan", allowBlank: true, formulae: [new Date(2020, 0, 1)],
      showErrorMessage: true, errorTitle: "Date", error: "Enter a date, e.g. 25-Nov-2026",
    };
    ws.getCell(`M${r}`).dataValidation = {
      type: "decimal", operator: "between", allowBlank: true, formulae: [0, 0.9999],
      showErrorMessage: true, errorTitle: "Time", error: "Enter a time, e.g. 3:30 PM",
    };
    ws.getCell(`N${r}`).dataValidation = { type: "list", allowBlank: true, formulae: ["Lists!$B$2:$B$4"] };
    if (r >= rowNo) {
      ws.getCell(`L${r}`).numFmt = "ddd dd-mmm-yy";
      ws.getCell(`M${r}`).numFmt = "h:mm AM/PM";
    }
  }
  const fill = (argb: string) => ({ fill: { type: "pattern" as const, pattern: "solid" as const, bgColor: { argb } } });
  ws.addConditionalFormatting({
    ref: `K${FIRST_ROW}:K${LAST_ROW}`,
    rules: [
      { type: "expression", priority: 1, formulae: ['$K5="Confirmed"'], style: { ...fill("FFCDEBD7"), font: { bold: true, color: { argb: "FF14532D" } } } },
      { type: "expression", priority: 2, formulae: ['$K5="Invited"'], style: { ...fill("FFFCEFC0"), font: { color: { argb: "FF7A5B00" } } } },
      { type: "expression", priority: 3, formulae: ['$K5="Done"'], style: { ...fill("FFD6E4F5"), font: { color: { argb: "FF1E40AF" } } } },
      { type: "expression", priority: 4, formulae: ['$K5="Selected"'], style: { ...fill("FF9FD8B3"), font: { bold: true, color: { argb: "FF14532D" } } } },
      { type: "expression", priority: 5, formulae: ['OR($K5="Rejected",$K5="No-show")'], style: { ...fill("FFF6D0D0"), font: { color: { argb: "FF8A1C1C" } } } },
      { type: "expression", priority: 6, formulae: ['$K5="Rescheduled"'], style: { ...fill("FFE5D9F2"), font: { color: { argb: "FF5B21B6" } } } },
    ],
  });
  // double-booking: same date + time + interviewer on more than one row turns red
  ws.addConditionalFormatting({
    ref: `L${FIRST_ROW}:M${LAST_ROW}`,
    rules: [
      {
        type: "expression",
        priority: 7,
        formulae: [
          `AND($L5<>"",$M5<>"",$P5<>"",COUNTIFS($L$5:$L$${LAST_ROW},$L5,$M$5:$M$${LAST_ROW},$M5,$P$5:$P$${LAST_ROW},$P5)>1)`,
        ],
        style: { ...fill("FFF6B8B8"), font: { bold: true, color: { argb: "FF8A1C1C" } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `G${FIRST_ROW}:G${LAST_ROW}`,
    rules: [{ type: "expression", priority: 8, formulae: ["LEN($G5)>0"], style: { font: { italic: true, color: { argb: "FF8A5A00" } } } }],
  });

  ws.autoFilter = { from: "A4", to: `${LAST_COL}4` };
  ws.pageSetup = {
    orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, paperSize: 9,
    margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    printTitlesRow: "4:4",
  };

  const buffer = Buffer.from(await wb.xlsx.writeBuffer());
  return { buffer, added, total: apps.length + orphans.length };
}
