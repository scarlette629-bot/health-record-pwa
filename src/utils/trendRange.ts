export type TrendRange = '7d' | '30d' | '90d' | '1y' | '2y';

export function getTrendRangeBounds(measuredAtValues: string[], range: TrendRange) {
  const validDates = measuredAtValues
    .map((value) => new Date(value))
    .filter((date) => Number.isFinite(date.getTime()));
  const latestTimestamp = validDates.length ? Math.max(...validDates.map((date) => date.getTime())) : Date.now();
  const end = new Date(latestTimestamp);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);

  if (range.endsWith('d')) {
    const days = Number(range.slice(0, -1));
    start.setDate(start.getDate() - (days - 1));
  } else {
    const years = Number(range.slice(0, -1));
    start.setFullYear(start.getFullYear() - years);
    start.setDate(start.getDate() + 1);
  }
  start.setHours(0, 0, 0, 0);
  return { start, end };
}
