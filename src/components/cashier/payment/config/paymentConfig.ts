
/**
 * Configuración centralizada del sistema de pagos
 */

export const paymentConfig = {
  // Configuraciones generales
  general: {
    defaultCurrency: 'COP',
    decimalPlaces: 0,
    partialPaymentThreshold: 50000, // Mínimo para permitir pagos parciales
    maxCashAmount: 5000000, // Monto máximo para pagos en efectivo
    maxCardAmount: 10000000 // Monto máximo para pagos con tarjeta
  },

  // Configuración de métodos de pago
  methods: {
    cash: {
      enabled: true,
      autoCalculateChange: true,
      requireConfirmation: false,
    },
    card: {
      enabled: true,
      requireConfirmation: true,
      timeout: 60000, // Tiempo de espera máximo para respuesta del datáfono (ms)
    },
    transfer: {
      enabled: true,
      requireConfirmation: true,
      defaultBanks: [
        { name: 'Bancolombia', accountNumber: '1234 5678 9012', holder: 'Restaurante Demo S.A.S' }
      ],
    }
  },

  // Configuración de efectivo
  cash: {
    denominations: [
      { value: 100000, type: 'bill' },
      { value: 50000, type: 'bill' },
      { value: 20000, type: 'bill' },
      { value: 10000, type: 'bill' },
      { value: 5000, type: 'bill' },
      { value: 2000, type: 'bill' },
      { value: 1000, type: 'bill' },
      { value: 500, type: 'coin' },
      { value: 200, type: 'coin' },
      { value: 100, type: 'coin' },
      { value: 50, type: 'coin' }
    ],
  },
  
  // Configuración de propinas
  tips: {
    defaultPercentages: [10, 15, 18],
    allowCustomAmount: true,
    maxTipPercentage: 30
  },
  
  // Configuración de impresión
  printing: {
    autoPrintReceipt: true,
    printPreview: false,
    copies: 1
  }
};

/**
 * Utilidades de cálculo de pagos
 */
export const calculateChange = (amountReceived: number, amountToPay: number): number => {
  if (amountReceived < amountToPay) return 0;
  return amountReceived - amountToPay;
};

export const calculateOptimalDenominations = (changeAmount: number): Record<number, number> => {
  const result: Record<number, number> = {};
  let remainingAmount = changeAmount;
  
  // Ordenar denominaciones de mayor a menor
  const denominations = [...paymentConfig.cash.denominations]
    .sort((a, b) => b.value - a.value)
    .map(d => d.value);
  
  // Algoritmo voraz para calcular el cambio óptimo
  for (const denomination of denominations) {
    if (remainingAmount >= denomination) {
      const count = Math.floor(remainingAmount / denomination);
      result[denomination] = count;
      remainingAmount -= count * denomination;
    }
  }
  
  return result;
};
