import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/context/AppContext';
import { Product, StockMovement } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const stockMovementSchema = z.object({
  type: z.enum(['in', 'out']),
  quantity: z.string().min(1, 'Quantidade é obrigatória'),
  reason: z.string().min(1, 'Motivo é obrigatório').max(200, 'Máximo 200 caracteres'),
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

interface StockMovementFormProps {
  product: Product;
  onClose: () => void;
}

export function StockMovementForm({ product, onClose }: StockMovementFormProps) {
  const { dispatch } = useApp();
  const { toast } = useToast();

  const form = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type: 'in',
      quantity: '',
      reason: '',
    },
  });

  const watchType = form.watch('type');

  const onSubmit = (data: StockMovementFormData) => {
    const quantity = parseInt(data.quantity);
    
    // Verificar se há estoque suficiente para saída
    if (data.type === 'out' && quantity > product.stock) {
      toast({
        title: 'Erro',
        description: 'Quantidade maior que o estoque disponível',
        variant: 'destructive',
      });
      return;
    }

    // Criar movimento de estoque
    const stockMovement: StockMovement = {
      id: crypto.randomUUID(),
      productId: product.id,
      type: data.type,
      quantity,
      reason: data.reason.trim(),
      createdAt: new Date().toISOString(),
    };

    // Atualizar produto com novo estoque
    const newStock = data.type === 'in' 
      ? product.stock + quantity 
      : product.stock - quantity;

    const updatedProduct: Product = {
      ...product,
      stock: newStock,
    };

    dispatch({ type: 'ADD_STOCK_MOVEMENT', payload: stockMovement });
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });

    toast({
      title: data.type === 'in' ? 'Entrada registrada' : 'Saída registrada',
      description: `Estoque atualizado para ${newStock} unidades`,
    });

    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Movimentação de Estoque
          </h1>
          <p className="text-muted-foreground mt-1">
            {product.name} - Estoque atual: {product.stock} unidades
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {watchType === 'in' ? (
              <>
                <TrendingUp className="h-5 w-5 text-success" />
                Entrada de Estoque
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-destructive" />
                Saída de Estoque
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="in">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            Entrada (Reposição)
                          </div>
                        </SelectItem>
                        <SelectItem value="out">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            Saída (Ajuste/Perda)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        max={watchType === 'out' ? product.stock : undefined}
                        placeholder="Digite a quantidade"
                        {...field} 
                      />
                    </FormControl>
                    {watchType === 'out' && (
                      <p className="text-sm text-muted-foreground">
                        Máximo disponível: {product.stock} unidades
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Movimentação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          watchType === 'in' 
                            ? "Ex: Reposição de estoque, compra de fornecedor..."
                            : "Ex: Produto danificado, ajuste de inventário..."
                        }
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.getValues('quantity') && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Resumo da Movimentação</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Estoque atual:</span>
                      <span className="font-medium">{product.stock} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {watchType === 'in' ? 'Entrada:' : 'Saída:'}
                      </span>
                      <span className={`font-medium ${
                        watchType === 'in' ? 'text-success' : 'text-destructive'
                      }`}>
                        {watchType === 'in' ? '+' : '-'}{form.getValues('quantity')} unidades
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Novo estoque:</span>
                      <span className="font-bold">
                        {watchType === 'in' 
                          ? product.stock + parseInt(form.getValues('quantity') || '0')
                          : product.stock - parseInt(form.getValues('quantity') || '0')
                        } unidades
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  {watchType === 'in' ? 'Registrar Entrada' : 'Registrar Saída'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}