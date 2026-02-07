import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: string
    email: string
    name: string
    role?: string
    phone?: string
    tenantId?: string
    isSuperAdmin: boolean
    roleId?: string
    roleName?: string
    permissions?: string[] // resource:action format
    isActive: boolean
    createdAt?: string
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean

    setAuth: (user: User) => void
    clearAuth: () => void
    logout: () => void
    setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,

            setAuth: (user) => {
                set({
                    user,
                    isAuthenticated: true,
                })
            },

            clearAuth: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                })
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                })
            },

            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
