import React, { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { CustomerList } from '@/components/Customers/CustomerList';
import { ServiceOrderList } from '@/components/Services/ServiceOrderList';
import { ProductList } from '@/components/Products/ProductList';
import { SaleList } from '@/components/Sales/SaleList';
import { ReportsList } from '@/components/Reports/ReportsList';

export function TechAssistApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerList />;
      case 'services':
        return <ServiceOrderList />;
      case 'products':
        return <ProductList />;
      case 'sales':
        return <SaleList />;
      case 'reports':
        return <ReportsList />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="h-screen flex bg-background">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </AppProvider>
  );
}