import React from 'react';
import { StatsCard } from './StatsCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/context/AppContext';
import { 
  Users, 
  Wrench, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { state } = useApp();
  
  const today = new Date().toDateString();
  const todayServices = state.serviceOrders.filter(
    order => new Date(order.createdAt).toDateString() === today
  );
  
  const todaySales = state.sales.filter(
    sale => new Date(sale.createdAt).toDateString() === today
  );
  
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  
  const pendingServices = state.serviceOrders.filter(
    order => order.status === 'analyzing' || order.status === 'repairing'
  );
  
  const lowStockProducts = state.products.filter(
    product => product.stock <= product.minStock
  );
  
  const recentOrders = state.serviceOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'analyzing': return 'secondary';
      case 'repairing': return 'default';
      case 'completed': return 'default';
      case 'delivered': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'analyzing': return 'Em Análise';
      case 'repairing': return 'Em Reparo';
      case 'completed': return 'Finalizado';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio - {format(new Date(), 'PPP', { locale: ptBR })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Clientes Cadastrados"
          value={state.customers.length}
          icon={Users}
          variant="success"
        />
        
        <StatsCard
          title="Serviços Pendentes"
          value={pendingServices.length}
          icon={Clock}
          variant="warning"
        />
        
        <StatsCard
          title="Vendas Hoje"
          value={todayServices.length}
          icon={Wrench}
          variant="default"
        />
        
        <StatsCard
          title="Faturamento Hoje"
          value={`R$ ${todayRevenue.toFixed(2)}`}
          icon={DollarSign}
          variant="success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Ordens de Serviço Recentes
          </h3>
          
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma ordem de serviço encontrada
              </p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted-foreground">{order.device} - {order.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Estoque Baixo
            </h3>
            
            <div className="space-y-2">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Todos os produtos com estoque adequado
                </p>
              ) : (
                lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                    <Badge variant="destructive">
                      {product.stock} un.
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Resumo do Dia
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Novos serviços</span>
                <span className="font-medium">{todayServices.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vendas realizadas</span>
                <span className="font-medium">{todaySales.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Faturamento</span>
                <span className="font-medium text-success">R$ {todayRevenue.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}