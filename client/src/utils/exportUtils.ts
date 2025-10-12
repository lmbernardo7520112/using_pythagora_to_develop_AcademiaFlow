// client/src/utils/exportUtils.ts
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Export data (array of objects) to XLSX on client
 * filename default: report.xlsx
 */
export function exportToXlsx(data: any[], filename = "report.xlsx") {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  saveAs(blob, filename);
}

/**
 * Export data to PDF (simple table)
 * columns: array of { header: string, dataKey: string }
 */
export function exportToPdf(columns: { header: string; dataKey: string }[], data: any[], filename = "report.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  // autoTable expects head and body
  const head = [columns.map((c) => c.header)];
  const body = data.map((row) => columns.map((c) => row[c.dataKey]));
  // @ts-ignore
  doc.autoTable({ head, body, startY: 10 });
  const blob = doc.output("blob");
  saveAs(blob, filename);
}
