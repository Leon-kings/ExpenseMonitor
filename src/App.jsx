/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "react-toastify/dist/ReactToastify.css";
import image from "./assets/images/ChatGPT Image Oct 7, 2025, 03_11_12 AM.png";
import {
  AccountBalanceWallet,
  Savings,
  ShoppingCart,
  Restaurant,
  LocalGroceryStore,
  HealthAndSafety,
  SportsEsports,
  Add,
  Delete,
  TrendingUp,
  Warning,
  Category,
  AttachMoney,
  DonutLarge,
  BarChart as BarChartIcon,
  Psychology,
  Insights,
  Paid,
  MoneyOff,
  CheckCircle,
  Error,
  CarCrashOutlined,
  EventAvailable,
  CurrencyPound,
} from "@mui/icons-material";

class ExpenseModel {
  constructor() {
    this.storageKey = "smart-expense-tracker-data";
  }

  // Get all data from localStorage
  getStoredData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  }

  // Save all data to localStorage
  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Error saving to storage:", error);
      return false;
    }
  }

  // Initialize default data
  getInitialData() {
    return {
      expenses: [],
      budget: {
        id: "1",
        totalAmount: 3000,
        needsPercentage: 50,
        wantsPercentage: 30,
        month: new Date().toISOString().slice(0, 7),
      },
    };
  }

  // Load data with fallback to defaults
  loadData() {
    const stored = this.getStoredData();
    return stored || this.getInitialData();
  }

  // Classify expense as need or want
  classifyExpense(category) {
    const needCategories = [
      "Groceries",
      "Rent",
      "Utilities",
      "Healthcare",
      "Transportation",
    ];
    return needCategories.includes(category) ? "need" : "want";
  }

  // Generate human-friendly messages - FIXED: Added budget parameter
  getFinancialAdvice(needsProgress, wantsProgress, remainingBalance, budget) {
    if (needsProgress > 100) {
      return {
        type: "warning",
        message:
          "You're overspending on needs! Consider reviewing essential expenses.",
        icon: Warning,
      };
    }
    if (wantsProgress > 100) {
      return {
        type: "warning",
        message:
          "Wants are exceeding budget! Time to prioritize your spending.",
        icon: MoneyOff,
      };
    }
    if (remainingBalance > budget.totalAmount * 0.2) {
      return {
        type: "success",
        message:
          "Great job! You're saving well. Consider investing the extra funds.",
        icon: CheckCircle,
      };
    }
    return {
      type: "info",
      message: "You're on track! Keep monitoring your spending habits.",
      icon: Insights,
    };
  }
}

class FinancialCalculator {
  // Calculate comprehensive financial summary
  calculateSummary(expenses, budget) {
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const needsSpent = expenses
      .filter((expense) => expense.type === "need")
      .reduce((sum, expense) => sum + expense.amount, 0);
    const wantsSpent = expenses
      .filter((expense) => expense.type === "want")
      .reduce((sum, expense) => sum + expense.amount, 0);

    const needsAllocation = budget.totalAmount * (budget.needsPercentage / 100);
    const wantsAllocation = budget.totalAmount * (budget.wantsPercentage / 100);

    return {
      totalIncome: budget.totalAmount,
      totalExpenses,
      remainingBalance: budget.totalAmount - totalExpenses,
      needsSpent,
      wantsSpent,
      needsAllocation,
      wantsAllocation,
      needsProgress:
        needsAllocation > 0 ? (needsSpent / needsAllocation) * 100 : 0,
      wantsProgress:
        wantsAllocation > 0 ? (wantsSpent / wantsAllocation) * 100 : 0,
    };
  }

  // Get spending by category for charts
  getCategorySpending(expenses) {
    return expenses.reduce((acc, expense) => {
      const existing = acc.find((item) => item.name === expense.category);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({
          name: expense.category,
          amount: expense.amount,
          type: expense.type,
        });
      }
      return acc;
    }, []);
  }

  // Get budget distribution data for pie chart
  getBudgetDistribution(summary) {
    return [
      {
        name: "Essential Needs",
        value: summary.needsSpent || 0,
        color: "#10B981",
        description: "Things you need to live",
      },
      {
        name: "Lifestyle Wants",
        value: summary.wantsSpent || 0,
        color: "#8B5CF6",
        description: "Things that make life enjoyable",
      },
      {
        name: "Available Funds",
        value: Math.max(0, summary.remainingBalance || 0),
        color: "#3B82F6",
        description: "Money left for saving or spending",
      },
    ].filter((item) => item.value > 0);
  }
}

// ==================== CONSTANTS ====================

const CATEGORIES = {
  needs: [
    {
      name: "Groceries",
      icon: LocalGroceryStore,
      color: "text-green-500",
      description: "Food and household essentials",
    },
    {
      name: "Rent",
      icon: AccountBalanceWallet,
      color: "text-blue-500",
      description: "Housing payments",
    },
    {
      name: "Utilities",
      icon: HealthAndSafety,
      color: "text-yellow-500",
      description: "Electricity, water, internet",
    },

    {
      name: "Healthcare",
      icon: HealthAndSafety,
      color: "text-red-500",
      description: "Medical and health expenses",
    },
    {
      name: "Transportation",
      icon: CarCrashOutlined,
      color: "text-purple-500",
      description: "Fuel, tickets, maintenance",
    },
  ],
  wants: [
    {
      name: "Dining Out",
      icon: Restaurant,
      color: "text-pink-500",
      description: "Restaurants and takeout",
    },
    {
      name: "Entertainment",
      icon: EventAvailable,
      color: "text-indigo-500",
      description: "Movies, events, subscriptions",
    },
    {
      name: "Shopping",
      icon: ShoppingCart,
      color: "text-orange-500",
      description: "Clothes, gadgets, non-essentials",
    },
    {
      name: "Hobbies",
      icon: SportsEsports,
      color: "text-teal-500",
      description: "Sports, games, activities",
    },
  ],
};

// Custom Tooltip for Charts
const ChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-4 rounded-xl shadow-lg border border-gray-200"
      >
        <p className="font-bold text-gray-800">{payload[0].name}</p>
        <p
          className="text-lg font-semibold"
          style={{ color: payload[0].color }}
        >
          ${payload[0].value.toFixed(2)}
        </p>
        {payload[0].payload.description && (
          <p className="text-sm text-gray-600 mt-1">
            {payload[0].payload.description}
          </p>
        )}
      </motion.div>
    );
  }
  return null;
};

// Budget Progress Bar Component
const ProgressBar = ({ progress, label, spent, allocated }) => {
  const getStatusColor = (progress) => {
    if (progress > 100) return "bg-red-500";
    if (progress > 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          ${spent.toFixed(2)} / ${allocated.toFixed(2)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          className={`h-4 rounded-full ${getStatusColor(
            progress
          )} transition-all duration-1000 ease-out`}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>0%</span>
        <span
          className={`font-semibold ${
            progress > 100
              ? "text-red-600"
              : progress > 80
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {Math.min(progress, 100).toFixed(1)}%
        </span>
        <span>100%</span>
      </div>
    </div>
  );
};

// Financial Advice Card
const AdviceCard = ({ advice }) => {
  if (!advice) return null;

  const { type, message, icon: Icon } = advice;

  const styles = {
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border-2 ${styles[type]} flex items-start space-x-3 mb-6`}
    >
      <Icon className="text-xl mt-0.5 flex-shrink-0" />
      <p className="text-sm font-medium leading-relaxed">{message}</p>
    </motion.div>
  );
};

// ==================== MAIN APP COMPONENT =====================

export function App() {
  // Initialize models
  const expenseModel = new ExpenseModel();
  const financialCalculator = new FinancialCalculator();

  // Load initial data
  const initialData = expenseModel.loadData();

  const [expenses, setExpenses] = useState(initialData.expenses);
  const [budget, setBudget] = useState(initialData.budget);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    remainingBalance: 0,
    needsSpent: 0,
    wantsSpent: 0,
    needsAllocation: 0,
    wantsAllocation: 0,
    needsProgress: 0,
    wantsProgress: 0,
  });
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
  });

  // Calculate financial summary when data changes
  useEffect(() => {
    const summary = financialCalculator.calculateSummary(expenses, budget);
    setFinancialSummary(summary);

    // Save to localStorage
    expenseModel.saveData({ expenses, budget });
  }, [expenses, budget]);

  // Add new expense
  const addExpense = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: expenseModel.classifyExpense(formData.category),
      date: new Date(),
      description: formData.description,
    };

    setExpenses((prev) => [newExpense, ...prev]);

    // Reset form
    setFormData({
      title: "",
      amount: "",
      category: "",
      description: "",
    });

    toast.success("💰 Expense added successfully!");
  };

  // Delete expense
  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((expense) => expense.id !== id));
    toast.info("🗑️ Expense removed!");
  };

  // Update budget
  const updateBudget = (updates) => {
    setBudget((prev) => ({ ...prev, ...updates }));
    toast.success("📊 Budget updated!");
  };

  // Get financial advice - FIXED: Pass budget parameter
  const financialAdvice = expenseModel.getFinancialAdvice(
    financialSummary.needsProgress,
    financialSummary.wantsProgress,
    financialSummary.remainingBalance,
    budget // ✅ Now passing budget to the method
  );

  // Get chart data
  const pieData = financialCalculator.getBudgetDistribution(financialSummary);
  const categoryData = financialCalculator.getCategorySpending(expenses);

  return (
    <>
      <div className="w-full min-h-screen bg-gradient-to-bl text-black from-blue-300 via-blue-50 to-indigo-300">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <img
            src={image}
            alt=""
            className="justify-items-end w-20 rounded-xl"
          />
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <CurrencyPound className="text-4xl text-blue-600 mr-4" />
              <h2 className="text-5xl font-bold italic bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MoneyMind
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Your smart financial companion that helps you understand and
              optimize your spending habits
            </p>
          </motion.header>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="xl:col-span-1 space-y-8">
              {/* Budget Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Your Budget
                  </h2>
                  <Paid className="text-green-500 text-3xl" />
                </div>

                {/* Monthly Budget Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💰 Monthly Budget
                  </label>
                  <div className="relative">
                    <AttachMoney className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="number"
                      value={budget.totalAmount}
                      onChange={(e) =>
                        updateBudget({ totalAmount: Number(e.target.value) })
                      }
                      className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      min="0"
                    />
                  </div>
                </div>

                {/* Budget Allocation */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-green-600">
                      Essential Needs
                    </span>
                    <span className="text-gray-600">
                      {budget.needsPercentage}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-purple-600">
                      Lifestyle Wants
                    </span>
                    <span className="text-gray-600">
                      {budget.wantsPercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bars */}
                <ProgressBar
                  progress={financialSummary.needsProgress || 0}
                  label="Essential Needs"
                  spent={financialSummary.needsSpent || 0}
                  allocated={financialSummary.needsAllocation || 0}
                  color="green"
                />

                <ProgressBar
                  progress={financialSummary.wantsProgress || 0}
                  label="Lifestyle Wants"
                  spent={financialSummary.wantsSpent || 0}
                  allocated={financialSummary.wantsAllocation || 0}
                  color="purple"
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-xl font-bold text-green-600">
                      ${(financialSummary.remainingBalance || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-xl font-bold text-blue-600">
                      ${(financialSummary.totalExpenses || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Financial Advice */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AdviceCard advice={financialAdvice} />
              </motion.div>

              {/* Add Expense Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
              >
                <div className="flex items-center mb-6">
                  <Add className="text-blue-500 text-2xl mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">
                    Add Expense
                  </h2>
                </div>

                <form onSubmit={addExpense} className="space-y-4">
                  {/* Expense Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      What did you spend on?
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="e.g., Groceries, Movie night..."
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <AttachMoney className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Category className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-all duration-200"
                      >
                        <option value="">Choose a category</option>
                        <optgroup label="🏠 Essential Needs">
                          {CATEGORIES.needs.map((category) => (
                            <option key={category.name} value={category.name}>
                              {category.name} - {category.description}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="🎯 Lifestyle Wants">
                          {CATEGORIES.wants.map((category) => (
                            <option key={category.name} value={category.name}>
                              {category.name} - {category.description}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Any additional details..."
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={
                      !formData.title || !formData.amount || !formData.category
                    }
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    💾 Add Expense
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-3 space-y-8">
              {/* Charts Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Financial Insights
                  </h2>
                  <Psychology className="text-purple-500 text-4xl" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Budget Distribution Pie Chart */}
                  <div>
                    <div className="flex items-center mb-6">
                      <DonutLarge className="text-green-500 text-2xl mr-3" />
                      <h3 className="text-xl font-semibold text-gray-700">
                        Where Your Money Goes
                      </h3>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(1)}%)`
                            }
                            labelLine={false}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<ChartTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Category Spending Bar Chart */}
                  <div>
                    <div className="flex items-center mb-6">
                      <BarChartIcon className="text-purple-500 text-2xl mr-3" />
                      <h3 className="text-xl font-semibold text-gray-700">
                        Spending by Category
                      </h3>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="opacity-30"
                          />
                          <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.type === "need" ? "#10B981" : "#8B5CF6"
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Expenses List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Recent Expenses
                  </h2>
                  <div className="flex items-center space-x-4">
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                      {expenses.length} transactions
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {expenses.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 text-gray-500"
                      >
                        <Savings className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-2xl font-semibold mb-2">
                          No expenses yet
                        </p>
                        <p className="text-lg">
                          Start by adding your first expense above! 📝
                        </p>
                      </motion.div>
                    ) : (
                      expenses.map((expense, index) => (
                        <motion.div
                          key={expense.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="grid grid-cols-1 items-center ">
                            <div
                              className={`p-4 rounded-2xl ${
                                expense.type === "need"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600"
                              } group-hover:scale-110 transition-transform duration-300`}
                            >
                              {React.createElement(
                                CATEGORIES[expense.type + "s"].find(
                                  (cat) => cat.name === expense.category
                                )?.icon || ShoppingCart,
                                { className: "text-2xl" }
                              )}
                            </div>

                            <div>
                              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                                {expense.title}
                              </h3>
                              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-2">
                                <span
                                  className={`px-3 py-1 rounded-full font-medium ${
                                    expense.type === "need"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {expense.type === "need"
                                    ? "Essential"
                                    : "Lifestyle"}
                                </span>
                                <span>•</span>
                                <span>{expense.category}</span>
                                <span>•</span>
                                <span>
                                  {new Date(expense.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              {expense.description && (
                                <p className="text-gray-500 mt-2 max-w-md">
                                  {expense.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 items-center space-x-4">
                            <motion.span
                              className={`text-2xl font-bold ${
                                expense.type === "need"
                                  ? "text-green-600"
                                  : "text-purple-600"
                              }`}
                              whileHover={{ scale: 1.1 }}
                            >
                              ${expense.amount.toFixed(2)}
                            </motion.span>

                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteExpense(expense.id)}
                              className="p-3 bg-gradient-to-b from-red-400 to-red-500 rounded-xl transition-colors duration-200 group/delete"
                              title="Delete expense"
                            >
                              <Delete className="group-hover/delete:scale-110 transition-transform duration-200" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                {/* Summary Footer */}
                {expenses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 pt-8 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-2xl border-2 border-green-200">
                        <p className="text-green-600 font-semibold mb-2">
                          Essential Needs
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          $
                          {expenses
                            .filter((e) => e.type === "need")
                            .reduce((sum, e) => sum + e.amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-2xl border-2 border-purple-200">
                        <p className="text-purple-600 font-semibold mb-2">
                          Lifestyle Wants
                        </p>
                        <p className="text-2xl font-bold text-purple-700">
                          $
                          {expenses
                            .filter((e) => e.type === "want")
                            .reduce((sum, e) => sum + e.amount, 0)
                            .toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-2xl border-2 border-blue-200">
                        <p className="text-blue-600 font-semibold mb-2">
                          Daily Average
                        </p>
                        <p className="text-2xl font-bold text-blue-700">
                          $
                          {((financialSummary.totalExpenses || 0) / 30).toFixed(
                            2
                          )}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
                        <p className="text-orange-600 font-semibold mb-2">
                          Transactions
                        </p>
                        <p className="text-2xl font-bold text-orange-700">
                          {expenses.length}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          toastClassName="rounded-xl"
          progressClassName="bg-gradient-to-r from-blue-500 to-purple-600"
        />
      </div>
    </>
  );
}
