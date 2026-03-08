import React, { useState, useEffect} from 'react'; 
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

 useEffect(() => {
  const fetchMonthExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await axios.get(
        `${API}/expenses/calendar/${year}/${month}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchMonthExpenses();
}, [currentDate]); // ✅ ZERO WARNINGS - currentDate is ONLY dependency


  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

const getExpensesForDate = (day) => {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return expenses.filter(exp => exp.date === dateStr);
};

  const getTotalForDate = (day) => {
    const dayExpenses = getExpensesForDate(day);
    return dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const selectDate = (day) => {
    setSelectedDate(day);
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const selectedDayExpenses = selectedDate ? getExpensesForDate(selectedDate) : [];

  return (
    <div className="p-6 md:p-12" data-testid="calendar-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Calendar</h1>
        <p className="text-muted-foreground text-lg">View expenses by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border shadow-sm" data-testid="calendar-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth} data-testid="previous-month-button">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} data-testid="next-month-button">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {DAYS.map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: firstDay }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const total = getTotalForDate(day);
                    const hasExpenses = total > 0;
                    const isSelected = selectedDate === day;
                    const isToday = 
                      day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() && 
                      currentDate.getFullYear() === new Date().getFullYear();

                    return (
                      <button
                        key={day}
                        onClick={() => selectDate(day)}
                        data-testid={`calendar-day-${day}`}
                        className={`aspect-square p-2 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : isToday
                            ? 'border-accent bg-accent/10'
                            : hasExpenses
                            ? 'border-border bg-secondary hover:bg-secondary/80'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="text-sm font-medium">{day}</div>
                        {hasExpenses && (
                          <div className={`text-xs mt-1 ${
                            isSelected ? 'text-primary-foreground' : 'text-accent'
                          }`}>
                            ${total.toFixed(0)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm" data-testid="selected-date-expenses">
          <CardHeader>
            <CardTitle className="text-2xl">
              {selectedDate ? `${MONTHS[currentDate.getMonth()]} ${selectedDate}` : 'Select a Date'}
            </CardTitle>
            <CardDescription>
              {selectedDate && selectedDayExpenses.length > 0
                ? `${selectedDayExpenses.length} expense${selectedDayExpenses.length > 1 ? 's' : ''}`
                : 'Click on a date to view expenses'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDayExpenses.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayExpenses.map((expense) => (
                    <div key={expense.id} className="p-3 rounded-lg bg-muted border border-border" data-testid="expense-item">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-sm">{expense.description}</p>
                        <p className="font-bold text-sm">${expense.amount.toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-border mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total</span>
                      <span className="text-lg font-bold">
                        ${selectedDayExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No expenses on this date</p>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select a date from the calendar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;