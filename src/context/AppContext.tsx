import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Customer, ServiceOrder, Product, Sale, StockMovement } from '@/types';

interface AppState {
  customers: Customer[];
  serviceOrders: ServiceOrder[];
  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
}

type AppAction = 
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'ADD_SERVICE_ORDER'; payload: ServiceOrder }
  | { type: 'UPDATE_SERVICE_ORDER'; payload: ServiceOrder }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'ADD_SALE'; payload: Sale }
  | { type: 'ADD_STOCK_MOVEMENT'; payload: StockMovement }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  customers: [],
  serviceOrders: [],
  products: [],
  sales: [],
  stockMovements: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_CUSTOMER':
      return { ...state, customers: [...state.customers, action.payload] };
    
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
      };
    
    case 'ADD_SERVICE_ORDER':
      return { ...state, serviceOrders: [...state.serviceOrders, action.payload] };
    
    case 'UPDATE_SERVICE_ORDER':
      return {
        ...state,
        serviceOrders: state.serviceOrders.map(so => 
          so.id === action.payload.id ? action.payload : so
        ),
      };
    
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
    
    case 'ADD_SALE':
      return { ...state, sales: [...state.sales, action.payload] };
    
    case 'ADD_STOCK_MOVEMENT':
      return { ...state, stockMovements: [...state.stockMovements, action.payload] };
    
    case 'LOAD_DATA':
      return action.payload;
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on init
  useEffect(() => {
    const savedData = localStorage.getItem('techAssistanceData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('techAssistanceData', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}