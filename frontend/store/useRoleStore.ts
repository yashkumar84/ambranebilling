import { create } from 'zustand';
import { Role } from '../types';
import { roleService } from '../services/roleService';

interface RoleState {
    roles: Role[];
    loading: boolean;
    error: string | null;
    fetchRoles: () => Promise<void>;
    addRole: (role: Partial<Role>) => Promise<void>;
    updateRole: (id: string, role: Partial<Role>) => Promise<void>;
    removeRole: (id: string) => Promise<void>;
    assignPermissions: (id: string, permissionIds: string[]) => Promise<void>;
}

export const useRoleStore = create<RoleState>((set, get) => ({
    roles: [],
    loading: false,
    error: null,
    fetchRoles: async () => {
        set({ loading: true, error: null });
        try {
            const response = await roleService.getAll();
            set({ roles: response.data, loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch roles', loading: false });
        }
    },
    addRole: async (role: Partial<Role>) => {
        set({ loading: true, error: null });
        try {
            const response = await roleService.create(role);
            set({ roles: [...get().roles, response.data], loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to create role', loading: false });
            throw error;
        }
    },
    updateRole: async (id: string, role: Partial<Role>) => {
        set({ loading: true, error: null });
        try {
            const response = await roleService.update(id, role);
            set({
                roles: get().roles.map(r => r.id === id ? response.data : r),
                loading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to update role', loading: false });
            throw error;
        }
    },
    removeRole: async (id: string) => {
        set({ loading: true, error: null });
        try {
            await roleService.delete(id);
            set({ roles: get().roles.filter(r => r.id !== id), loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to delete role', loading: false });
            throw error;
        }
    },
    assignPermissions: async (id: string, permissionIds: string[]) => {
        set({ loading: true, error: null });
        try {
            const response = await roleService.assignPermissions(id, permissionIds);
            set({
                roles: get().roles.map(r => r.id === id ? response.data : r),
                loading: false
            });
        } catch (error: any) {
            set({ error: error.message || 'Failed to assign permissions', loading: false });
            throw error;
        }
    },
}));
