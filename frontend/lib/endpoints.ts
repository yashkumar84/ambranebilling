// API Endpoints

export const endpoints = {
    // Authentication
    auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        me: '/api/auth/profile',
        sendOtp: '/api/auth/send-otp',
    },

    // Users
    users: {
        list: '/api/users',
        create: '/api/users',
        get: (id: string) => `/api/users/${id}`,
        update: (id: string) => `/api/users/${id}`,
        delete: (id: string) => `/api/users/${id}`,
    },

    // Customers
    customers: {
        list: '/api/customers',
        create: '/api/customers',
        get: (id: string) => `/api/customers/${id}`,
        update: (id: string) => `/api/customers/${id}`,
        delete: (id: string) => `/api/customers/${id}`,
    },

    // Roles
    roles: {
        list: '/api/roles',
        create: '/api/roles',
        get: (id: string) => `/api/roles/${id}`,
        update: (id: string) => `/api/roles/${id}`,
        delete: (id: string) => `/api/roles/${id}`,
        assignPermissions: (id: string) => `/api/roles/${id}/permissions`,
    },

    // Permissions
    permissions: {
        list: '/api/permissions',
        create: '/api/permissions',
        get: (id: string) => `/api/permissions/${id}`,
        update: (id: string) => `/api/permissions/${id}`,
        delete: (id: string) => `/api/permissions/${id}`,
    },

    // Menu
    menu: {
        list: (restaurantId: string) => `/api/menu/restaurant/${restaurantId}`,
        create: '/api/menu',
        get: (id: string) => `/api/menu/${id}`,
        update: (id: string) => `/api/menu/${id}`,
        delete: (id: string) => `/api/menu/${id}`,
    },

    // Tables
    tables: {
        list: (restaurantId: string) => `/api/tables/restaurant/${restaurantId}`,
        create: '/api/tables',
        get: (id: string) => `/api/tables/${id}`,
        update: (id: string) => `/api/tables/${id}`,
        delete: (id: string) => `/api/tables/${id}`,
        updateStatus: (id: string) => `/api/tables/${id}/status`,
    },

    // Orders
    orders: {
        list: '/api/orders',
        create: '/api/orders',
        get: (id: string) => `/api/orders/${id}`,
        update: (id: string) => `/api/orders/${id}`,
        delete: (id: string) => `/api/orders/${id}`,
        updateStatus: (id: string) => `/api/orders/${id}/status`,
        stats: (restaurantId: string) => `/api/orders/stats/restaurant/${restaurantId}`,
        analytics: (restaurantId: string) => `/api/orders/analytics/restaurant/${restaurantId}`,
        invoice: (id: string) => `/api/orders/${id}/invoice`,
        receipt: (id: string) => `/api/orders/${id}/receipt`,
    },

    // Payments
    payments: {
        list: '/api/payments',
        create: '/api/payments',
        get: (id: string) => `/api/payments/${id}`,
        stats: '/api/payments/stats',
    },

    // Analytics
    analytics: {
        dashboard: '/api/analytics/dashboard',
        trends: (days: number = 7) => `/api/analytics/trends?days=${days}`,
    },

    // Tenants
    tenants: {
        me: '/api/tenants/me',
        update: (id: string) => `/api/tenants/${id}`,
        settings: '/api/tenants/settings',
        logo: '/api/tenants/logo',
        subscription: '/api/tenants/subscription',
        usage: '/api/tenants/usage',
    },

    // Super Admin
    superAdmin: {
        tenants: '/api/super-admin/tenants',
        plans: '/api/super-admin/plans',
        subscriptions: '/api/super-admin/subscriptions',
        analytics: '/api/super-admin/analytics',
    },
}

export default endpoints
