import { create } from 'zustand';
import { User } from '../types';
import { userService } from '../services/userService';

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    addUser: (user: Partial<User>) => Promise<void>;
    updateUser: (id: string, user: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    loading: false,
    error: null,
    fetchUsers: async () => {
        set({ loading: true });
        try {
            const response = await userService.getAll();
            set({ users: response.data, error: null });
        } catch (error: any) {
            set({ error: error.message });
        } finally {
            set({ loading: false });
        }
    },
    addUser: async (data) => {
        try {
            const response = await userService.create(data);
            set({ users: [response.data, ...get().users] });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    updateUser: async (id, data) => {
        try {
            const response = await userService.update(id, data);
            set({
                users: get().users.map(u => u.id === id ? response.data : u)
            });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    },
    deleteUser: async (id) => {
        try {
            await userService.delete(id);
            set({ users: get().users.filter(u => u.id !== id) });
        } catch (error: any) {
            set({ error: error.message });
            throw error;
        }
    }
}));
