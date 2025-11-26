import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrowUpRight, Filter, Trash2 } from 'lucide-react';
import { Category, Expense, Page } from '../types';
import { getMonthlyExpenseForecast, getDailyExpenseForecastForCurrentMonth } from '../services/forecast';


interface DashboardProps {
  categories: Category[];
  expenses: Expense[];
  monthlyBudget: number;
  onNavigate: (page: Page) => void;
  currencySymbol: string;
  onDeleteExpense: (expenseId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ categories, expenses, monthlyBudget, onNavigate, currencySymbol, onDeleteExpense }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  // Pagination and view state for expense table
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const [tableView, setTableView] = useState<'paginated' | 'byDay'>('paginated');
  const [forecast, setForecast] = useState<any>(null);
  const [dailyForecast, setDailyForecast] = useState<any>(null);

  // Prepare expenses with Date objects for forecast
  const expensesWithDate = useMemo(() =>
    expenses.map(e => ({
      ...e,
      date: typeof e.date === 'string' ? new Date(e.date) : (e.date && e.date.seconds ? new Date(e.date.seconds * 1000) : new Date()),
    })),
    [expenses]
  );

  React.useEffect(() => {
    // Monthly forecast (async, from Firestore)
    getMonthlyExpenseForecast().then(setForecast);
    // Daily forecast (local, for current month)
    setDailyForecast(getDailyExpenseForecastForCurrentMonth(expensesWithDate));
  }, [expensesWithDate]);

  // Compute total spent per category dynamically from expenses
  const categoryTotals = categories.map(cat => ({
    ...cat,
    totalSpent: expenses
      .filter(e => e.category === cat.name)
      .reduce((sum, e) => sum + e.amount, 0)
  }));

  const chartData = categoryTotals
    .filter(c => c.totalSpent > 0)
    .map(c => ({ name: c.name, value: c.totalSpent, color: c.color }));

  // Sort categories by spend for the top scroll
  const sortedCategories = [...categoryTotals].sort((a, b) => b.totalSpent - a.totalSpent);

  // Only sum expenses that belong to current categories
  const totalBalance = categoryTotals.reduce((sum, cat) => sum + cat.totalSpent, 0);
  const budgetPercentage = Math.min((totalBalance / monthlyBudget) * 100, 100);

  // Budget exceed calculation
  let budgetExceed = null;
  if (forecast && forecast.forecast > monthlyBudget) {
    budgetExceed = `Forecast exceeds budget by ${currencySymbol}${(forecast.forecast - monthlyBudget).toFixed(2)}`;
  }

  // Filter expenses
  const filteredExpenses = selectedCategory === 'All' 
    ? expenses 
    : expenses.filter(e => e.category === selectedCategory);
  // Sort by date descending
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = typeof a.date === 'string' ? new Date(a.date) : (a.date && a.date.seconds ? new Date(a.date.seconds * 1000) : new Date());
    const dateB = typeof b.date === 'string' ? new Date(b.date) : (b.date && b.date.seconds ? new Date(b.date.seconds * 1000) : new Date());
    return dateB.getTime() - dateA.getTime();
  });
  // Pagination logic
  const pagedExpenses = sortedExpenses.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(sortedExpenses.length / pageSize);

  // Group expenses by day (YYYY-MM-DD)
  const expensesByDay: { [date: string]: typeof sortedExpenses } = {};
  sortedExpenses.forEach(exp => {
    let dateStr = '';
    if (typeof exp.date === 'string') {
      dateStr = exp.date;
    } else if (exp.date && typeof exp.date === 'object' && ('seconds' in exp.date)) {
      const d = new Date(exp.date.seconds * 1000);
      dateStr = d.toISOString().split('T')[0];
    }
    if (!dateStr) return;
    if (!expensesByDay[dateStr]) expensesByDay[dateStr] = [];
    expensesByDay[dateStr].push(exp);
  });
  // Sorted list of days (descending)
  const sortedDays = Object.keys(expensesByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto text-[#E5E7EB]">
      {/* Header & Budget Overview + Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-700 to-[#23262b] rounded-2xl p-6 text-[#E5E7EB] shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-indigo-200 font-medium mb-1">Total Spent This Month</p>
            <h2 className="text-4xl font-bold mb-6">{currencySymbol}{totalBalance.toFixed(2)}</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-indigo-100">Monthly Budget</span>
                <span className="text-white">{currencySymbol}{monthlyBudget.toFixed(2)}</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full bg-white/90 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${budgetPercentage}%` }}
                />
              </div>
              <p className="text-xs text-indigo-200 text-right mt-1">{budgetPercentage.toFixed(1)}% Used</p>
              {forecast && (
                <div className="mt-2 text-sm text-indigo-100">
                  <span>Forecasted next month: <b>{currencySymbol}{forecast.forecast}</b></span>
                  {typeof forecast.message === 'string' ? (
                    <div className="text-xs text-yellow-300 mt-1">{forecast.message}</div>
                  ) : (
                    <div className="text-xs text-yellow-300 mt-1">Based on your spending trend, your projected spending next month is {currencySymbol}{forecast.forecast}.</div>
                  )}
                  {budgetExceed && <div className="text-xs text-red-400 mt-1">{budgetExceed}</div>}
                </div>
              )}
              {dailyForecast && (
                <div className="mt-2 text-xs text-indigo-200">
                  <span>
                    Projected total spending for this month: <b>{currencySymbol}{dailyForecast.forecast}</b>
                    <span title="This is an estimate of your total spending by the end of the month, based on your daily spending so far." className="ml-1 text-slate-400 cursor-help">&#9432;</span>
                  </span>
                  {typeof dailyForecast.message === 'string' && (
                    <div className="text-xs text-yellow-300 mt-1">{dailyForecast.message}</div>
                  )}
                </div>
              )}
                    {/* Forecast Line Chart for current month */}
                    <div className="bg-[#181A1F] p-6 rounded-2xl border border-[#23262b] flex items-center justify-center shadow-md mt-6">
                      <div className="w-full h-[200px] flex items-center justify-center">
                        {dailyForecast && (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={dailyForecast.cumulative?.map((val, idx) => ({ day: idx + 1, spent: val }))}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#23262b" />
                              <XAxis dataKey="day" stroke="#A1A1AA" fontSize={12} />
                              <YAxis stroke="#A1A1AA" fontSize={12} />
                              <Tooltip formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Spent']} />
                              <Line type="monotone" dataKey="spent" stroke="#6366F1" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        </div>

        <div className="bg-[#181A1F] p-6 rounded-2xl border border-[#23262b] flex flex-col items-center justify-center shadow-md">
          <div className="w-full mb-2">
            <h4 className="text-lg font-semibold text-[#E5E7EB] text-center">Budget Chart</h4>
          </div>
           <div className="w-full h-[300px] flex items-center justify-center">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '12px', 
                      border: '1px solid #334155',
                      color: '#f1f5f9' 
                    }}
                    itemStyle={{ color: '#f1f5f9' }}
                    formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, 'Amount']}
                  />
                  <Legend 
                     layout="vertical" 
                     verticalAlign="middle" 
                     align="right"
                     iconType="circle"
                     wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No expense data available</p>
            )}
           </div>
        </div>
      </div>

      {/* Top: Horizontally scrollable categories */}
      <div>
        <h3 className="text-lg font-bold text-[#E5E7EB] mb-4">Categories</h3>
        {categories.length === 0 ? (
          <div className="w-full bg-yellow-900/10 border border-yellow-700/30 text-yellow-300 rounded-xl p-6 text-center mb-4">
            Add categories to add your expenses. Having categories will allow you to organize and add expenses.
          </div>
        ) : (
          <div className="w-full pb-4 overflow-x-auto custom-scrollbar">
            <div className="flex gap-4 min-w-max">
              {sortedCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="w-52 h-28 bg-[#181A1F] rounded-2xl p-5 shadow-md border border-[#23262b] flex flex-col justify-between hover:border-[#3B3B3B] transition-all group relative overflow-hidden"
                >
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <div className="ml-2">
                    <p className="text-[#A1A1AA] text-sm font-medium">{cat.name}</p>
                    <p className="text-[#E5E7EB] text-xl font-bold mt-1">{currencySymbol}{cat.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="w-full bg-[#23262b] rounded-full h-1.5 mt-2 ml-2 max-w-[80%]">
                    <div 
                      className="h-full rounded-full opacity-80"
                      style={{ 
                        width: `${Math.min((cat.totalSpent / totalBalance) * 100 || 0, 100)}%`,
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom: Expenses Table */}
      <div className="bg-[#181A1F] p-6 rounded-2xl shadow-md border border-[#23262b] flex flex-col min-h-[400px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-[#E5E7EB]">Recent Transactions</h3>
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="relative flex-1 md:flex-none">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-48 pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            {/* Table view toggle */}
            <button
              onClick={() => setTableView(v => v === 'paginated' ? 'byDay' : 'paginated')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              title={tableView === 'paginated' ? 'Switch to Day View' : 'Switch to Paginated View'}
            >
              {tableView === 'paginated' ? 'View by Day' : 'Paginated View'}
            </button>
            <button 
              onClick={() => onNavigate(Page.ADD_EXPENSE)}
              disabled={categories.length === 0}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap flex items-center gap-2 ${categories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={categories.length === 0 ? 'Add a category first' : ''}
            >
              <ArrowUpRight size={16} /> Add New
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {tableView === 'paginated' ? (
            <>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Date</th>
                    <th className="py-3 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Category</th>
                    <th className="py-3 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Description</th>
                    <th className="py-3 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23262b]">
                  {pagedExpenses.length > 0 ? (
                    pagedExpenses.map((expense) => {
                      let dateStr = '';
                      if (typeof expense.date === 'string') {
                        dateStr = expense.date;
                      } else if (expense.date && typeof expense.date === 'object' && ('seconds' in expense.date)) {
                        const d = new Date(expense.date.seconds * 1000);
                        dateStr = d.toISOString().split('T')[0];
                      } else {
                        dateStr = '';
                      }
                      const categoryObj = categories.find(c => c.name === expense.category);
                      const categoryColor = categoryObj?.color || '#94a3b8';
                      const categoryName = categoryObj?.name || '[Deleted]';
                      return (
                        <tr key={expense.id} className="hover:bg-[#23262b]/50 transition-colors group">
                          <td className="py-4 text-sm text-[#A1A1AA] font-medium">{dateStr}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
                              <span className="text-sm text-[#E5E7EB]">{categoryName}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-[#A1A1AA]">{expense.description || ''}</td>
                          <td className="py-4 text-sm font-bold text-[#E5E7EB] text-right">
                            {currencySymbol}{expense.amount.toFixed(2)}
                            <button
                              onClick={() => onDeleteExpense(expense.id)}
                              className="ml-4 text-[#A1A1AA] hover:text-red-400 transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-[#A1A1AA] text-sm">
                        No transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-2 mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className={`px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-medium ${page === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                  >Previous</button>
                  <span className="text-xs text-slate-400">Page {page + 1} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className={`px-3 py-1 rounded bg-slate-800 text-slate-200 text-xs font-medium ${page === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                  >Next</button>
                </div>
              )}
            </>
          ) : (
            <>
              {sortedDays.length === 0 ? (
                <div className="py-8 text-center text-[#A1A1AA] text-sm">No transactions found.</div>
              ) : (
                <div className="space-y-8">
                  {sortedDays.map(day => (
                    <div key={day} className="border-b border-slate-700 pb-4">
                      <div className="font-semibold text-indigo-300 mb-2">{day}</div>
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-800">
                            <th className="py-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Category</th>
                            <th className="py-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Description</th>
                            <th className="py-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#23262b]">
                          {expensesByDay[day].map(expense => {
                            const categoryObj = categories.find(c => c.name === expense.category);
                            const categoryColor = categoryObj?.color || '#94a3b8';
                            const categoryName = categoryObj?.name || '[Deleted]';
                            return (
                              <tr key={expense.id} className="hover:bg-[#23262b]/50 transition-colors group">
                                <td className="py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColor }} />
                                    <span className="text-sm text-[#E5E7EB]">{categoryName}</span>
                                  </div>
                                </td>
                                <td className="py-3 text-sm text-[#A1A1AA]">{expense.description || ''}</td>
                                <td className="py-3 text-sm font-bold text-[#E5E7EB] text-right">
                                  {currencySymbol}{expense.amount.toFixed(2)}
                                  <button
                                    onClick={() => onDeleteExpense(expense.id)}
                                    className="ml-4 text-[#A1A1AA] hover:text-red-400 transition-colors"
                                    title="Delete Expense"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;