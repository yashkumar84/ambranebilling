import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Order, ApiResponse, OrderStatus } from '../types';

export const orderService = {
    getAll: async (restaurantId: string = '1') => {
        // The backend endpoint is /api/orders/restaurant/:restaurantId
        const response = await api.get<ApiResponse<{ items: Order[] }>>(`/api/orders/restaurant/${restaurantId}`);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Order>>(endpoints.orders.get(id));
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post<ApiResponse<Order>>(endpoints.orders.create, data);
        return response.data;
    },
    updateStatus: async (id: string, status: OrderStatus) => {
        const response = await api.patch<ApiResponse<Order>>(endpoints.orders.updateStatus(id), { status });
        return response.data;
    },
    getStats: async (restaurantId: string = '1') => {
        const response = await api.get<ApiResponse<any>>(endpoints.orders.stats(restaurantId));
        return response.data;
    },
    getAnalytics: async (restaurantId: string = '1') => {
        const response = await api.get<ApiResponse<any>>(endpoints.orders.analytics(restaurantId));
        return response.data;
    }
};
