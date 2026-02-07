export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        totalPages?: number;
    };
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF' | 'WAITER';

export interface RoleObject {
    id: string;
    name: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    tenantId?: string;
    isSuperAdmin?: boolean;
    roleId?: string;
    roleName?: string;
    isActive: boolean;
    createdAt?: string;
    role?: RoleObject;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
    id: string;
    orderNumber: string;
    tableId?: string;
    userId: string;
    status: OrderStatus;
    paymentStatus?: PaymentStatus;
    paymentMethod?: PaymentMethod;
    totalAmount: number;
    total?: number; // Alias for backward compatibility
    createdAt: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;
    menuItemId: string;
    quantity: number;
    price: number;
    subtotal: number;
    menuItem: MenuItem;
}

export interface MenuItem {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    image?: string;
    isAvailable: boolean;
    isVeg: boolean;
    variants?: Partial<MenuItemVariant>[];
}

export interface MenuItemVariant {
    id: string;
    variantName: string;
    priceAdjustment: number;
    variantSku?: string;
    isActive: boolean;
}

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';

export interface Table {
    id: string;
    number: string;
    capacity: number;
    status: TableStatus;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    createdAt: string;
    orders?: any[]; // For details view
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions?: Permission[];
    createdAt: string;
    updatedAt: string;
}

export interface Permission {
    id: string;
    resource: string;
    action: string;
    description?: string;
    createdAt: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Payment {
    id: string;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

