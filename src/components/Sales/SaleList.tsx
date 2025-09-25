import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sale } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SaleForm } from './SaleForm';
import { Plus, Search, Receipt, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const paymentMethodLabels = {
  cash: 'Dinheiro',
  pix: 'PIX',
  card: 'Cartão',
  transfer: 'Transferência'
};

const paymentMethodColors = {
  cash: 'default',
  pix: 'secondary',
  card: 'outline',
  transfer: 'destructive'
} as const;

export function SaleList() {
  const { state } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = state.sales.filter(sale =>
    sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.items.some(item => 
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalSales = state.sales.reduce((sum, sale) => sum + sale.total, 0);

  const handleViewReceipt = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const generateReceiptText = (sale: Sale) => {
    const date = format(new Date(sale.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    let receipt = `=== RECIBO DE VENDA ===\n\n`;
    receipt += `Data: ${date}\n`;
    if (sale.customerName) {
      receipt += `Cliente: ${sale.customerName}\n`;
    }
    receipt += `Pagamento: ${paymentMethodLabels[sale.paymentMethod]}\n\n`;
    receipt += `=== ITENS ===\n`;
    
    sale.items.forEach(item => {
      receipt += `${item.productName}\n`;
      receipt += `  Qtd: ${item.quantity} x R$ ${item.unitPrice.toFixed(2)}\n`;
      receipt += `  Total: R$ ${item.total.toFixed(2)}\n\n`;
    });
    
    receipt += `==================\n`;
    receipt += `TOTAL: R$ ${sale.total.toFixed(2)}\n`;
    receipt += `==================\n\n`;
    receipt += `Obrigado pela preferência!`;
    
    return receipt;
  };

  const printReceipt = () => {
    if (!selectedSale) return;
    
    const receiptText = generateReceiptText(selectedSale);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recibo - Venda ${selectedSale.id.slice(-6)}</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <pre>${receiptText}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (showForm) {
    return <SaleForm onClose={() => setShowForm(false)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas vendas e emita recibos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Venda
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.sales.filter(sale => {
                const today = new Date().toDateString();
                return new Date(sale.createdAt).toDateString() === today;
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.sales.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhuma venda encontrada' : 'Nenhuma venda realizada ainda'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {sale.customerName || 'Cliente não informado'}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {sale.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                          {sale.items.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{sale.items.length - 2} item(s)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentMethodColors[sale.paymentMethod]}>
                          {paymentMethodLabels[sale.paymentMethod]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        R$ {sale.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewReceipt(sale)}
                          className="gap-2"
                        >
                          <Receipt className="h-4 w-4" />
                          Recibo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recibo de Venda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {generateReceiptText(selectedSale)}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button onClick={printReceipt} className="flex-1">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSale(null)}
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}