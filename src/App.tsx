
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { ShiftStateProvider } from '@/hooks/cashier/use-shift-state';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Menu from '@/pages/Menu';
import Cashier from '@/pages/Cashier';
import Kitchen from '@/pages/Kitchen';
import Tables from '@/pages/Tables';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import RolesAndPermissions from '@/pages/RolesAndPermissions';
import Sales from '@/pages/Sales';
import Delivery from '@/pages/Delivery';
import Staff from '@/pages/Staff';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import SalesTest from '@/pages/SalesTest';
import Reports from '@/pages/Reports';
import Integrations from '@/pages/Integrations';
import Integration from '@/pages/Integration';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ShiftStateProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/roles" element={<RolesAndPermissions />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/sales-test" element={<SalesTest />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/integration/:id" element={<Integration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </ShiftStateProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
