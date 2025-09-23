export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
  lastService?: string;
}

export interface ServiceOrder {
  id: string;
  customerId: string;
  customerName: string;
  device: string;
  issue: string;
  status: 'analyzing' | 'repairing' | 'completed' | 'delivered';
  estimatedCost?: number;
  finalCost?: number;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  supplier?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'pix' | 'card' | 'transfer';
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'sale' | 'service';
  quantity: number;
  reason: string;
  createdAt: string;
}

export type StatusColor = {
  analyzing: 'warning';
  repairing: 'primary';
  completed: 'success';
  delivered: 'muted';
};