
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Orders from "./pages/Orders";
import Kitchen from "./pages/Kitchen";
import Inventory from "./pages/Inventory";
import Menu from "./pages/Menu";
import Delivery from "./pages/Delivery";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Staff from "./pages/Staff";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
