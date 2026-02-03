import { create } from 'zustand';
import { MenuItem } from '../types';
import { menuService } from '../services/menuService';

interface MenuState {
    items: MenuItem[];
    loading: boolean;
    error: string | null;
    fetchMenu: (restaurantId?: string) => Promise<void>;
    addMenuItem: (item: Partial<MenuItem>) => Promise<void>;
    updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
    removeMenuItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    fetchMenu: async (restaurantId: string = '1') => {
        set({ loading: true });
        try {
            const response = await menuService.getAll(restaurantId);
            const products = (response.data as any).products || (response.data as any).items || [];
            set({ items: products, error: null });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    addMenuItem: async (data) => {
        try {
            const response = await menuService.create(data);
            set({ items: [response.data, ...get().items] });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    updateMenuItem: async (id, data) => {
        try {
            const response = await menuService.update(id, data);
            set({
                items: get().items.map(item => item.id.toString() === id ? response.data : item)
            });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    removeMenuItem: async (id) => {
        try {
            await menuService.delete(id);
            set({ items: get().items.filter(item => item.id.toString() !== id) });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    }
}));
