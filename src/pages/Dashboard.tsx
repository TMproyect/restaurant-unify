
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import AlertsBanner from '@/components/dashboard/AlertsBanner';
import UpgradeToAdmin from '@/components/dashboard/UpgradeToAdmin';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardError from '@/components/dashboard/DashboardError';
import DashboardLoading from '@/components/dashboard/DashboardLoading';
import { useDashboardInit } from '@/hooks/use-dashboard-init';
import { useAuth } from '@/contexts/auth/AuthContext';

const Dashboard = () => {
  console.log('🔄 [Dashboard] Component rendering');
  
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { error, isReady } = useDashboardInit();
  
  // Log auth state for debugging
  useEffect(() => {
    console.log('🔄 [Dashboard] Auth state:', { 
      isAuthenticated, 
      authLoading, 
      user: user ? { id: user.id, email: user?.email, role: user.role } : 'No user' 
    });
  }, [isAuthenticated, authLoading, user]);
  
  // Log render decisions
  if (error) {
    console.log('🔄 [Dashboard] Rendering error state:', error);
  } else if (!isReady) {
    console.log('🔄 [Dashboard] Rendering loading state');
  } else {
    console.log('🔄 [Dashboard] Rendering normal dashboard');
    console.log('🔄 [Dashboard] User from auth context:', user);
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <Layout>
        <DashboardError error={error} />
      </Layout>
    );
  }

  // Show loading state until ready
  if (!isReady) {
    return (
      <Layout>
        <DashboardLoading />
      </Layout>
    );
  }

  // Normal dashboard render
  console.log('🔄 [Dashboard] Rendering complete dashboard UI');
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        
        {/* Banner de actualización a Admin */}
        <UpgradeToAdmin />
        
        {/* Alertas y notificaciones */}
        <AlertsBanner />
        
        {/* Dashboard Content (Stats and Cards) */}
        <DashboardContent />
      </div>
    </Layout>
  );
};

export default Dashboard;
