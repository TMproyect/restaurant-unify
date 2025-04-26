
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useCashRegister } from '@/hooks/use-cash-register';
import { useAuth } from '@/contexts/auth/AuthContext';
import { CashierLoading } from '@/components/cashier/components/CashierLoading';
import { NoActiveShiftState } from '@/components/cashier/components/NoActiveShiftState';
import { CashierInterface } from '@/components/cashier/components/CashierInterface';

const Cashier = () => {
  const { activeShift, isShiftActive, isLoading: isShiftLoading } = useCashRegister();
  const { user } = useAuth();

  // Show loading indicator if auth is still loading
  if (isShiftLoading) {
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
