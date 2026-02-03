import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { MenuItem, ApiResponse, PaginatedResponse } from '../types';

export const menuService = {
    getAll: async (restaurantId: string = '1') => {
        const response = await api.get<ApiResponse<PaginatedResponse<MenuItem>>>(endpoints.menu.list(restaurantId));
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<MenuItem>>(endpoints.menu.get(id));
        return response.data;
    },
    create: async (data: Partial<MenuItem>) => {
        const response = await api.post<ApiResponse<MenuItem>>(endpoints.menu.create, data);
        return response.data;
    },
    update: async (id: string, data: Partial<MenuItem>) => {
        const response = await api.put<ApiResponse<MenuItem>>(endpoints.menu.update(id), data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(endpoints.menu.delete(id));
        return response.data;
    }
};
