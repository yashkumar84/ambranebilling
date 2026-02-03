import api from '@/lib/api'

export interface Tenant {
    id: string
    businessName: string
    businessType: string
    subdomain?: string
    gstNumber?: string
    address?: string
    phone?: string
    email?: string
    logoUrl?: string
    currency: string
    timezone: string
    isActive: boolean
    createdAt: string
    subscription?: {
        id: string
        status: string
        planName: string
        endDate: string
    }
    _count?: {
        users: number
        products: number
        orders: number
    }
}

export interface CreateTenantData {
    businessName: string
    businessType: string
    subdomain?: string
    gstNumber?: string
    address?: string
    phone?: string
    email?: string
    planId: string
    ownerName: string
    ownerEmail: string
    ownerPassword: string
}

export interface Subscription {
    id: string
    status: string
    startDate: string
    endDate: string
    autoRenew: boolean
    tenant: {
        id: string
        businessName: string
        email?: string
    }
    plan: {
        id: string
        name: string
        priceMonthly: number
    }
}

export interface PlatformAnalytics {
    totalTenants: number
    activeTenants: number
    totalUsers: number
    totalOrders: number
    mrr: number
    subscriptionsByPlan: Array<{
        planId: string
        _count: number
    }>
    revenueByPlan: Array<{
        planName: string
        subscribers: number
        monthlyRevenue: number
    }>
}

class SuperAdminService {
    async getTenants(page: number = 1, limit: number = 20, search: string = '') {
        const response = await api.get('/api/super-admin/tenants', {
            params: { page, limit, search },
        })
        return response.data
    }

    async getTenantById(id: string) {
        const response = await api.get(`/api/super-admin/tenants/${id}`)
        return response.data
    }

    async createTenant(data: CreateTenantData) {
        const response = await api.post('/api/super-admin/tenants', data)
        return response.data
    }

    async activateTenant(id: string) {
        const response = await api.put(`/api/super-admin/tenants/${id}/activate`)
        return response.data
    }

    async deactivateTenant(id: string) {
        const response = await api.put(`/api/super-admin/tenants/${id}/deactivate`)
        return response.data
    }

    async deleteTenant(id: string) {
        const response = await api.delete(`/api/super-admin/tenants/${id}`)
        return response.data
    }

    async getSubscriptions(status?: string) {
        const response = await api.get('/api/super-admin/subscriptions', {
            params: status ? { status } : {},
        })
        return response.data
    }

    async updateSubscription(id: string, data: { planId?: string; status?: string; endDate?: string }) {
        const response = await api.put(`/api/super-admin/subscriptions/${id}`, data)
        return response.data
    }

    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await api.get('/api/super-admin/plans')
        return response.data
    }

    async getAnalytics(): Promise<PlatformAnalytics> {
        const response = await api.get('/api/super-admin/analytics')
        return response.data
    }

    async getTenantStaff(tenantId: string) {
        const response = await api.get(`/api/super-admin/tenants/${tenantId}/staff`)
        return response.data
    }

    async addTenantStaff(tenantId: string, data: any) {
        const response = await api.post(`/api/super-admin/tenants/${tenantId}/staff`, data)
        return response.data
    }

    async getTenantProducts(tenantId: string) {
        const response = await api.get(`/api/super-admin/tenants/${tenantId}/products`)
        return response.data
    }

    async addTenantProduct(tenantId: string, data: any) {
        const response = await api.post(`/api/super-admin/tenants/${tenantId}/products`, data)
        return response.data
    }
}

export interface SubscriptionPlan {
    id: string
    name: string
    priceMonthly: number
    features: string[]
}

export default new SuperAdminService()
