import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useApp } from '@/context/AppContext';
import { ServiceOrder } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const serviceOrderSchema = z.object({
  customerId: z.string().min(1, 'Selecione um cliente'),
  device: z.string().min(1, 'Informe o aparelho').max(100, 'Máximo 100 caracteres'),
  issue: z.string().min(1, 'Descreva o problema').max(500, 'Máximo 500 caracteres'),
  status: z.enum(['analyzing', 'repairing', 'completed', 'delivered']),
  estimatedCost: z.string().optional(),
  finalCost: z.string().optional(),
  notes: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
});

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>;

interface ServiceOrderFormProps {
  order?: ServiceOrder | null;
  onClose: () => void;
}

export function ServiceOrderForm({ order, onClose }: ServiceOrderFormProps) {
  const { state, dispatch } = useApp();
  const { toast } = useToast();

  const form = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
    defaultValues: {
      customerId: order?.customerId || '',
      device: order?.device || '',
      issue: order?.issue || '',
      status: order?.status || 'analyzing',
      estimatedCost: order?.estimatedCost?.toString() || '',
      finalCost: order?.finalCost?.toString() || '',
      notes: order?.notes || '',
    },
  });

  const onSubmit = (data: ServiceOrderFormData) => {
    const customer = state.customers.find(c => c.id === data.customerId);
    if (!customer) return;

    const serviceOrderData: ServiceOrder = {
      id: order?.id || crypto.randomUUID(),
      customerId: data.customerId,
      customerName: customer.name,
      device: data.device.trim(),
      issue: data.issue.trim(),
      status: data.status,
      estimatedCost: data.estimatedCost ? parseFloat(data.estimatedCost) : undefined,
      finalCost: data.finalCost ? parseFloat(data.finalCost) : undefined,
      createdAt: order?.createdAt || new Date().toISOString(),
      completedAt: data.status === 'completed' && !order?.completedAt 
        ? new Date().toISOString() 
        : order?.completedAt,
      notes: data.notes?.trim() || undefined,
    };

    if (order) {
      dispatch({ type: 'UPDATE_SERVICE_ORDER', payload: serviceOrderData });
      toast({
        title: 'Ordem atualizada',
        description: 'Ordem de serviço atualizada com sucesso',
      });
    } else {
      dispatch({ type: 'ADD_SERVICE_ORDER', payload: serviceOrderData });
      toast({
        title: 'Ordem criada',
        description: 'Nova ordem de serviço criada com sucesso',
      });
    }

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
            {order ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {order ? 'Atualize as informações da ordem' : 'Registre uma nova ordem de serviço'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Ordem</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="analyzing">Em Análise</SelectItem>
                          <SelectItem value="repairing">Em Reparo</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="delivered">Entregue</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="device"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aparelho/Dispositivo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: iPhone 13, Notebook Dell..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problema Relatado *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o problema reportado pelo cliente..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="estimatedCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Estimado (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0,00"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="finalCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custo Final (R$)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="0,00"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Observações adicionais, peças utilizadas, etc..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  {order ? 'Atualizar Ordem' : 'Criar Ordem'}
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