import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react';

const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState(null);

  const fetchInsights = async (queryType) => {
    setLoading(true);
    setActiveQuery(queryType);
    try {
      const response = await axios.post(`${API}/ai/insights`, { query_type: queryType });
      setInsights(response.data);
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const queryTypes = [
    {
      type: 'overview',
      title: 'Financial Overview',
      description: 'Get a summary of your spending patterns',
      icon: TrendingUp,
      color: 'bg-primary',
      testId: 'overview-query-button'
    },
    {
      type: 'budget_alert',
      title: 'Budget Alerts',
      description: 'Check for overspending warnings',
      icon: AlertCircle,
      color: 'bg-destructive',
      testId: 'budget-alert-query-button'
    },
    {
      type: 'prediction',
      title: 'Spending Predictions',
      description: 'Forecast future spending trends',
      icon: Target,
      color: 'bg-accent',
      testId: 'prediction-query-button'
    },
    {
      type: 'recommendation',
      title: 'Smart Recommendations',
      description: 'Get personalized savings tips',
      icon: Lightbulb,
      color: 'bg-accent',
      testId: 'recommendation-query-button'
    }
  ];

  return (
    <div className="p-6 md:p-12" data-testid="ai-insights-page">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Insights</h1>
        </div>
        <p className="text-muted-foreground text-lg">Powered by advanced AI to help you make better financial decisions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {queryTypes.map((query) => (
          <Card
            key={query.type}
            className="border border-border shadow-sm cursor-pointer transition-all hover:shadow-md hover:-translate-y-1"
            onClick={() => fetchInsights(query.type)}
            data-testid={query.testId}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg ${query.color} flex items-center justify-center flex-shrink-0`}>
                  <query.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{query.title}</h3>
                  <p className="text-sm text-muted-foreground">{query.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <Card className="border border-orange-100/50 bg-gradient-to-br from-stone-50 to-stone-100 shadow-sm" data-testid="loading-insights">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Analyzing your financial data...</p>
          </CardContent>
        </Card>
      )}

      {!loading && insights && (
        <Card className="border border-orange-100/50 bg-gradient-to-br from-stone-50 to-stone-100 shadow-sm relative overflow-hidden" data-testid="insights-result">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                AI Generated
              </div>
            </div>
            <CardTitle className="text-2xl">Analysis Results</CardTitle>
            <CardDescription>Based on your current spending patterns</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="prose prose-stone max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-line">{insights.insight}</p>
            </div>

            {insights.data && Object.keys(insights.data).length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold mb-3">Quick Stats</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {insights.data.total_spent !== undefined && (
                    <div className="p-4 rounded-lg bg-white border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                      <p className="text-2xl font-bold">${insights.data.total_spent.toFixed(2)}</p>
                    </div>
                  )}
                  {insights.data.category_spending && Object.keys(insights.data.category_spending).length > 0 && (
                    <div className="p-4 rounded-lg bg-white border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Top Category</p>
                      <p className="text-2xl font-bold">
                        {Object.entries(insights.data.category_spending).sort((a, b) => b[1] - a[1])[0][0]}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => fetchInsights(activeQuery)}
                data-testid="refresh-insights-button"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !insights && (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Get AI-Powered Insights</h3>
            <p className="text-muted-foreground">Select a query type above to analyze your financial data and receive personalized recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsightsPage;