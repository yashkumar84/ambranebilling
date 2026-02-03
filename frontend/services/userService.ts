import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { User, ApiResponse } from '../types';

export const userService = {
    getAll: async () => {
        const response = await api.get<ApiResponse<User[]>>(endpoints.users.list);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<User>>(endpoints.users.get(id));
        return response.data;
    },
    create: async (data: Partial<User>) => {
        const response = await api.post<ApiResponse<User>>(endpoints.users.create, data);
        return response.data;
    },
    update: async (id: string, data: Partial<User>) => {
        const response = await api.put<ApiResponse<User>>(endpoints.users.update(id), data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<void>>(endpoints.users.delete(id));
        return response.data;
    }
};
