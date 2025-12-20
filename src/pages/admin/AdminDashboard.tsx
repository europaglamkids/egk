import { Package, DollarSign, TrendingUp, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllProducts } from '@/hooks/useProducts';
import { useExpenses } from '@/hooks/useExpenses';
import { useSales } from '@/hooks/useSales';

const AdminDashboard = () => {
  const { data: products } = useAllProducts();
  const { data: expenses } = useExpenses();
  const { data: sales } = useSales();

  const totalProducts = products?.length ?? 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const totalSales = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) ?? 0;
  const profit = totalSales - totalExpenses;

  const stats = [
    { title: 'Productos', value: totalProducts, icon: Package, color: 'text-primary' },
    { title: 'Ventas Totales', value: `$${totalSales.toFixed(2)}`, icon: ShoppingCart, color: 'text-green-500' },
    { title: 'Gastos Totales', value: `$${totalExpenses.toFixed(2)}`, icon: DollarSign, color: 'text-orange-500' },
    { title: 'Ganancia', value: `$${profit.toFixed(2)}`, icon: TrendingUp, color: profit >= 0 ? 'text-green-500' : 'text-red-500' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Dashboard</h1>
      
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
