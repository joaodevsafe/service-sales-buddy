import React from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  ShoppingCart, 
  FileText,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'services', label: 'Ordens de Serviço', icon: Wrench },
  { id: 'products', label: 'Estoque', icon: Package },
  { id: 'sales', label: 'Vendas', icon: ShoppingCart },
  { id: 'reports', label: 'Relatórios', icon: FileText },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">TechAssist</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Sistema de Gestão
        </p>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200",
                  "hover:bg-secondary/50",
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors hover:bg-secondary/50 text-muted-foreground">
          <Settings className="h-5 w-5" />
          <span className="font-medium">Configurações</span>
        </button>
      </div>
    </div>
  );
}