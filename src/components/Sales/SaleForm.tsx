import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/context/AppContext';
import { Sale, SaleItem, Product, Customer, StockMovement } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, ShoppingCart, User, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const saleSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.enum(['cash', 'pix', 'card', 'transfer'], {
    required_error: 'Método de pagamento é obrigatório'
  }),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SaleFormProps {
  onClose: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export function SaleForm({ onClose }: SaleFormProps) {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: '',
      customerName: '',
      paymentMethod: 'cash',
    },
  });

  const watchedCustomerId = form.watch('customerId');
  const selectedCustomer = state.customers.find(c => c.id === watchedCustomerId);

  // Update customer name when customer is selected
  React.useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customerName', selectedCustomer.name);
    } else if (!watchedCustomerId) {
      form.setValue('customerName', '');
    }
  }, [selectedCustomer, watchedCustomerId, form]);

  const availableProducts = state.products.filter(p => p.stock > 0);

  const addToCart = () => {
    if (!selectedProductId) {
      toast({
        title: 'Erro',
        description: 'Selecione um produto',
        variant: 'destructive',
      });
      return;
    }

    const product = state.products.find(p => p.id === selectedProductId);
    if (!product) return;

    if (quantity > product.stock) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${product.stock} unidades disponíveis`,
        variant: 'destructive',
      });
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    
    if (existingItemIndex >= 0) {
      const newQuantity = cart[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        toast({
          title: 'Estoque insuficiente',
          description: `Apenas ${product.stock} unidades disponíveis`,
          variant: 'destructive',
        });
        return;
      }

      const newCart = [...cart];
      newCart[existingItemIndex].quantity = newQuantity;
      setCart(newCart);
    } else {
      setCart([...cart, { product, quantity }]);
    }

    setSelectedProductId('');
    setQuantity(1);

    toast({
      title: 'Produto adicionado',
      description: `${product.name} adicionado ao carrinho`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast({
        title: 'Estoque insuficiente',
        description: `Apenas ${product.stock} unidades disponíveis`,
        variant: 'destructive',
      });
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const onSubmit = (data: SaleFormData) => {
    if (cart.length === 0) {
      toast({
        title: 'Carrinho vazio',
        description: 'Adicione pelo menos um produto ao carrinho',
        variant: 'destructive',
      });
      return;
    }

    const saleItems: SaleItem[] = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      total: item.product.price * item.quantity,
    }));

    const sale: Sale = {
      id: crypto.randomUUID(),
      customerId: data.customerId || undefined,
      customerName: data.customerName || undefined,
      items: saleItems,
      total: calculateTotal(),
      paymentMethod: data.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    // Add sale
    dispatch({ type: 'ADD_SALE', payload: sale });

    // Update stock and create stock movements for each item
    cart.forEach(item => {
      const updatedProduct = {
        ...item.product,
        stock: item.product.stock - item.quantity,
      };

      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });

      const stockMovement: StockMovement = {
        id: crypto.randomUUID(),
        productId: item.product.id,
        type: 'sale',
        quantity: -item.quantity,
        reason: `Venda #${sale.id.slice(-6)} - ${data.customerName || 'Cliente não informado'}`,
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: stockMovement });
    });

    toast({
      title: 'Venda realizada',
      description: `Venda de R$ ${sale.total.toFixed(2)} finalizada com sucesso`,
    });

    onClose();
  };

  const paymentMethodLabels = {
    cash: 'Dinheiro',
    pix: 'PIX',
    card: 'Cartão',
    transfer: 'Transferência'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Venda</h1>
          <p className="text-muted-foreground mt-1">
            Registre uma nova venda e gere o recibo
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer and Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Venda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sem cliente</SelectItem>
                          {state.customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!watchedCustomerId && (
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do cliente (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(paymentMethodLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Add Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Adicionar Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Produto</label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - R$ {product.price.toFixed(2)} (Est: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Quantidade</label>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <Button 
              onClick={addToCart} 
              disabled={!selectedProductId}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar ao Carrinho
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrinho de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Carrinho vazio</p>
              <p className="text-sm text-muted-foreground">Adicione produtos para começar a venda</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço Unit.</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell>R$ {item.product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {(item.product.price * item.quantity).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-lg font-medium">
                  Total: R$ {calculateTotal().toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Finalizar Venda
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}