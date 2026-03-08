import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Plus, Trash2, Target } from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Healthcare',
  'Entertainment', 'Shopping', 'Education', 'Personal Care', 'Travel',
  'Insurance', 'Savings', 'Investments', 'Gifts & Donations',
  'Bills & Subscriptions', 'Other'
];

const BudgetsPage = () => {
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [budgetsRes, statsRes] = await Promise.all([
        axios.get(`${API}/budgets`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setBudgets(budgetsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem('token');
    const budgetData = {
      category: formData.category,
      limit: parseFloat(formData.limit),
      period: formData.period  // ✅ SEND PERIOD
    };
    
    await axios.post(`${API}/budgets`, budgetData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    toast.success('Budget created successfully!');
    setIsDialogOpen(false);
    setFormData({ category: '', limit: '', period: 'monthly' });
    await fetchData();
  } catch (error) {
    console.error('Budget error:', error.response?.data);
    toast.error('Failed to create budget');
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/budgets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Budget deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits and track progress
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
              <DialogDescription>
                Set a spending limit per category
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) =>
                    setFormData({ ...formData, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Limit</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) =>
                    setFormData({ ...formData, limit: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Period</Label>
                <Select
                  value={formData.period}
                  onValueChange={(v) =>
                    setFormData({ ...formData, period: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Create Budget
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <Target className="mx-auto mb-4" />
              <p>No budgets yet</p>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const spent =
              stats?.category_spending?.[budget.category] || 0;
            const percentage = (spent / budget.limit) * 100;

            return (
              <Card key={budget.id}>
                <CardContent className="p-6 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {budget.period} budget
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ${spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                    </p>
                    <p className="text-sm">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(budget.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BudgetsPage;
