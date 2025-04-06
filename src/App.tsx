
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import Menu from '@/pages/Menu';
import Tables from '@/pages/Tables';
import Settings from '@/pages/Settings';
import Cashier from '@/pages/Cashier';
import Kitchen from '@/pages/Kitchen';
import Integrations from '@/pages/Integrations';
import { setupRealtimeForTables } from './utils/enableRealtimeFunction';
import { AuthProvider } from '@/contexts/auth/AuthContext';
import Login from '@/pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

function App() {
  // Set up realtime for tables when the app starts
  useEffect(() => {
    setupRealtimeForTables();
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="/cashier" element={<Cashier />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Router>
          <Toaster />
          <SonnerToaster position="top-right" />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
