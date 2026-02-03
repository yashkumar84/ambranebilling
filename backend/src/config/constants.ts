export const APP_CONSTANTS = {
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Cache TTL (in seconds)
    CACHE_TTL: {
        SHORT: 60,        // 1 minute
        MEDIUM: 300,      // 5 minutes
        LONG: 1800,       // 30 minutes
        VERY_LONG: 3600,  // 1 hour
    },

    // Order statuses
    ORDER_STATUS: {
        PENDING: 'pending',
        PREPARING: 'preparing',
        READY: 'ready',
        SERVED: 'served',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
    },

    // Payment methods
    PAYMENT_METHOD: {
        CASH: 'cash',
        CARD: 'card',
        UPI: 'upi',
        WALLET: 'wallet',
    },

    // User roles
    USER_ROLE: {
        ADMIN: 'admin',
        MANAGER: 'manager',
        STAFF: 'staff',
        WAITER: 'waiter',
    },

    // Table statuses
    TABLE_STATUS: {
        VACANT: 'vacant',
        OCCUPIED: 'occupied',
        RESERVED: 'reserved',
    },
} as const
