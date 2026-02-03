import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Customer, ApiResponse } from '../types';

export const customerService = {
    getAll: async () => {
        const response = await api.get<ApiResponse<Customer[]>>(endpoints.customers.list);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Customer>>(endpoints.customers.get(id));
        return response.data;
    },
    create: async (data: Partial<Customer>) => {
        const response = await api.post<ApiResponse<Customer>>(endpoints.customers.create, data);
        return response.data;
    },
    update: async (id: string, data: Partial<Customer>) => {
        const response = await api.put<ApiResponse<Customer>>(endpoints.customers.update(id), data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(endpoints.customers.delete(id));
        return response.data;
    }
};
