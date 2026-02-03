import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Payment, ApiResponse } from '../types';

export const paymentService = {
    getAll: async () => {
        const response = await api.get<ApiResponse<Payment[]>>(endpoints.payments.list);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Payment>>(endpoints.payments.get(id));
        return response.data;
    },
    create: async (data: Partial<Payment>) => {
        const response = await api.post<ApiResponse<Payment>>(endpoints.payments.create, data);
        return response.data;
    },
    getStats: async () => {
        const response = await api.get<ApiResponse<any>>(endpoints.payments.stats);
        return response.data;
    },
};
