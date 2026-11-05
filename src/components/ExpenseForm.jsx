import { useState, useEffect, useMemo } from "react";

const COMMON_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Utilities & Bills",
  "Entertainment",
  "Housing & Rent",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
];

export default function ExpenseForm({
  onSubmit,
  editingExpense = null,
  onCancelEdit = null,
  loading = false,
}) {
  // Local calendar date implementation (YYYY-MM-DD in local time)
  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Preserve existing custom categories when editing, even if not in COMMON_CATEGORIES
  const availableCategories = useMemo(() => {
    if (
      editingExpense &&
      editingExpense.category &&
      editingExpense.category.trim() &&
      !COMMON_CATEGORIES.includes(editingExpense.category.trim())
    ) {
      return [editingExpense.category.trim(), ...COMMON_CATEGORIES];
    }
    return COMMON_CATEGORIES;
  }, [editingExpense]);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(COMMON_CATEGORIES[0]);
  const [date, setDate] = useState(getTodayDate());
  const [description, setDescription] = useState("");
  const [clientError, setClientError] = useState("");

  // Populate form fields if editing an existing expense
  useEffect(() => {
    if (editingExpense) {
      setAmount(editingExpense.amount ? String(editingExpense.amount) : "");
      setCategory(
        editingExpense.category ? editingExpense.category.trim() : COMMON_CATEGORIES[0]
      );
      setDate(editingExpense.date || getTodayDate());
      setDescription(editingExpense.description || "");
      setClientError("");
    } else {
      setAmount("");
      setCategory(COMMON_CATEGORIES[0]);
      setDate(getTodayDate());
      setDescription("");
      setClientError("");
    }
  }, [editingExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError("");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setClientError("Amount must be a positive number greater than 0.");
      return;
    }

    if (!category.trim()) {
      setClientError("Please select or enter a category.");
      return;
    }

    if (!date) {
      setClientError("Please select a valid date.");
      return;
    }

    onSubmit({
      amount: numAmount,
      category: category.trim(),
      date,
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-7 mb-8 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
              editingExpense ? "bg-amber-100 text-amber-700" : "bg-blue-50 text-blue-700"
            }`}
          >
            {editingExpense ? "✏️" : "➕"}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {editingExpense ? "Edit Expense Record" : "Add New Expense"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingExpense
                ? `Updating transaction ID #${editingExpense.id}`
                : "Record a new expenditure to update your ledger and analytics"}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Alert */}
      {clientError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-800 flex items-center gap-2"
        >
          <span className="font-bold">⚠</span>
          <span>{clientError}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Amount Field */}
          <div>
            <label
              htmlFor="amount"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Amount (₹ INR) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-60 transition shadow-sm font-mono font-medium"
              />
            </div>
          </div>

          {/* Category Field */}
          <div>
            <label
              htmlFor="category"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-60 transition shadow-sm font-medium"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Field */}
          <div>
            <label
              htmlFor="date"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-60 transition shadow-sm font-medium"
            />
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Description <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="description"
              type="text"
              placeholder="e.g. Flight to Mumbai"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:opacity-60 transition shadow-sm"
            />
          </div>
        </div>

        {/* Action Controls (Single Cancel Action kept alongside Submit) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center gap-2 ${
              editingExpense
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20 focus:ring-amber-500"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 focus:ring-blue-600"
            }`}
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{editingExpense ? "Saving Changes..." : "Adding Expense..."}</span>
              </>
            ) : (
              <span>{editingExpense ? "Save Changes" : "+ Add Expense"}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
