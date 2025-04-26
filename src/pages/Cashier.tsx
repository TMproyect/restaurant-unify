
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { CashierLoading } from '@/components/cashier/components/CashierLoading';
import { NoActiveShiftState } from '@/components/cashier/components/NoActiveShiftState';
import { CashierInterface } from '@/components/cashier/components/CashierInterface';

const Cashier = () => {
  const { activeShift, isShiftActive, isLoading: isShiftLoading } = useCashRegister();
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("[Cashier] Component mounted, user:", user?.id);
    console.log("[Cashier] Active shift status:", { isShiftActive, activeShift, isShiftLoading });
    
    return () => {
      console.log("[Cashier] Component unmounting");
    };
  }, [user, isShiftActive, activeShift, isShiftLoading]);

  // Show loading state if we're still checking
  if (isShiftLoading) {
    console.log("[Cashier] Rendering loading state");
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <CashierLoading />
        </div>
      </Layout>
    );
  }

  // If no active shift, show the open shift form
  if (!isShiftActive) {
    console.log("[Cashier] Rendering NoActiveShiftState");
    return (
      <Layout>
        <NoActiveShiftState />
      </Layout>
    );
  }

  // Show the main cashier interface when there's an active shift
  console.log("[Cashier] Rendering CashierInterface with active shift");
  return (
    <Layout>
      <CashierInterface activeShift={activeShift} />
    </Layout>
  );
};

export default Cashier;
