import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Receipt, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Personal Care', 'Travel',
  'Insurance', 'Savings', 'Investments', 'Gifts & Donations', 'Bills & Subscriptions', 'Other'
];

const CHART_COLORS = ['#292524', '#EA580C', '#78716C', '#D6D3D1', '#A8A29E', '#F97316', '#C2410C', '#9A3412'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, expensesRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/expenses`)
      ]);
      setStats(statsRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categoryData = Object.entries(stats?.category_spending || {}).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }));

  const recentExpenses = expenses.slice(0, 5);

  const monthlyTrend = expenses.reduce((acc, exp) => {
    try {
      const date = new Date(exp.date);
      const monthKey = `${date.getMonth() + 1}/${date.getDate()}`;
      if (!acc[monthKey]) acc[monthKey] = 0;
      acc[monthKey] += exp.amount;
    } catch (e) {}
    return acc;
  }, {});

  const trendData = Object.entries(monthlyTrend).slice(-7).map(([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(2))
  }));

  return (
    <div className="p-6 md:p-12" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">Your financial overview at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-border shadow-sm transition-all hover:shadow-md" data-testid="total-spent-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats?.total_spent?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">All time expenses</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm transition-all hover:shadow-md" data-testid="monthly-total-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats?.monthly_total?.toFixed(2) || '0.00'}</div>
              <p className="text-xs text-muted-foreground mt-1">Current month spending</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm transition-all hover:shadow-md" data-testid="transaction-count-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Receipt className="w-5 h-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.transaction_count || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Total recorded</p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm transition-all hover:shadow-md" data-testid="budgets-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Budgets</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.budgets?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Budget limits set</p>
            </CardContent>
          </Card>
        </div>

        <Card className="col-span-12 md:col-span-8 border border-border shadow-sm" data-testid="spending-trend-chart">
          <CardHeader>
            <CardTitle className="text-2xl">Spending Trend</CardTitle>
            <CardDescription>Your expense patterns over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                  <XAxis dataKey="date" stroke="#78716C" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#78716C" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E7E5E4', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#EA580C" strokeWidth={2} dot={{ fill: '#EA580C' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No expense data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-4 border border-border shadow-sm" data-testid="recent-expenses-card">
          <CardHeader>
            <CardTitle className="text-2xl">Recent Expenses</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold">${expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No expenses yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6 border border-border shadow-sm" data-testid="category-breakdown-chart">
          <CardHeader>
            <CardTitle className="text-2xl">Category Breakdown</CardTitle>
            <CardDescription>Spending by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 md:col-span-6 border border-border shadow-sm" data-testid="budget-status-card">
          <CardHeader>
            <CardTitle className="text-2xl">Budget Status</CardTitle>
            <CardDescription>Your budget limits and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.budgets?.length > 0 ? (
                stats.budgets.map((budget) => {
                  const spent = stats.category_spending[budget.category] || 0;
                  const percentage = (spent / budget.limit) * 100;
                  const isOver = percentage > 100;

                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{budget.category}</span>
                        <span className={`text-sm font-semibold ${
                          isOver ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-destructive' : 'bg-accent'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No budgets set yet. Create one to track your spending limits.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;