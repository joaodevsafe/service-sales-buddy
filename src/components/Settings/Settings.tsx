import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  User, 
  Bell, 
  Palette, 
  Download, 
  Upload,
  Save,
  Printer,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Settings() {
  const { toast } = useToast();
  const [companySettings, setCompanySettings] = useState(() => {
    const saved = localStorage.getItem('companySettings');
    return saved ? JSON.parse(saved) : {
      name: 'JPSOLUTECH',
      address: '',
      phone: '',
      email: '',
      cnpj: '',
      logo: ''
    };
  });

  const [userSettings, setUserSettings] = useState({
    name: 'Admin',
    email: 'admin@techassist.com',
    notifications: true,
    emailAlerts: true,
    soundEffects: false
  });

  const [systemSettings, setSystemSettings] = useState(() => {
    const saved = localStorage.getItem('systemSettings');
    return saved ? JSON.parse(saved) : {
      autoBackup: true,
      lowStockAlert: 5,
      defaultServiceWarranty: 90,
      printReceipts: true,
      darkMode: false
    };
  });

  const handleSaveCompany = () => {
    // Salvar configurações da empresa
    localStorage.setItem('companySettings', JSON.stringify(companySettings));
    toast({
      title: "Configurações salvas",
      description: "Dados da empresa atualizados com sucesso.",
    });
  };

  const handleSaveUser = () => {
    // Salvar configurações do usuário
    localStorage.setItem('userSettings', JSON.stringify(userSettings));
    toast({
      title: "Configurações salvas",
      description: "Preferências do usuário atualizadas com sucesso.",
    });
  };

  const handleSaveSystem = () => {
    // Salvar configurações do sistema
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    toast({
      title: "Configurações salvas",
      description: "Configurações do sistema atualizadas com sucesso.",
    });
  };

  const handleExportData = () => {
    const allData = {
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      serviceOrders: JSON.parse(localStorage.getItem('serviceOrders') || '[]'),
      products: JSON.parse(localStorage.getItem('products') || '[]'),
      sales: JSON.parse(localStorage.getItem('sales') || '[]'),
      stockMovements: JSON.parse(localStorage.getItem('stockMovements') || '[]')
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techassist-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Backup realizado",
      description: "Dados exportados com sucesso.",
    });
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Salvar dados importados
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });

        toast({
          title: "Dados importados",
          description: "Backup restaurado com sucesso. Recarregue a página.",
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema e da empresa
        </p>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">
            <Building className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="user">
            <User className="h-4 w-4 mr-2" />
            Usuário
          </TabsTrigger>
          <TabsTrigger value="system">
            <Shield className="h-4 w-4 mr-2" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Download className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Configure as informações da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Nome da Empresa</Label>
                  <Input
                    id="company-name"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-cnpj">CNPJ</Label>
                  <Input
                    id="company-cnpj"
                    value={companySettings.cnpj}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      cnpj: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-phone">Telefone</Label>
                  <Input
                    id="company-phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      phone: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-email">E-mail</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address">Endereço</Label>
                  <Textarea
                    id="company-address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      address: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-logo">Logo da Empresa (URL)</Label>
                  <Input
                    id="company-logo"
                    type="url"
                    placeholder="https://exemplo.com/logo.png (opcional)"
                    value={companySettings.logo}
                    onChange={(e) => setCompanySettings({
                      ...companySettings,
                      logo: e.target.value
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Deixe em branco para usar a logo padrão JPSOLUTECH
                  </p>
                </div>
              <Button onClick={handleSaveCompany}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>Preferências do Usuário</CardTitle>
              <CardDescription>
                Configure suas preferências pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">Nome</Label>
                  <Input
                    id="user-name"
                    value={userSettings.name}
                    onChange={(e) => setUserSettings({
                      ...userSettings,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">E-mail</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({
                      ...userSettings,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificações</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notificações do Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre o sistema
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={userSettings.notifications}
                      onCheckedChange={(checked) => setUserSettings({
                        ...userSettings,
                        notifications: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-alerts">Alertas por E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber alertas de estoque baixo por e-mail
                      </p>
                    </div>
                    <Switch
                      id="email-alerts"
                      checked={userSettings.emailAlerts}
                      onCheckedChange={(checked) => setUserSettings({
                        ...userSettings,
                        emailAlerts: checked
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sound-effects">Efeitos Sonoros</Label>
                      <p className="text-sm text-muted-foreground">
                        Reproduzir sons nas notificações
                      </p>
                    </div>
                    <Switch
                      id="sound-effects"
                      checked={userSettings.soundEffects}
                      onCheckedChange={(checked) => setUserSettings({
                        ...userSettings,
                        soundEffects: checked
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveUser}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure o comportamento do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-backup">Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático dos dados
                    </p>
                  </div>
                  <Switch
                    id="auto-backup"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      autoBackup: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="print-receipts">Impressão Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Imprimir automaticamente recibos de venda
                    </p>
                  </div>
                  <Switch
                    id="print-receipts"
                    checked={systemSettings.printReceipts}
                    onCheckedChange={(checked) => setSystemSettings({
                      ...systemSettings,
                      printReceipts: checked
                    })}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="low-stock">Alerta de Estoque Baixo</Label>
                  <Input
                    id="low-stock"
                    type="number"
                    value={systemSettings.lowStockAlert}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      lowStockAlert: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Quantidade mínima para alerta
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="warranty-days">Garantia Padrão (dias)</Label>
                  <Input
                    id="warranty-days"
                    type="number"
                    value={systemSettings.defaultServiceWarranty}
                    onChange={(e) => setSystemSettings({
                      ...systemSettings,
                      defaultServiceWarranty: parseInt(e.target.value) || 0
                    })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Garantia padrão para serviços
                  </p>
                </div>
              </div>
              
              <Button onClick={handleSaveSystem}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
                <CardDescription>
                  Faça backup de todos os dados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExportData} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Backup
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Gera um arquivo JSON com todos os dados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Importar Dados</CardTitle>
                <CardDescription>
                  Restaure dados de um backup anterior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-muted-foreground">
                    Selecione um arquivo de backup (.json)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}