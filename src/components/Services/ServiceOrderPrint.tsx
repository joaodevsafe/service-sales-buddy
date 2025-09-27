import React from 'react';
import { ServiceOrder } from '@/types';
import { Logo } from '@/components/ui/logo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ServiceOrderPrintProps {
  order: ServiceOrder;
  companySettings?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    cnpj: string;
    logo: string;
  };
  systemSettings?: {
    defaultServiceWarranty: number;
  };
}

export function ServiceOrderPrint({ order, companySettings, systemSettings }: ServiceOrderPrintProps) {
  const statusLabels: Record<ServiceOrder['status'], string> = {
    analyzing: 'Em Análise',
    repairing: 'Em Reparo',
    completed: 'Concluído',
    delivered: 'Entregue'
  };

  return (
    <div className="print-container max-w-4xl mx-auto bg-white text-black p-8">
      {/* Header with Logo and Company Info */}
      <header className="border-b-2 border-primary pb-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {companySettings?.logo && companySettings.logo.startsWith('http') ? (
              <img 
                src={companySettings.logo} 
                alt="Logo"
                className="h-16 w-auto"
              />
            ) : (
              <Logo size="lg" />
            )}
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {companySettings?.name || 'JPSOLUTECH'}
            </h1>
            <div className="text-sm space-y-1">
              {companySettings?.address && (
                <p>{companySettings.address}</p>
              )}
              <div className="flex flex-col space-y-1">
                {companySettings?.phone && (
                  <p>Tel: {companySettings.phone}</p>
                )}
                {companySettings?.email && (
                  <p>Email: {companySettings.email}</p>
                )}
                {companySettings?.cnpj && (
                  <p>CNPJ: {companySettings.cnpj}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Service Order Number */}
      <div className="text-center mb-8">
        <div className="inline-block border-2 border-primary rounded-lg px-8 py-4">
          <h2 className="text-2xl font-bold text-primary">ORDEM DE SERVIÇO</h2>
          <p className="text-3xl font-bold mt-2">Nº {order.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Customer Information */}
        <section className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
            DADOS DO CLIENTE
          </h3>
          <div className="space-y-3">
            <div>
              <strong>Nome:</strong>
              <p className="mt-1">{order.customerName}</p>
            </div>
          </div>
        </section>

        {/* Service Information */}
        <section className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
            INFORMAÇÕES DO SERVIÇO
          </h3>
          <div className="space-y-3">
            <div>
              <strong>Data de Entrada:</strong>
              <p className="mt-1">
                {format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div>
              <strong>Status:</strong>
              <p className="mt-1 font-semibold">{statusLabels[order.status]}</p>
            </div>
            {order.completedAt && (
              <div>
                <strong>Data de Conclusão:</strong>
                <p className="mt-1">
                  {format(new Date(order.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Equipment Details */}
      <section className="border border-gray-300 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
          DETALHES DO EQUIPAMENTO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <strong>Aparelho:</strong>
            <p className="mt-1">{order.device}</p>
          </div>
          <div>
            <strong>Problema Relatado:</strong>
            <p className="mt-1">{order.issue}</p>
          </div>
        </div>
        {order.notes && (
          <div className="mt-4">
            <strong>Observações Técnicas:</strong>
            <p className="mt-1 whitespace-pre-wrap">{order.notes}</p>
          </div>
        )}
      </section>

      {/* Financial Information */}
      <section className="border border-gray-300 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
          INFORMAÇÕES FINANCEIRAS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {order.estimatedCost && (
            <div>
              <strong>Orçamento Estimado:</strong>
              <p className="mt-1 text-lg">R$ {order.estimatedCost.toFixed(2)}</p>
            </div>
          )}
          {order.finalCost && (
            <div>
              <strong>Valor Final:</strong>
              <p className="mt-1 text-lg font-bold text-green-600">
                R$ {order.finalCost.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Terms and Warranty */}
      <section className="border border-gray-300 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-bold mb-4 text-primary border-b pb-2">
          TERMOS E GARANTIA
        </h3>
        <div className="text-sm space-y-2">
          <p>
            <strong>Garantia:</strong> {systemSettings?.defaultServiceWarranty || 90} dias 
            para defeitos relacionados ao serviço executado.
          </p>
          <p>
            <strong>Condições:</strong> A garantia não cobre danos causados por mau uso, 
            quedas, líquidos ou problemas não relacionados ao reparo realizado.
          </p>
          <p>
            <strong>Retirada:</strong> O equipamento deve ser retirado em até 30 dias após 
            a conclusão do serviço, caso contrário será cobrada taxa de armazenamento.
          </p>
        </div>
      </section>

      {/* Signature Section */}
      <section className="border border-gray-300 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-6 text-primary border-b pb-2">
          ASSINATURA E RECEBIMENTO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="mb-4"><strong>Declaro ter recebido o equipamento em perfeito estado:</strong></p>
            <div className="border-b border-gray-400 pb-2 mb-2 h-12"></div>
            <p className="text-sm text-center">Assinatura do Cliente</p>
          </div>
          <div>
            <p className="mb-4"><strong>Data de Recebimento:</strong></p>
            <div className="border-b border-gray-400 pb-2 mb-2 h-12"></div>
            <p className="text-sm text-center">___/___/______</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center mt-8 pt-6 border-t-2 border-primary">
        <p className="text-lg font-semibold text-primary">
          Obrigado pela confiança!
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Este documento foi gerado automaticamente pelo sistema JPSOLUTECH
        </p>
      </footer>
    </div>
  );
}

// Função para imprimir a OS com layout profissional
export function printServiceOrder(
  order: ServiceOrder, 
  companySettings?: any, 
  systemSettings?: any
) {
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    const printContent = document.createElement('div');
    
    // Renderizar o componente em uma string HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Ordem de Serviço - ${order.id.slice(-6).toUpperCase()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333;
            }
            .print-container { max-width: 210mm; margin: 0 auto; padding: 20px; }
            .text-primary { color: #3b82f6; }
            .text-green-600 { color: #059669; }
            .font-bold { font-weight: bold; }
            .text-lg { font-size: 1.125rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-3xl { font-size: 1.875rem; }
            .border { border: 1px solid #d1d5db; }
            .border-2 { border: 2px solid; }
            .border-b { border-bottom: 1px solid #d1d5db; }
            .border-b-2 { border-bottom: 2px solid; }
            .border-t-2 { border-top: 2px solid; }
            .border-primary { border-color: #3b82f6; }
            .border-gray-300 { border-color: #d1d5db; }
            .border-gray-400 { border-color: #9ca3af; }
            .rounded-lg { border-radius: 0.5rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .p-8 { padding: 2rem; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .pt-6 { padding-top: 1.5rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .pb-6 { padding-bottom: 1.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-x-4 > * + * { margin-left: 1rem; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-sm { font-size: 0.875rem; }
            .inline-block { display: inline-block; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-6 { gap: 1.5rem; }
            .gap-8 { gap: 2rem; }
            .h-12 { height: 3rem; }
            .h-16 { height: 4rem; }
            .w-auto { width: auto; }
            .whitespace-pre-wrap { white-space: pre-wrap; }
            .text-gray-600 { color: #4b5563; }
            
            @media print {
              .print-container { margin: 0; padding: 10mm; }
              body { font-size: 12pt; }
              .text-3xl { font-size: 18pt; }
              .text-2xl { font-size: 16pt; }
              .text-lg { font-size: 14pt; }
            }
            
            @media (min-width: 768px) {
              .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- Header -->
            <header class="border-b-2 border-primary pb-6 mb-8">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <svg width="200" height="50" viewBox="0 0 200 50" class="h-16 w-auto">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#3b82f6" />
                        <stop offset="100%" stop-color="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <text x="10" y="32" fill="url(#logoGradient)" font-family="system-ui" font-size="24" font-weight="700">JP</text>
                    <text x="50" y="32" fill="#333" font-family="system-ui" font-size="18" font-weight="300" letter-spacing="1px">SOLUTECH</text>
                    <line x1="10" y1="38" x2="170" y2="38" stroke="url(#logoGradient)" stroke-width="2" opacity="0.6" />
                  </svg>
                </div>
                <div class="text-right">
                  <h1 class="text-3xl font-bold text-primary mb-2">${companySettings?.name || 'JPSOLUTECH'}</h1>
                  <div class="text-sm space-y-1">
                    ${companySettings?.address ? `<p>${companySettings.address}</p>` : ''}
                    ${companySettings?.phone ? `<p>Tel: ${companySettings.phone}</p>` : ''}
                    ${companySettings?.email ? `<p>Email: ${companySettings.email}</p>` : ''}
                    ${companySettings?.cnpj ? `<p>CNPJ: ${companySettings.cnpj}</p>` : ''}
                  </div>
                </div>
              </div>
            </header>

            <!-- OS Number -->
            <div class="text-center mb-8">
              <div class="inline-block border-2 border-primary rounded-lg px-8 py-4">
                <h2 class="text-2xl font-bold text-primary">ORDEM DE SERVIÇO</h2>
                <p class="text-3xl font-bold mt-2">Nº ${order.id.slice(-6).toUpperCase()}</p>
              </div>
            </div>

            <!-- Main Content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <!-- Customer Info -->
              <section class="border border-gray-300 rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4 text-primary border-b pb-2">DADOS DO CLIENTE</h3>
                <div class="space-y-3">
                  <div><strong>Nome:</strong><p class="mt-1">${order.customerName}</p></div>
                </div>
              </section>

              <!-- Service Info -->
              <section class="border border-gray-300 rounded-lg p-6">
                <h3 class="text-lg font-bold mb-4 text-primary border-b pb-2">INFORMAÇÕES DO SERVIÇO</h3>
                <div class="space-y-3">
                  <div><strong>Data de Entrada:</strong><p class="mt-1">${format(new Date(order.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p></div>
                  <div><strong>Status:</strong><p class="mt-1 font-bold">${statusLabels[order.status] || 'Em Análise'}</p></div>
                  ${order.completedAt ? `<div><strong>Data de Conclusão:</strong><p class="mt-1">${format(new Date(order.completedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p></div>` : ''}
                </div>
              </section>
            </div>

            <!-- Equipment Details -->
            <section class="border border-gray-300 rounded-lg p-6 mb-8">
              <h3 class="text-lg font-bold mb-4 text-primary border-b pb-2">DETALHES DO EQUIPAMENTO</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><strong>Aparelho:</strong><p class="mt-1">${order.device}</p></div>
                <div><strong>Problema Relatado:</strong><p class="mt-1">${order.issue}</p></div>
              </div>
              ${order.notes ? `<div class="mt-4"><strong>Observações Técnicas:</strong><p class="mt-1 whitespace-pre-wrap">${order.notes}</p></div>` : ''}
            </section>

            <!-- Financial Info -->
            <section class="border border-gray-300 rounded-lg p-6 mb-8">
              <h3 class="text-lg font-bold mb-4 text-primary border-b pb-2">INFORMAÇÕES FINANCEIRAS</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${order.estimatedCost ? `<div><strong>Orçamento Estimado:</strong><p class="mt-1 text-lg">R$ ${order.estimatedCost.toFixed(2)}</p></div>` : ''}
                ${order.finalCost ? `<div><strong>Valor Final:</strong><p class="mt-1 text-lg font-bold text-green-600">R$ ${order.finalCost.toFixed(2)}</p></div>` : ''}
              </div>
            </section>

            <!-- Terms -->
            <section class="border border-gray-300 rounded-lg p-6 mb-8">
              <h3 class="text-lg font-bold mb-4 text-primary border-b pb-2">TERMOS E GARANTIA</h3>
              <div class="text-sm space-y-2">
                <p><strong>Garantia:</strong> ${systemSettings?.defaultServiceWarranty || 90} dias para defeitos relacionados ao serviço executado.</p>
                <p><strong>Condições:</strong> A garantia não cobre danos causados por mau uso, quedas, líquidos ou problemas não relacionados ao reparo realizado.</p>
                <p><strong>Retirada:</strong> O equipamento deve ser retirado em até 30 dias após a conclusão do serviço, caso contrário será cobrada taxa de armazenamento.</p>
              </div>
            </section>

            <!-- Signature -->
            <section class="border border-gray-300 rounded-lg p-6">
              <h3 class="text-lg font-bold mb-6 text-primary border-b pb-2">ASSINATURA E RECEBIMENTO</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p class="mb-4"><strong>Declaro ter recebido o equipamento em perfeito estado:</strong></p>
                  <div style="border-bottom: 1px solid #9ca3af; height: 3rem; margin-bottom: 0.5rem;"></div>
                  <p class="text-sm text-center">Assinatura do Cliente</p>
                </div>
                <div>
                  <p class="mb-4"><strong>Data de Recebimento:</strong></p>
                  <div style="border-bottom: 1px solid #9ca3af; height: 3rem; margin-bottom: 0.5rem;"></div>
                  <p class="text-sm text-center">___/___/______</p>
                </div>
              </div>
            </section>

            <!-- Footer -->
            <footer class="text-center mt-8 pt-6 border-t-2 border-primary">
              <p class="text-lg font-bold text-primary">Obrigado pela confiança!</p>
              <p class="text-sm text-gray-600 mt-2">Este documento foi gerado automaticamente pelo sistema JPSOLUTECH</p>
            </footer>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  }
}

const statusLabels: Record<ServiceOrder['status'], string> = {
  analyzing: 'Em Análise',
  repairing: 'Em Reparo',
  completed: 'Concluído',
  delivered: 'Entregue'
};