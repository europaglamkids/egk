import { useState } from 'react';
import { Package, DollarSign, TrendingUp, ShoppingCart, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAllProducts } from '@/hooks/useProducts';
import { useExpenses } from '@/hooks/useExpenses';
import { useSales } from '@/hooks/useSales';
import { useExchangeRate, useUpdateExchangeRate } from '@/hooks/useExchangeRate';

const AdminDashboard = () => {
  const { data: products } = useAllProducts();
  const { data: expenses } = useExpenses();
  const { data: sales } = useSales();
  const { rate, isLoading: rateLoading } = useExchangeRate();
  const updateRate = useUpdateExchangeRate();
  
  const [newRate, setNewRate] = useState<string>('');

  const totalProducts = products?.length ?? 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0;
  const profit = totalSales - totalExpenses;

  const handleUpdateRate = () => {
    const rateValue = parseFloat(newRate);
    if (!isNaN(rateValue) && rateValue > 0) {
      updateRate.mutate(rateValue);
      setNewRate('');
    }
  };

  const stats = [
    { title: 'Productos', value: totalProducts, icon: Package, color: 'text-primary' },
    { title: 'Ventas Totales', value: `$${totalSales.toFixed(2)}`, icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Gastos Totales', value: `$${totalExpenses.toFixed(2)}`, icon: DollarSign, color: 'text-orange-500' },
    { title: 'Ganancia', value: `$${profit.toFixed(2)}`, icon: TrendingUp, color: profit >= 0 ? 'text-green-500' : 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
      
      {/* Exchange Rate Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Tasa de Cambio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Tasa actual</p>
              <p className="text-3xl font-bold text-primary">
                {rateLoading ? '...' : `Bs. ${rate.toFixed(2)}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">por cada $1 USD</p>
            </div>
            <div className="flex gap-2 items-end w-full sm:w-auto">
              <div className="flex-1 sm:flex-none">
                <Label htmlFor="newRate" className="text-xs">Nueva tasa (Bs/$)</Label>
                <Input
                  id="newRate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={rate.toString()}
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="w-full sm:w-32"
                />
              </div>
              <Button 
                onClick={handleUpdateRate} 
                disabled={updateRate.isPending || !newRate}
                size="sm"
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", updateRate.isPending && "animate-spin")} />
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default AdminDashboard;
