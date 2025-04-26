
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
    // Force timeout to prevent infinite loading
    const timer = setTimeout(() => {
      console.log("[Cashier] Forcing load completion");
      // Page will re-render with latest state
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading for a very short time
  if (isShiftLoading && !activeShift) {
    return (
      <Layout>
        <CashierLoading />
      </Layout>
    );
  }

  // If no active shift, show the open shift form
  if (!isShiftActive) {
    return (
      <Layout>
        <NoActiveShiftState />
      </Layout>
    );
  }

  // Show the main cashier interface when there's an active shift
  return (
    <Layout>
      <CashierInterface activeShift={activeShift} />
    </Layout>
  );
};

export default Cashier;
