import { useState, useMemo } from "react";

function getCategoryColor(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("food") || cat.includes("dining")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (cat.includes("transport")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (cat.includes("utilit") || cat.includes("bill")) {
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  }
  if (cat.includes("entertain")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  if (cat.includes("house") || cat.includes("rent")) {
    return "bg-slate-100 text-slate-700 border-slate-300";
  }
  if (cat.includes("health")) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (cat.includes("shop")) {
    return "bg-pink-50 text-pink-700 border-pink-200";
  }
  if (cat.includes("educat")) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default function ExpenseList({
  expenses = [],
  loading = false,
  onEdit,
  onDelete,
  deletingId = null,
  onAddNew = null,
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "₹0.00";
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Get distinct trimmed categories
  const categories = useMemo(() => {
    const set = new Set();
    expenses.forEach((item) => {
      if (item.category && item.category.trim()) {
        set.add(item.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [expenses]);

  // Filtered expenses based on search and trimmed category match
  const filteredExpenses = useMemo(() => {
    const trimmedFilter = categoryFilter.trim();
    const term = searchTerm.trim().toLowerCase();

    return expenses.filter((item) => {
      const itemCategory = item.category ? item.category.trim() : "";
      const matchesCategory =
        trimmedFilter === "ALL" || itemCategory === trimmedFilter;

      const matchesSearch =
        !term ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (itemCategory && itemCategory.toLowerCase().includes(term)) ||
        (item.amount !== undefined && String(item.amount).includes(term)) ||
        (item.date && item.date.includes(term));

      return matchesCategory && matchesSearch;
    });
  }, [expenses, categoryFilter, searchTerm]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => {
      const val = parseFloat(item.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [filteredExpenses]);

  if (loading && expenses.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
        <div className="inline-block animate-spin text-3xl text-blue-600 mb-3">⟳</div>
        <p className="text-sm font-semibold text-slate-700">
          Loading your financial ledger...
        </p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">
          🧾
        </div>
        <h3 className="text-base font-bold text-slate-900">
          No expenses recorded yet
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5 leading-relaxed">
          Your transaction ledger is currently empty. Record your first expense above to start tracking your daily and monthly spending.
        </p>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition"
          >
            + Record First Expense
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden mb-8">
      {/* Top Filter and Search Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              Transaction History
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {filteredExpenses.length} of {expenses.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total for visible records:{" "}
            <span className="font-mono font-bold text-slate-800">
              {formatCurrency(filteredTotal)}
            </span>
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search box with accurate descriptive placeholder */}
          <div className="relative min-w-[260px] sm:min-w-[320px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search description, category, amount or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm"
            />
          </div>

          {/* Category Dropdown Filter */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition shadow-sm font-medium"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Date
              </th>
              <th scope="col" className="px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-6 py-3.5">
                Description
              </th>
              <th scope="col" className="px-6 py-3.5 text-right">
                Amount (INR)
              </th>
              <th scope="col" className="px-6 py-3.5 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-xs text-slate-500"
                >
                  No transactions match your search filter "{searchTerm}".
                </td>
              </tr>
            ) : (
              filteredExpenses.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 transition duration-150"
                >
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-slate-400">📅</span>
                      <span>{formatDate(item.date)}</span>
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-lg border ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                    {item.description ? (
                      <span className="font-medium text-slate-800">
                        {item.description}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">No description</span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-slate-900 text-sm">
                    {formatCurrency(item.amount)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {confirmDeleteId === item.id ? (
                      <div className="inline-flex items-center gap-1.5 p-1 rounded-lg bg-rose-50 border border-rose-200">
                        <span className="text-[11px] text-rose-700 font-bold px-1">
                          Delete?
                        </span>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => {
                            onDelete(item.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-2 py-1 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white transition disabled:opacity-50"
                        >
                          {deletingId === item.id ? "Deleting..." : "Yes"}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
