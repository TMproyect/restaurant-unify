
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useCashRegister } from '@/hooks/use-cash-register';
import { CashierLoading } from '@/components/cashier/components/CashierLoading';
import { NoActiveShiftState } from '@/components/cashier/components/NoActiveShiftState';
import { CashierInterface } from '@/components/cashier/components/CashierInterface';

const Cashier = () => {
  const { activeShift, isShiftActive } = useCashRegister();
  
  return (
    <Layout>
      {!isShiftActive ? (
        <NoActiveShiftState />
      ) : (
        <CashierInterface activeShift={activeShift} />
      )}
    </Layout>
  );
};

export default Cashier;
