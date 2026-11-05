import { useMemo } from "react";

export default function MonthlySummary({ expenses = [] }) {
  // Format currency in Indian Rupees (₹)
  const formatINR = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const analytics = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        monthlyList: [],
        currentMonthTotal: 0,
        currentMonthLabel: "",
        monthlyAverage: 0,
        highestMonth: null,
        totalExpenses: 0,
      };
    }

    const monthMap = {};
    let grandTotal = 0;

    // Current year-month key in local time (e.g., "2026-11")
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, "0");
    const currentKey = `${currentYear}-${currentMonthNum}`;
    const currentMonthLabel = now.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });

    expenses.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;

      // 1. Validate date as a string in exact YYYY-MM-DD format using a regular expression
      if (!item.date || typeof item.date !== "string") return;
      const match = item.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return;

      // 2. Parse year, month, day once
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const day = parseInt(match[3], 10);
      if (month < 1 || month > 12) return;

      // 3. Validate calendar date including month, day and leap-year validity
      const dateObj = new Date(year, month - 1, day);
      if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() !== month - 1 ||
        dateObj.getDate() !== day
      ) {
        return;
      }

      // 4. Declare the month key once (YYYY-MM)
      const key = `${match[1]}-${match[2]}`;

      // 5. Create the monthMap entry once
      if (!monthMap[key]) {
        const monthFirstDate = new Date(year, month - 1, 1);
        const label = monthFirstDate.toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });
        const fullLabel = monthFirstDate.toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        });
        monthMap[key] = {
          key,
          label,
          fullLabel,
          total: 0,
          count: 0,
        };
      }

      // 6. Add the expense amount to monthMap[key].total exactly once
      monthMap[key].total += amount;

      // 7. Increment monthMap[key].count exactly once
      monthMap[key].count += 1;

      // 8. Add the amount to grandTotal exactly once, only after successful date validation
      grandTotal += amount;
    });

    // Chronological sorting of month keys (e.g., "2026-08", "2026-09", "2026-10")
    const sortedKeys = Object.keys(monthMap).sort();
    const monthlyList = sortedKeys.map((k) => monthMap[k]);

    // Current month spending
    const currentMonthTotal = monthMap[currentKey] ? monthMap[currentKey].total : 0;

    // Monthly average across recorded months (consistent valid-date numerator and denominator)
    const monthCount = sortedKeys.length;
    const monthlyAverage = monthCount > 0 ? grandTotal / monthCount : 0;

    // Highest-spending month
    let highestMonth = null;
    monthlyList.forEach((m) => {
      if (!highestMonth || m.total > highestMonth.total) {
        highestMonth = m;
      }
    });

    return {
      monthlyList,
      currentMonthTotal,
      currentMonthLabel,
      monthlyAverage,
      highestMonth,
      totalExpenses: grandTotal,
    };
  }, [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Monthly Expenditure Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated financial run-rates and month-by-month spending metrics
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          Financial Summary
        </span>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Current Month ({analytics.currentMonthLabel || "This Month"})
          </span>
          <p className="mt-2 text-xl font-extrabold font-mono text-slate-900">
            {formatINR(analytics.currentMonthTotal)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Expenditure logged for {analytics.currentMonthLabel}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Monthly Average
          </span>
          <p className="mt-2 text-xl font-extrabold font-mono text-slate-900">
            {formatINR(analytics.monthlyAverage)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Across {analytics.monthlyList.length} recorded month{analytics.monthlyList.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Peak Spending Month
          </span>
          <p className="mt-2 text-xl font-extrabold font-mono text-slate-900">
            {analytics.highestMonth ? formatINR(analytics.highestMonth.total) : "₹0.00"}
          </p>
          <span className="text-xs text-slate-500 mt-1 block truncate">
            {analytics.highestMonth ? analytics.highestMonth.fullLabel : "N/A"}
          </span>
        </div>
      </div>

      {/* Chronological Monthly Breakdown Table with Consistent Share of Total */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3">
                Billing Period
              </th>
              <th scope="col" className="px-5 py-3 text-center">
                Transactions
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Total Spent (INR)
              </th>
              <th scope="col" className="px-5 py-3 text-right">
                Share of Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {analytics.monthlyList.map((m) => {
              const pctNumber = analytics.totalExpenses > 0
                ? (m.total / analytics.totalExpenses) * 100
                : 0;
              const pctString = pctNumber.toFixed(1);
              return (
                <tr
                  key={m.key}
                  className="hover:bg-slate-50/50 transition duration-150"
                >
                  <td className="px-5 py-3.5 font-semibold text-xs text-slate-900">
                    {m.fullLabel}
                  </td>
                  <td className="px-5 py-3.5 text-center text-xs text-slate-600 font-medium">
                    {m.count}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-xs text-slate-900">
                    {formatINR(m.total)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(pctNumber, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-slate-600 w-11 text-right">
                        {pctString}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
