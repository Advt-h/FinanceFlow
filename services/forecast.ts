/**
 * Forecasts total spending for the current month using daily linear regression.
 * Only uses data from the current month.
 */
export function getDailyExpenseForecastForCurrentMonth(expenses: { date: Date; amount: number }[], now: Date = new Date()) {
  // Filter expenses for current month
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dailyTotals: number[] = Array(daysInMonth).fill(0);
  expenses.forEach(exp => {
    if (exp.date.getFullYear() === year && exp.date.getMonth() === month) {
      const day = exp.date.getDate() - 1;
      dailyTotals[day] += exp.amount;
    }
  });
  // Cumulative sum for each day
  const cumulative: number[] = [];
  let sum = 0;
  for (let i = 0; i < daysInMonth; i++) {
    sum += dailyTotals[i];
    cumulative.push(sum);
  }
  // Use only days up to today for regression
  const today = now.getDate();
  const x = Array.from({ length: today }, (_, i) => i + 1);
  const y = cumulative.slice(0, today);
  const currentTotal = y[y.length - 1] || 0;
  if (x.length < 2) {
    return {
      forecast: currentTotal,
      dailyTotals,
      cumulative,
      message: 'Insufficient data for daily trend. Showing current total.'
    };
  }
  // Linear regression
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  // Forecast for last day of month (regression)
  const regressionForecast = m * daysInMonth + b;
  // Simple extrapolation: average daily spend so far * days in month
  const avgDaily = currentTotal / today;
  const extrapolatedForecast = avgDaily * daysInMonth;
  // Combine both (average for smoothing)
  let forecast = Math.round((regressionForecast + extrapolatedForecast) / 2);
  // Safeguard: never predict less than current total
  if (forecast < currentTotal) forecast = Math.round(currentTotal);
  return {
    forecast,
    dailyTotals,
    cumulative,
    slope: m,
    intercept: b,
    message: forecast,
  };
}
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";

/**
 * Fetches expenses from Firestore, groups them by month, performs linear regression
 * on monthly totals, and returns a forecast for the next month.
 */
export async function getMonthlyExpenseForecast() {
  const user = auth.currentUser;
  if (!user) return null;

  // Step 1: Fetch expenses from Firestore
  const snapshot = await getDocs(collection(db, "users", user.uid, "expenses"));

  const expenses = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      amount: data.amount,
      date: new Date(data.date),
      category: data.category,
      description: data.description,
    };
  });

  if (expenses.length === 0) return null;

  // Step 2: Group expenses by month in YYYY-MM
  const monthlyTotals: Record<string, number> = {};

  expenses.forEach(exp => {
    const key = `${exp.date.getFullYear()}-${String(exp.date.getMonth() + 1).padStart(2, "0")}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + exp.amount;
  });

  const months = Object.keys(monthlyTotals);
  const totals = Object.values(monthlyTotals);

  // Simple ML: Moving Average (last 3 months or all if less)
  const movingAvg = () => {
    const n = Math.min(3, totals.length);
    if (n === 0) return 0;
    return Math.round(totals.slice(-n).reduce((a, b) => a + b, 0) / n);
  };
  // Simple ML: Median
  const median = () => {
    if (totals.length === 0) return 0;
    const sorted = [...totals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : Math.round(sorted[mid]);
  };

  // If only 1 month, use that value
  if (totals.length === 1) {
    return {
      forecast: totals[0],
      months,
      message: "Only one month of data. Using last month's spending."
    };
  }
  // If 2-3 months, use moving average and median
  if (totals.length > 1 && totals.length <= 3) {
    const avg = movingAvg();
    const med = median();
    return {
      forecast: Math.round((avg + med) / 2),
      months,
      message: `Simple ML: Average of last ${totals.length} months and median.`
    };
  }
  // Otherwise, use regression, moving average, and median (ensemble)
  // Step 3: Convert to regression format
  // x = month index, y = totals
  const x = totals.map((_, i) => i + 1);
  const y = totals;

  // Linear Regression Formula Calculations
  const n = totals.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  // slope (m) and intercept (b)
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;

  // Step 4: Forecast next month (n+1)
  const nextMonthIndex = n + 1;
  const regressionForecast = m * nextMonthIndex + b;
  const avg = movingAvg();
  const med = median();
  // Ensemble: average all three
  const forecast = Math.round((regressionForecast + avg + med) / 3);

  return {
    forecast,
    months,
    monthlyTotals,
    slope: m,
    intercept: b,
    message: `Ensemble of regression, moving average, and median.`,
  };
}
