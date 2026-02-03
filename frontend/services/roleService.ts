import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Role, ApiResponse, PaginatedResponse } from '../types';

export const roleService = {
    getAll: async () => {
        const response = await api.get<ApiResponse<Role[]>>(endpoints.roles.list);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Role>>(endpoints.roles.get(id));
        return response.data;
    },
    create: async (data: Partial<Role>) => {
        const response = await api.post<ApiResponse<Role>>(endpoints.roles.create, data);
        return response.data;
    },
    update: async (id: string, data: Partial<Role>) => {
        const response = await api.put<ApiResponse<Role>>(endpoints.roles.update(id), data);
        return response.data;
    },
    delete: async (id: string) => {
        const response = await api.delete<ApiResponse<null>>(endpoints.roles.delete(id));
        return response.data;
    },
    assignPermissions: async (id: string, permissionIds: string[]) => {
        const response = await api.post<ApiResponse<Role>>(
            endpoints.roles.assignPermissions(id),
            { permissionIds }
        );
        return response.data;
    },
};
