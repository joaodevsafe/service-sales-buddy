import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ServiceOrderForm } from './ServiceOrderForm';
import { Plus, Search, Phone, Wrench, Clock, CheckCircle, Truck, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<ServiceOrder['status'], { label: string; variant: 'destructive' | 'default' | 'secondary' | 'outline'; icon: React.ComponentType<any> }> = {
  analyzing: { label: 'Em Análise', variant: 'destructive', icon: Clock },
  repairing: { label: 'Em Reparo', variant: 'default', icon: Wrench },
  completed: { label: 'Concluído', variant: 'secondary', icon: CheckCircle },
  delivered: { label: 'Entregue', variant: 'outline', icon: Truck }
};

export function ServiceOrderList() {
  const { state } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);

  const filteredOrders = state.serviceOrders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (order: ServiceOrder) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const generateOrderReport = (order: ServiceOrder) => {
    let report = `=== ORDEM DE SERVIÇO ===\n\n`;
    report += `Nº: ${order.id.slice(-6).toUpperCase()}\n`;
    report += `Data: ${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\n`;
    
    report += `=== CLIENTE ===\n`;
    report += `Nome: ${order.customerName}\n\n`;
    
    report += `=== EQUIPAMENTO ===\n`;
    report += `Aparelho: ${order.device}\n`;
    report += `Problema: ${order.issue}\n\n`;
    
    report += `=== STATUS ===\n`;
    report += `Status: ${statusConfig[order.status].label}\n`;
    
    if (order.estimatedCost) {
      report += `Orçamento: R$ ${order.estimatedCost.toFixed(2)}\n`;
    }
    
    if (order.finalCost) {
      report += `Valor Final: R$ ${order.finalCost.toFixed(2)}\n`;
    }
    
    if (order.completedAt) {
      report += `Concluído em: ${format(new Date(order.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
    }
    
    if (order.notes) {
      report += `\n=== OBSERVAÇÕES ===\n`;
      report += `${order.notes}\n`;
    }
    
    report += `\n==================\n`;
    report += `Obrigado pela confiança!`;
    
    return report;
  };

  const printOrder = (order: ServiceOrder) => {
    const reportText = generateOrderReport(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordem de Serviço - ${order.id.slice(-6).toUpperCase()}</title>
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

  if (showForm) {
    return (
      <ServiceOrderForm
        order={editingOrder}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as ordens de serviço e acompanhe o status dos reparos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Ordem
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, aparelho ou problema..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem de serviço'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm 
                ? 'Tente buscar com outros termos' 
                : 'Comece adicionando sua primeira ordem de serviço'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Ordem
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const StatusIcon = status.icon;
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{order.device}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {order.customerName}
                      </div>
                    </div>
                    <Badge variant={status.variant as any} className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Problema:</p>
                      <p className="text-sm text-muted-foreground">{order.issue}</p>
                    </div>
                    
                    {order.notes && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Observações:</p>
                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Criado: {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {order.estimatedCost && (
                          <span className="font-medium text-foreground">
                            Estimativa: R$ {order.estimatedCost.toFixed(2)}
                          </span>
                        )}
                        {order.finalCost && (
                          <span className="font-medium text-success">
                            Total: R$ {order.finalCost.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => printOrder(order)}
                          className="gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          Imprimir
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(order)}
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}