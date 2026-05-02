/**
 * Minimal CSV parser used by the AdminImportPage flow.
 *
 * Splits on newlines (CR/LF tolerant), drops empty lines, and treats the first
 * remaining line as the header. Each subsequent line becomes an object whose
 * keys are header names and values are trimmed cells.
 */
export function parseCsv(input: string): Array<Record<string, string>> {
  const lines = input.split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const cells = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (cells[i] ?? '').trim();
    });
    return row;
  });
}
