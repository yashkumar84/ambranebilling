import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Table, ApiResponse, TableStatus, PaginatedResponse } from '../types';

export const tableService = {
    getAll: async (restaurantId: string = '1') => {
        const response = await api.get<ApiResponse<PaginatedResponse<Table>>>(endpoints.tables.list(restaurantId));
        return response.data;
    },
    create: async (data: Partial<Table>) => {
        const response = await api.post<ApiResponse<Table>>(endpoints.tables.create, data);
        return response.data;
    },
    getById: async (id: string) => {
        const response = await api.get<ApiResponse<Table>>(endpoints.tables.get(id));
        return response.data;
    },
    updateStatus: async (id: string, status: TableStatus) => {
        const response = await api.patch<ApiResponse<Table>>(endpoints.tables.updateStatus(id), { status });
        return response.data;
    }
};
