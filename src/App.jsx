import { useState, useEffect, useCallback, useMemo } from "react";
import AuthForm from "./components/AuthForm";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import MonthlySummary from "./components/MonthlySummary";
import SpendingCharts from "./components/SpendingCharts";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "./services/api";

// SVG Navigation & Feature Icons
function DashboardIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function ReceiptIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function AnalyticsIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
  );
}

function LogoutIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

function MenuIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function App() {
  // In-memory authentication state (strictly in-memory per Day 8 specification)
  const [authToken, setAuthToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Active navigation tab: "dashboard" | "expenses" | "analytics"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Expense management state
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);

  // User feedback messages
  const [alertMessage, setAlertMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const showAlert = (text, type = "success") => {
    setAlertMessage({ text, type });
  };

  const clearAlert = () => {
    setAlertMessage(null);
  };

  // Fetch expenses for authenticated user
  const loadExpenses = useCallback(async (token) => {
    if (!token) return;
    setExpensesLoading(true);
    try {
      const data = await getExpenses(token);
      setExpenses(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      showAlert(err.message || "Failed to load expenses.", "error");
      throw err;
    } finally {
      setExpensesLoading(false);
    }
  }, []);

  // Trigger initial load when user logs in
  useEffect(() => {
    if (authToken) {
      loadExpenses(authToken).catch(() => {});
    } else {
      setExpenses([]);
      setEditingExpense(null);
      setAlertMessage(null);
      setActiveTab("dashboard");
    }
  }, [authToken, loadExpenses]);

  // Auth Handlers
  const handleLoginSuccess = ({ token, email, name }) => {
    setAuthToken(token);
    setCurrentUser({ email, name });
    showAlert(`Welcome back, ${name}! Your session is active.`);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setExpenses([]);
    setEditingExpense(null);
    setAlertMessage(null);
    setActiveTab("dashboard");
    setMobileMenuOpen(false);
  };

  // Expense Handlers
  const handleCreateOrUpdateExpense = async (formData) => {
    setFormSubmitting(true);
    clearAlert();

    try {
      if (editingExpense) {
        // Edit mode (PUT): update, then refresh exactly once.
        await updateExpense(authToken, editingExpense.id, formData);
        await loadExpenses(authToken);
        showAlert("Expense record updated successfully!");
        setEditingExpense(null);
      } else {
        // Create mode (POST): create, then refresh exactly once.
        await createExpense(authToken, formData);
        await loadExpenses(authToken);
        showAlert("New expense added successfully!");
      }
    } catch (err) {
      showAlert(err.message || "Failed to save expense.", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setDeletingId(expenseId);
    clearAlert();
    try {
      await deleteExpense(authToken, expenseId);
      if (editingExpense && editingExpense.id === expenseId) {
        setEditingExpense(null);
      }
      await loadExpenses(authToken);
      showAlert("Expense record removed successfully!");
    } catch (err) {
      showAlert(err.message || "Failed to delete expense.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  // Computed Financial Metrics (Derived 100% strictly from actual expense data)
  const totalSpend = useMemo(() => {
    return expenses.reduce((sum, item) => {
      const val = parseFloat(item.amount);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [expenses]);

  const currentMonthData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, "0");
    const currentKey = `${currentYear}-${currentMonthNum}`;
    const label = now.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    const total = expenses.reduce((sum, item) => {
      if (item.date && item.date.startsWith(currentKey)) {
        const val = parseFloat(item.amount);
        return sum + (isNaN(val) ? 0 : val);
      }
      return sum;
    }, 0);

    return { total, label };
  }, [expenses]);

  const averageMonthlySpend = useMemo(() => {
    const activeMonths = new Set();
    expenses.forEach((item) => {
      if (item.date) {
        const parts = item.date.split("-");
        if (parts.length >= 2) activeMonths.add(`${parts[0]}-${parts[1]}`);
      }
    });
    const count = activeMonths.size;
    return count > 0 ? totalSpend / count : 0;
  }, [expenses, totalSpend]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Recent 5 transactions for the Dashboard overview
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 5);
  }, [expenses]);

  // Today formatted header string
  const todayDateString = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  // Unauthenticated Split-Screen Experience
  if (!authToken || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-8 antialiased">
        {/* Simple Top Brand Bar */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold font-mono text-sm shadow-sm">
              ₹
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
              Personal Expense Tracker
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            Fintech SaaS
          </span>
        </header>

        {/* Center Split Screen Auth Component */}
        <main className="my-auto py-8">
          <AuthForm onLoginSuccess={handleLoginSuccess} />
        </main>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto w-full text-center text-xs text-slate-400 py-4">
          Personal Expense Tracker • Enterprise Edition • Built with FastAPI, PostgreSQL & React
        </footer>
      </div>
    );
  }

  // Authenticated Enterprise Dashboard Experience
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex antialiased">
      {/* Mobile Sidebar Backdrop Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold font-mono text-base shadow-md shadow-blue-500/20">
                ₹
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  Expense Tracker
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400">
                  Enterprise
                </span>
              </div>
            </div>
            {/* Close button on mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab("dashboard");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <DashboardIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("expenses");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === "expenses"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <ReceiptIcon className="w-4 h-4" />
              <span>Expenses</span>
              {expenses.length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                  {expenses.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("analytics");
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                activeTab === "analytics"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <AnalyticsIcon className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer: User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 transition duration-150"
          >
            <LogoutIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-extrabold text-slate-900 capitalize">
                {activeTab === "dashboard"
                  ? "Financial Overview"
                  : activeTab === "expenses"
                  ? "Expense Ledger"
                  : "Spending Analytics"}
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                {todayDateString}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== "expenses" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("expenses");
                  setEditingExpense(null);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/20 transition"
              >
                <span>+</span>
                <span>Add Expense</span>
              </button>
            )}

            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-right">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        {/* Main Body Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Global User Feedback Alert */}
          {alertMessage && (
            <div
              role="status"
              className={`mb-6 rounded-2xl border p-4 text-xs font-medium flex items-center justify-between shadow-sm transition-all ${
                alertMessage.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-sm">
                  {alertMessage.type === "error" ? "⚠" : "✓"}
                </span>
                <span>{alertMessage.text}</span>
              </div>
              <button
                type="button"
                onClick={clearAlert}
                className="text-slate-400 hover:text-slate-800 text-base leading-none font-bold p-1"
              >
                ×
              </button>
            </div>
          )}

          {/* TAB 1: DASHBOARD (Overview) */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-3">
                    Portfolio Status: Active
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {currentUser.name}!
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Here is your expenditure breakdown. You have logged{" "}
                    <span className="font-bold text-white">{expenses.length}</span> transaction{expenses.length === 1 ? "" : "s"} totaling{" "}
                    <span className="font-mono font-bold text-white">{formatCurrency(totalSpend)}</span>.
                  </p>
                </div>
              </div>

              {/* 4 Financial Summary KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Total Spending */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total Expenditure
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                    {formatCurrency(totalSpend)}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block">
                    All-time recorded spend
                  </span>
                </div>

                {/* Metric 2: Current Month Spending */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Current Month
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                    {formatCurrency(currentMonthData.total)}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block truncate">
                    {currentMonthData.label}
                  </span>
                </div>

                {/* Metric 3: Monthly Average */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Monthly Average
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                    {formatCurrency(averageMonthlySpend)}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Mean spend across active months
                  </span>
                </div>

                {/* Metric 4: Total Transactions */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Logged Transactions
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-slate-900">
                    {expenses.length}
                  </p>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Entries in database
                  </span>
                </div>
              </div>

              {/* Monthly Spending Summary Component */}
              <MonthlySummary expenses={expenses} />

              {/* Chart.js Spending Trends */}
              <SpendingCharts expenses={expenses} />

              {/* Recent Activity Table Preview */}
              <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Recent Activity
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Latest 5 recorded transactions
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("expenses")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View All {expenses.length} Expenses →
                  </button>
                </div>

                {recentExpenses.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    No transactions yet. Click "+ Add Expense" to record your first transaction.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentExpenses.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                            ₹
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              {item.category}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {item.description || "No description"} • {item.date}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPENSES (CRUD Management) */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              {/* Expense Creation / Editing Form */}
              <ExpenseForm
                onSubmit={handleCreateOrUpdateExpense}
                editingExpense={editingExpense}
                onCancelEdit={() => setEditingExpense(null)}
                loading={formSubmitting}
              />

              {/* Full Expense History Table */}
              <ExpenseList
                expenses={expenses}
                loading={expensesLoading}
                onEdit={(item) => {
                  setEditingExpense(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                onDelete={handleDeleteExpense}
                deletingId={deletingId}
                onAddNew={() => {
                  setEditingExpense(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {/* TAB 3: ANALYTICS (Charts & Deep Breakdown) */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Chart.js Visualizations */}
              <SpendingCharts expenses={expenses} />

              {/* Monthly Summary Breakdown */}
              <MonthlySummary expenses={expenses} />
            </div>
          )}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-6 px-8 text-center text-xs text-slate-400 mt-auto">
          Personal Expense Tracker • Enterprise Fintech Redesign • Day 14 Polish
        </footer>
      </div>
    </div>
  );
}
