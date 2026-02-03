import { create } from 'zustand';
import { Table, TableStatus } from '../types';
import { tableService } from '../services/tableService';

interface TableState {
    tables: Table[];
    loading: boolean;
    error: string | null;
    fetchTables: (tenantId?: string) => Promise<void>;
    addTable: (data: { number: string; capacity: number }) => Promise<void>;
    updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
}

export const useTableStore = create<TableState>((set, get) => ({
    tables: [],
    loading: false,
    error: null,
    fetchTables: async (tenantId?: string) => {
        set({ loading: true });
        try {
            const response = await tableService.getAll(tenantId || '1');
            set({ tables: response.data.items, error: null });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    addTable: async (data) => {
        try {
            const response = await tableService.create(data);
            set({ tables: [response.data, ...get().tables] });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    updateTableStatus: async (id, status) => {
        try {
            const response = await tableService.updateStatus(id, status);
            set({
                tables: get().tables.map(table => table.id === id ? response.data : table)
            });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    }
}));
