import { create } from 'zustand'
import superAdminService, { Tenant, Subscription, PlatformAnalytics } from '@/services/superAdminService'

interface SuperAdminState {
    // Tenants
    tenants: Tenant[]
    selectedTenant: Tenant | null
    tenantsTotal: number
    tenantsLoading: boolean

    // Subscriptions
    subscriptions: Subscription[]
    subscriptionsLoading: boolean

    // Analytics
    analytics: PlatformAnalytics | null
    analyticsLoading: boolean

    // Tenant Staff & Products
    tenantStaff: any[]
    tenantProducts: any[]
    tenantDetailsLoading: boolean

    // Actions
    fetchTenants: (page?: number, limit?: number, search?: string) => Promise<void>
    fetchTenantById: (id: string) => Promise<void>
    createTenant: (data: any) => Promise<void>
    activateTenant: (id: string) => Promise<void>
    deactivateTenant: (id: string) => Promise<void>
    deleteTenant: (id: string) => Promise<void>
    fetchSubscriptions: (status?: string) => Promise<void>
    updateSubscription: (id: string, data: any) => Promise<void>
    fetchAnalytics: () => Promise<void>
    clearSelectedTenant: () => void

    // Tenant Management Actions
    fetchTenantStaff: (tenantId: string) => Promise<void>
    addTenantStaff: (tenantId: string, data: any) => Promise<void>
    fetchTenantProducts: (tenantId: string) => Promise<void>
    addTenantProduct: (tenantId: string, data: any) => Promise<void>
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
    // Initial state
    tenants: [],
    selectedTenant: null,
    tenantsTotal: 0,
    tenantsLoading: false,
    subscriptions: [],
    subscriptionsLoading: false,
    analytics: null,
    analyticsLoading: false,

    tenantStaff: [],
    tenantProducts: [],
    tenantDetailsLoading: false,

    // Tenant actions
    fetchTenants: async (page = 1, limit = 20, search = '') => {
        set({ tenantsLoading: true })
        try {
            const data = await superAdminService.getTenants(page, limit, search)
            set({
                tenants: data.tenants,
                tenantsTotal: data.pagination.total,
                tenantsLoading: false,
            })
        } catch (error) {
            console.error('Failed to fetch tenants:', error)
            set({ tenantsLoading: false })
        }
    },

    fetchTenantById: async (id: string) => {
        set({ tenantsLoading: true })
        try {
            const tenant = await superAdminService.getTenantById(id)
            set({ selectedTenant: tenant, tenantsLoading: false })
        } catch (error) {
            console.error('Failed to fetch tenant:', error)
            set({ tenantsLoading: false })
        }
    },

    createTenant: async (data: any) => {
        try {
            await superAdminService.createTenant(data)
            // Refresh tenant list
            const tenantsData = await superAdminService.getTenants()
            set({ tenants: tenantsData.tenants, tenantsTotal: tenantsData.pagination.total })
        } catch (error) {
            console.error('Failed to create tenant:', error)
            throw error
        }
    },

    activateTenant: async (id: string) => {
        try {
            await superAdminService.activateTenant(id)
            // Update tenant in list
            set((state) => ({
                tenants: state.tenants.map((t) => (t.id === id ? { ...t, isActive: true } : t)),
                selectedTenant: state.selectedTenant?.id === id ? { ...state.selectedTenant, isActive: true } : state.selectedTenant,
            }))
        } catch (error) {
            console.error('Failed to activate tenant:', error)
            throw error
        }
    },

    deactivateTenant: async (id: string) => {
        try {
            await superAdminService.deactivateTenant(id)
            // Update tenant in list
            set((state) => ({
                tenants: state.tenants.map((t) => (t.id === id ? { ...t, isActive: false } : t)),
                selectedTenant: state.selectedTenant?.id === id ? { ...state.selectedTenant, isActive: false } : state.selectedTenant,
            }))
        } catch (error) {
            console.error('Failed to deactivate tenant:', error)
            throw error
        }
    },

    deleteTenant: async (id: string) => {
        try {
            await superAdminService.deleteTenant(id)
            // Remove from list
            set((state) => ({
                tenants: state.tenants.filter((t) => t.id !== id),
                tenantsTotal: state.tenantsTotal - 1,
                selectedTenant: state.selectedTenant?.id === id ? null : state.selectedTenant,
            }))
        } catch (error) {
            console.error('Failed to delete tenant:', error)
            throw error
        }
    },

    // Subscription actions
    fetchSubscriptions: async (status?: string) => {
        set({ subscriptionsLoading: true })
        try {
            const subscriptions = await superAdminService.getSubscriptions(status)
            set({ subscriptions, subscriptionsLoading: false })
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error)
            set({ subscriptionsLoading: false })
        }
    },

    updateSubscription: async (id: string, data: any) => {
        try {
            const updated = await superAdminService.updateSubscription(id, data)
            // Update in list
            set((state) => ({
                subscriptions: state.subscriptions.map((s) => (s.id === id ? updated.subscription : s)),
            }))
        } catch (error) {
            console.error('Failed to update subscription:', error)
            throw error
        }
    },

    // Analytics actions
    fetchAnalytics: async () => {
        set({ analyticsLoading: true })
        try {
            const analytics = await superAdminService.getAnalytics()
            set({ analytics, analyticsLoading: false })
        } catch (error) {
            console.error('Failed to fetch analytics:', error)
            set({ analyticsLoading: false })
        }
    },

    clearSelectedTenant: () => set({ selectedTenant: null }),

    fetchTenantStaff: async (tenantId) => {
        set({ tenantDetailsLoading: true })
        try {
            const staff = await superAdminService.getTenantStaff(tenantId)
            set({ tenantStaff: staff, tenantDetailsLoading: false })
        } catch (error) {
            console.error('Failed to fetch tenant staff:', error)
            set({ tenantDetailsLoading: false })
        }
    },

    addTenantStaff: async (tenantId, data) => {
        try {
            await superAdminService.addTenantStaff(tenantId, data)
            const staff = await superAdminService.getTenantStaff(tenantId)
            set({ tenantStaff: staff })
        } catch (error) {
            console.error('Failed to add tenant staff:', error)
            throw error
        }
    },

    fetchTenantProducts: async (tenantId) => {
        set({ tenantDetailsLoading: true })
        try {
            const products = await superAdminService.getTenantProducts(tenantId)
            set({ tenantProducts: products, tenantDetailsLoading: false })
        } catch (error) {
            console.error('Failed to fetch tenant products:', error)
            set({ tenantDetailsLoading: false })
        }
    },

    addTenantProduct: async (tenantId, data) => {
        try {
            await superAdminService.addTenantProduct(tenantId, data)
            const products = await superAdminService.getTenantProducts(tenantId)
            set({ tenantProducts: products })
        } catch (error) {
            console.error('Failed to add tenant product:', error)
            throw error
        }
    },
}))
