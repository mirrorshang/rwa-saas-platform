const MS_PER_DAY = 86_400_000;
export const ACTUAL_365_FIXED = "Actual/365 Fixed";

function dayNumber(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("日期须为 YYYY-MM-DD");
  const [year, month, day] = value.split("-").map(Number);
  const result = Date.UTC(year, month - 1, day) / MS_PER_DAY;
  if (new Date(result * MS_PER_DAY).toISOString().slice(0, 10) !== value)
    throw new Error("无效日期");
  return result;
}

export function actual365MonthlyInterest(input: {
  principal: number;
  annualRate: number;
  period: string;
  startDate: string;
  maturityDate: string;
}) {
  if (!/^\d{4}-\d{2}$/.test(input.period)) throw new Error("计息周期须为 YYYY-MM");
  if (!Number.isFinite(input.principal) || input.principal < 0 || !Number.isFinite(input.annualRate) || input.annualRate < 0)
    throw new Error("本金和年利率须为非负数");
  const periodStart = dayNumber(`${input.period}-01`);
  const nextMonth = new Date((periodStart + 32) * MS_PER_DAY);
  const periodEnd = Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 1) / MS_PER_DAY;
  const start = Math.max(periodStart, dayNumber(input.startDate));
  const end = Math.min(periodEnd, dayNumber(input.maturityDate));
  const days = Math.max(0, end - start);
  const amount = Math.round((input.principal * input.annualRate * days / 365 / 100) * 1_000_000) / 1_000_000;
  return { days, amount, from: new Date(start * MS_PER_DAY).toISOString().slice(0, 10), to: new Date(end * MS_PER_DAY).toISOString().slice(0, 10) };
}
