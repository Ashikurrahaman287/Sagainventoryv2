import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface StockReport {
  category: string;
  products: number;
  value: number;
  status: 'healthy' | 'low';
}

interface SalesReport {
  transactions: number;
  revenue: number;
  profit: number;
}

interface CustomerReport {
  name: string;
  purchases: number;
  spent: number;
}

function ProfitCards() {
  const { data: todayData, isLoading: loadingToday } = useQuery<SalesReport>({
    queryKey: ["/api/reports/sales", "today"],
    queryFn: async () => {
      const response = await fetch(`/api/reports/sales?period=today`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      return response.json();
    },
  });

  const { data: weekData, isLoading: loadingWeek } = useQuery<SalesReport>({
    queryKey: ["/api/reports/sales", "week"],
    queryFn: async () => {
      const response = await fetch(`/api/reports/sales?period=week`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      return response.json();
    },
  });

  const { data: monthData, isLoading: loadingMonth } = useQuery<SalesReport>({
    queryKey: ["/api/reports/sales", "month"],
    queryFn: async () => {
      const response = await fetch(`/api/reports/sales?period=month`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      return response.json();
    },
  });

  const profitData = [
    { label: "Today's Profit", value: "today", data: todayData, isLoading: loadingToday },
    { label: "Weekly Profit", value: "week", data: weekData, isLoading: loadingWeek },
    { label: "Monthly Profit", value: "month", data: monthData, isLoading: loadingMonth },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {profitData.map((period) => (
        <Card key={period.value}>
          <CardHeader>
            <CardTitle className="text-base">{period.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {period.isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : period.data ? (
              <>
                <div className="text-3xl font-bold font-mono text-success" data-testid={`profit-${period.value}`}>
                  ${period.data.profit.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  From {period.data.transactions} transactions
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState("today");

  const { data: stockData, isLoading: isLoadingStock } = useQuery<StockReport[]>({
    queryKey: ["/api/reports/stock"],
  });

  const { data: salesData, isLoading: isLoadingSales } = useQuery<SalesReport>({
    queryKey: ["/api/reports/sales", period],
    queryFn: async () => {
      const response = await fetch(`/api/reports/sales?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch sales data");
      return response.json();
    },
  });

  const { data: topCustomers, isLoading: isLoadingCustomers } = useQuery<CustomerReport[]>({
    queryKey: ["/api/reports/customers"],
  });

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your business
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40" data-testid="select-period">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock" data-testid="tab-stock">
            Stock Report
          </TabsTrigger>
          <TabsTrigger value="sales" data-testid="tab-sales">
            Sales Report
          </TabsTrigger>
          <TabsTrigger value="profit" data-testid="tab-profit">
            Profit Report
          </TabsTrigger>
          <TabsTrigger value="customers" data-testid="tab-customers">
            Customer Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Overview by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingStock ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : stockData && stockData.length > 0 ? (
                <div className="space-y-4">
                  {stockData.map((item: any) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between p-4 rounded-md border"
                      data-testid={`stock-category-${item.category}`}
                    >
                      <div>
                        <div className="font-semibold">{item.category}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.products} products
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold" data-testid={`stock-value-${item.category}`}>
                          ${item.value.toFixed(2)}
                        </div>
                        <div
                          className={`text-sm ${
                            item.status === "healthy"
                              ? "text-success"
                              : "text-warning"
                          }`}
                        >
                          {item.status === "healthy" ? "Healthy" : "Low Stock"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No stock data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSales ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : salesData ? (
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-between p-4 rounded-md border"
                    data-testid="sales-summary"
                  >
                    <div>
                      <div className="font-semibold">
                        {periods.find(p => p.value === period)?.label}
                      </div>
                      <div className="text-sm text-muted-foreground" data-testid="text-transactions">
                        {salesData.transactions} transactions
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-mono font-semibold" data-testid="text-revenue">
                        ${salesData.revenue.toFixed(2)}
                      </div>
                      <div className="text-sm text-success" data-testid="text-profit">
                        Profit: ${salesData.profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit" className="space-y-6">
          <ProfitCards />
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers by Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCustomers ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topCustomers && topCustomers.length > 0 ? (
                <div className="space-y-4">
                  {topCustomers.map((customer: any, index: number) => (
                    <div
                      key={customer.name}
                      className="flex items-center justify-between p-4 rounded-md border"
                      data-testid={`customer-${index}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold" data-testid={`customer-name-${index}`}>{customer.name}</div>
                          <div className="text-sm text-muted-foreground" data-testid={`customer-purchases-${index}`}>
                            {customer.purchases} purchases
                          </div>
                        </div>
                      </div>
                      <div className="font-mono font-semibold" data-testid={`customer-spent-${index}`}>
                        ${customer.spent.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No customer data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
