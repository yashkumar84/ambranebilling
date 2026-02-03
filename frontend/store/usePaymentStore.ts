import { create } from 'zustand';
import { Payment } from '../types';
import { paymentService } from '../services/paymentService';

interface PaymentState {
    payments: Payment[];
    loading: boolean;
    error: string | null;
    fetchPayments: () => Promise<void>;
    addPayment: (payment: Partial<Payment>) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
    payments: [],
    loading: false,
    error: null,
    fetchPayments: async () => {
        set({ loading: true, error: null });
        try {
            const response = await paymentService.getAll();
            set({ payments: response.data, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch payments', loading: false });
        }
    },
    addPayment: async (payment: Partial<Payment>) => {
        set({ loading: true, error: null });
        try {
            const response = await paymentService.create(payment);
            set({ payments: [...get().payments, response.data], loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to create payment', loading: false });
            throw error;
        }
    },
}));
