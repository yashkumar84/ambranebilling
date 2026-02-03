import { create } from 'zustand';
import { Order, OrderStatus } from '../types';
import { orderService } from '../services/orderService';

interface OrderState {
    orders: Order[];
    loading: boolean;
    error: string | null;
    fetchOrders: (restaurantId?: string) => Promise<void>;
    updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
    orders: [],
    loading: false,
    error: null,
    fetchOrders: async (restaurantId = '1') => {
        set({ loading: true });
        try {
            const response = await orderService.getAll(restaurantId);
            set({ orders: response.data.items, error: null });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    updateOrderStatus: async (id, status) => {
        try {
            const response = await orderService.updateStatus(id, status);
            set({
                orders: get().orders.map(o => o.id === id ? response.data : o)
            });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    }
}));
