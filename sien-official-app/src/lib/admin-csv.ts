// Quote all text, escape delimiters/newlines, and keep spreadsheet formulas inert.
export function csvCell(value: string | number | null) {
  if (typeof value === "number") return String(value);
  const text = value ?? "";
  const safe = /^[\s\u0000-\u001f]*[=+\-@]/.test(text) ? "'" + text : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
export function csvRow(values: (string | number | null)[]) { return values.map(csvCell).join(",") + "\r\n"; }
