import { create } from 'zustand';
import { Permission } from '../types';
import { permissionService } from '../services/permissionService';

interface PermissionState {
    permissions: Permission[];
    loading: boolean;
    error: string | null;
    fetchPermissions: () => Promise<void>;
    addPermission: (permission: Partial<Permission>) => Promise<void>;
    removePermission: (id: string) => Promise<void>;
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
    permissions: [],
    loading: false,
    error: null,
    fetchPermissions: async () => {
        set({ loading: true, error: null });
        try {
            const response = await permissionService.getAll();
            set({ permissions: response.data, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch permissions', loading: false });
        }
    },
    addPermission: async (permission: Partial<Permission>) => {
        set({ loading: true, error: null });
        try {
            const response = await permissionService.create(permission);
            set({ permissions: [...get().permissions, response.data], loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to create permission', loading: false });
            throw error;
        }
    },
    removePermission: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await permissionService.delete(id);
            set({ permissions: get().permissions.filter(p => p.id !== id), loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete permission', loading: false });
            throw error;
        }
    },
}));
