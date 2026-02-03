import { create } from 'zustand';
import { Customer } from '../types';
import { customerService } from '../services/customerService';

interface CustomerState {
    customers: Customer[];
    loading: boolean;
    error: string | null;
    fetchCustomers: () => Promise<void>;
    addCustomer: (customer: Partial<Customer>) => Promise<void>;
    createCustomer: (customer: Partial<Customer>) => Promise<void>;
    updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>;
    removeCustomer: (id: string) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
    customers: [],
    loading: false,
    error: null,
    fetchCustomers: async () => {
        set({ loading: true });
        try {
            const response = await customerService.getAll();
            set({ customers: response.data, error: null });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    addCustomer: async (data) => {
        try {
            const response = await customerService.create(data);
            set({ customers: [response.data, ...get().customers] });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    createCustomer: async (data) => {
        try {
            const response = await customerService.create(data);
            set({ customers: [response.data, ...get().customers] });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    updateCustomer: async (id, data) => {
        try {
            const response = await customerService.update(id, data);
            set({
                customers: get().customers.map(c => c.id.toString() === id ? response.data : c)
            });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    removeCustomer: async (id) => {
        try {
            await customerService.delete(id);
            set({ customers: get().customers.filter(c => c.id.toString() !== id) });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    }
}));
