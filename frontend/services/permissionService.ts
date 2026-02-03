import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Permission, ApiResponse } from '../types';

export const permissionService = {
    getAll: async () => {
        const response = await api.get<ApiResponse<Permission[]>>(endpoints.permissions.list);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Permission>>(endpoints.permissions.get(id));
        return response.data;
    },
    create: async (data: Partial<Permission>) => {
        const response = await api.post<ApiResponse<Permission>>(endpoints.permissions.create, data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(endpoints.permissions.delete(id));
        return response.data;
    },
};
