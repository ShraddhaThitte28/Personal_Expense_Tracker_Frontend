import { useEffect, useRef, useMemo } from "react";
import { Chart, registerables } from "chart.js";

// Register Chart.js components once
Chart.register(...registerables);

export default function SpendingCharts({ expenses = [] }) {
  const monthlyCanvasRef = useRef(null);
  const categoryCanvasRef = useRef(null);
  const monthlyChartInstance = useRef(null);
  const categoryChartInstance = useRef(null);

  // Format currency helper in INR (₹)
  const formatINR = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return {
        monthly: { labels: [], data: [] },
        category: { labels: [], data: [] },
      };
    }

    // 1. Monthly Aggregation (Chronological)
    const monthMap = {};
    expenses.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;
      if (!item.date) return;
      const parts = item.date.split("-");
      if (parts.length >= 2) {
        const key = `${parts[0]}-${parts[1]}`;
        if (!monthMap[key]) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
          monthMap[key] = {
            key,
            label: d.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
            total: 0,
          };
        }
        monthMap[key].total += amount;
      }
    });

    const sortedMonthKeys = Object.keys(monthMap).sort();
    const monthlyLabels = sortedMonthKeys.map((k) => monthMap[k].label);
    const monthlyTotals = sortedMonthKeys.map((k) => Math.round(monthMap[k].total * 100) / 100);

    // 2. Category Aggregation
    const categoryMap = {};
    expenses.forEach((item) => {
      const amount = parseFloat(item.amount) || 0;
      const cat = item.category ? item.category.trim() : "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;
    });

    const categoryLabels = Object.keys(categoryMap);
    const categoryTotals = categoryLabels.map((cat) => Math.round(categoryMap[cat] * 100) / 100);

    return {
      monthly: { labels: monthlyLabels, data: monthlyTotals },
      category: { labels: categoryLabels, data: categoryTotals },
    };
  }, [expenses]);

  // Premium Fintech Color Palette
  const categoryColors = [
    "#2563eb", // Royal Blue
    "#10b981", // Emerald
    "#6366f1", // Indigo
    "#f59e0b", // Amber
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#8b5cf6", // Purple
    "#64748b", // Slate
  ];

  // Render or update Monthly Spending Trend (Bar Chart)
  useEffect(() => {
    if (!monthlyCanvasRef.current || chartData.monthly.labels.length === 0) {
      if (monthlyChartInstance.current) {
        monthlyChartInstance.current.destroy();
        monthlyChartInstance.current = null;
      }
      return;
    }

    if (monthlyChartInstance.current) {
      monthlyChartInstance.current.destroy();
    }

    const ctx = monthlyCanvasRef.current.getContext("2d");
    monthlyChartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.monthly.labels,
        datasets: [
          {
            label: "Monthly Spending (₹)",
            data: chartData.monthly.data,
            backgroundColor: "rgba(37, 99, 235, 0.85)",
            borderColor: "rgb(29, 78, 216)",
            borderWidth: 1.5,
            borderRadius: 6,
            maxBarThickness: 42,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { size: 12, weight: "bold" },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => ` Total: ₹${Number(context.raw).toLocaleString("en-IN")}`,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: { size: 11, weight: "500" },
              color: "#64748b",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 },
              color: "#64748b",
              callback: (value) => formatINR(value),
            },
            grid: {
              color: "rgba(226, 232, 240, 0.8)",
            },
          },
        },
      },
    });

    return () => {
      if (monthlyChartInstance.current) {
        monthlyChartInstance.current.destroy();
        monthlyChartInstance.current = null;
      }
    };
  }, [chartData.monthly]);

  // Render or update Category Breakdown (Doughnut Chart)
  useEffect(() => {
    if (!categoryCanvasRef.current || chartData.category.labels.length === 0) {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
        categoryChartInstance.current = null;
      }
      return;
    }

    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }

    const ctx = categoryCanvasRef.current.getContext("2d");
    categoryChartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.category.labels,
        datasets: [
          {
            data: chartData.category.data,
            backgroundColor: categoryColors.slice(0, chartData.category.labels.length),
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 14,
              font: { size: 11, weight: "500" },
              color: "#334155",
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { size: 12, weight: "bold" },
            bodyFont: { size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = Number(context.raw);
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
                return ` ${context.label}: ₹${val.toLocaleString("en-IN")} (${pct}%)`;
              },
            },
          },
        },
        cutout: "70%",
      },
    });

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
        categoryChartInstance.current = null;
      }
    };
  }, [chartData.category]);

  // Exactly one empty-state container
  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 mb-8 text-center shadow-sm">
        <span className="text-3xl block mb-2" role="img" aria-label="No data">
          📊
        </span>
        <h4 className="text-sm font-bold text-slate-800">
          Visual Analytics Pending Data
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Record expense transactions to generate interactive monthly spending trends and category breakdown charts.
        </p>
      </div>
    );
  }

  // Exactly one analytics container rendering monthly bar chart and category doughnut chart once
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-7 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Interactive Spending Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Chart.js powered run-rate trends and category allocation
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Updated Live
        </span>
      </div>

      {/* Grid of 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Monthly Spending Trend (Bar Chart) */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Monthly Spending Trend
            </h4>
            <span className="text-[11px] text-slate-400">Chronological</span>
          </div>
          <div className="relative h-64 sm:h-72 w-full rounded-xl bg-slate-50/70 p-3 border border-slate-100">
            <canvas ref={monthlyCanvasRef} />
          </div>
        </div>

        {/* Chart 2: Category Breakdown (Doughnut Chart) */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Category Distribution
            </h4>
            <span className="text-[11px] text-slate-400">By Total Value</span>
          </div>
          <div className="relative h-64 sm:h-72 w-full rounded-xl bg-slate-50/70 p-3 border border-slate-100">
            <canvas ref={categoryCanvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
