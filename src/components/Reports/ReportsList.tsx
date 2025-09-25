import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Calendar,
  FileText,
  Printer
} from 'lucide-react';
import { format, subDays, isAfter, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

export function ReportsList() {
  const { state } = useApp();
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getDateRange = () => {
    const today = new Date();
    
    switch (period) {
      case 'today':
        return {
          start: today,
          end: today
        };
      case 'week':
        return {
          start: subDays(today, 7),
          end: today
        };
      case 'month':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
      case 'custom':
        return {
          start: startDate ? new Date(startDate) : subDays(today, 30),
          end: endDate ? new Date(endDate) : today
        };
      default:
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
    }
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  // Filter data by date range
  const filteredSales = state.sales.filter(sale => {
    const saleDate = new Date(sale.createdAt);
    return isAfter(saleDate, subDays(dateStart, 1)) && isBefore(saleDate, new Date(dateEnd.getTime() + 86400000));
  });

  const filteredServices = state.serviceOrders.filter(service => {
    const serviceDate = new Date(service.createdAt);
    return isAfter(serviceDate, subDays(dateStart, 1)) && isBefore(serviceDate, new Date(dateEnd.getTime() + 86400000));
  });

  // Calculate metrics
  const salesMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const paymentMethods = filteredSales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, totalSales, averageTicket, paymentMethods };
  }, [filteredSales]);

  const serviceMetrics = useMemo(() => {
    const statusCount = filteredServices.reduce((acc, service) => {
      acc[service.status] = (acc[service.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalServiceRevenue = filteredServices
      .filter(s => s.finalCost)
      .reduce((sum, service) => sum + (service.finalCost || 0), 0);

    return { statusCount, totalServiceRevenue };
  }, [filteredServices]);

  const topProducts = useMemo(() => {
    const productSales = filteredSales.reduce((acc, sale) => {
      sale.items.forEach(item => {
        const key = item.productId;
        if (!acc[key]) {
          acc[key] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        acc[key].quantity += item.quantity;
        acc[key].revenue += item.total;
      });
      return acc;
    }, {} as Record<string, { name: string; quantity: number; revenue: number }>);

    return Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  }, [filteredSales]);

  const lowStockProducts = state.products.filter(p => p.stock <= p.minStock);

  const topCustomers = useMemo(() => {
    const customerSales = filteredSales.reduce((acc, sale) => {
      if (sale.customerId && sale.customerName) {
        if (!acc[sale.customerId]) {
          acc[sale.customerId] = {
            name: sale.customerName,
            sales: 0,
            revenue: 0
          };
        }
        acc[sale.customerId].sales += 1;
        acc[sale.customerId].revenue += sale.total;
      }
      return acc;
    }, {} as Record<string, { name: string; sales: number; revenue: number }>);

    return Object.entries(customerSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  const generateReport = () => {
    const periodLabel = {
      today: 'Hoje',
      week: 'Última Semana',
      month: 'Este Mês',
      custom: `${format(dateStart, 'dd/MM/yyyy')} - ${format(dateEnd, 'dd/MM/yyyy')}`
    }[period];

    let report = `=== RELATÓRIO GERENCIAL ===\n`;
    report += `Período: ${periodLabel}\n`;
    report += `Data: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\n`;

    report += `=== VENDAS ===\n`;
    report += `Total de Vendas: ${salesMetrics.totalSales}\n`;
    report += `Faturamento: R$ ${salesMetrics.totalRevenue.toFixed(2)}\n`;
    report += `Ticket Médio: R$ ${salesMetrics.averageTicket.toFixed(2)}\n\n`;

    report += `=== SERVIÇOS ===\n`;
    report += `Total de Serviços: ${filteredServices.length}\n`;
    report += `Faturamento Serviços: R$ ${serviceMetrics.totalServiceRevenue.toFixed(2)}\n`;
    Object.entries(serviceMetrics.statusCount).forEach(([status, count]) => {
      const statusLabels = {
        analyzing: 'Em Análise',
        repairing: 'Em Reparo',
        completed: 'Finalizados',
        delivered: 'Entregues'
      };
      report += `${statusLabels[status as keyof typeof statusLabels]}: ${count}\n`;
    });
    report += `\n`;

    if (topProducts.length > 0) {
      report += `=== TOP PRODUTOS ===\n`;
      topProducts.slice(0, 5).forEach((product, index) => {
        report += `${index + 1}. ${product.name}\n`;
        report += `   Vendidos: ${product.quantity} | Receita: R$ ${product.revenue.toFixed(2)}\n`;
      });
      report += `\n`;
    }

    if (lowStockProducts.length > 0) {
      report += `=== ESTOQUE BAIXO ===\n`;
      lowStockProducts.forEach(product => {
        report += `- ${product.name}: ${product.stock} (mín: ${product.minStock})\n`;
      });
      report += `\n`;
    }

    report += `=== RESUMO GERAL ===\n`;
    report += `Faturamento Total: R$ ${(salesMetrics.totalRevenue + serviceMetrics.totalServiceRevenue).toFixed(2)}\n`;
    report += `Produtos em Estoque Baixo: ${lowStockProducts.length}\n`;
    report += `Total de Clientes Ativos: ${topCustomers.length}\n`;

    return report;
  };

  const printReport = () => {
    const reportText = generateReport();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório Gerencial</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${reportText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const paymentMethodLabels = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    transfer: 'Transferência'
  };

  const statusLabels = {
    analyzing: 'Em Análise',
    repairing: 'Em Reparo',
    completed: 'Finalizados',
    delivered: 'Entregues'
  };

  const statusColors = {
    analyzing: 'destructive' as const,
    repairing: 'default' as const,
    completed: 'secondary' as const,
    delivered: 'outline' as const
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa do desempenho do negócio
          </p>
        </div>
        <Button onClick={printReport} className="gap-2">
          <Printer className="h-4 w-4" />
          Imprimir Relatório
        </Button>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Select value={period} onValueChange={(value: ReportPeriod) => setPeriod(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {period === 'custom' && (
              <>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Data inicial"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Data final"
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(salesMetrics.totalRevenue + serviceMetrics.totalServiceRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Vendas + Serviços
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesMetrics.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              Ticket médio: R$ {salesMetrics.averageTicket.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredServices.length}</div>
            <p className="text-xs text-muted-foreground">
              Receita: R$ {serviceMetrics.totalServiceRevenue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma venda no período
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.quantity} vendidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Status dos Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(serviceMetrics.statusCount).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum serviço no período
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(serviceMetrics.statusCount).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={statusColors[status as keyof typeof statusColors]}>
                        {statusLabels[status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(salesMetrics.paymentMethods).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma venda no período
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(salesMetrics.paymentMethods).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {paymentMethodLabels[method as keyof typeof paymentMethodLabels]}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{count} vendas</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Melhores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCustomers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum cliente com compras no período
              </p>
            ) : (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {customer.sales} compras
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {customer.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alerta: Produtos com Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-center">Estoque Atual</TableHead>
                  <TableHead className="text-center">Estoque Mínimo</TableHead>
                  <TableHead>Fornecedor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="destructive">{product.stock}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{product.minStock}</TableCell>
                    <TableCell>{product.supplier || 'Não informado'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}