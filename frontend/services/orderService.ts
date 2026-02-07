import api from '../lib/api';
import { endpoints } from '../lib/endpoints';
import { Order, ApiResponse, OrderStatus } from '../types';

export const orderService = {
    getAll: async () => {
        // The backend uses tenantId from auth token, not the URL parameter
        // We pass 'current' as a placeholder since the backend ignores it anyway
        const response = await api.get<ApiResponse<{ orders: Order[], pagination: any }>>(`/api/orders/restaurant/current`);
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
    },
    downloadA4Invoice: async (id: string, orderNumber: string) => {
        const response = await api.get(endpoints.orders.invoice(id), {
            responseType: 'blob'
        });

        // Create a download link and trigger it
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${orderNumber}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    downloadReceipt: async (id: string) => {
        const response = await api.get(endpoints.orders.receipt(id), {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const printWindow = window.open(url);
        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
                // Optionally revoke the URL after printing
            };
        }
    }
};
