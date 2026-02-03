'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    Settings,
    LogOut,
    Menu as MenuIcon,
    X,
    TrendingUp,
    DollarSign,
    Package,
    Clock,
    ChefHat,
} from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import NewOrderModal from '@/components/NewOrderModal'
import { applyTheme, getStoredTheme } from '@/lib/theme'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/useUserStore'
import { useOrderStore } from '@/store/useOrderStore'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const router = useRouter()
    const { users, fetchUsers } = useUserStore()

    // We'll keep the dashboard stats query separate as it aggregates data differently than the order store list
    const { data: statsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get(endpoints.orders.stats('1'))
            return response.data.data
        },
        enabled: !!user,
        refetchInterval: 30000,
    })

    useEffect(() => {
        if (users.length === 0) fetchUsers()
    }, [])

    const staffCount = users.filter(u => u.roleName !== 'CUSTOMER' && u.isActive).length

    const statCards = [
        {
            label: 'Total Revenue',
            value: statsData?.totalRevenue ? `₹${statsData.totalRevenue.toLocaleString()}` : '₹0',
            change: '+12.5%',
            icon: <DollarSign className="w-6 h-6" />,
            gradient: 'gradient-primary',
            permission: 'reports:view_sales'
        },
        {
            label: 'Total Orders',
            value: statsData?.totalOrders?.toString() || '0',
            change: '+8.2%',
            icon: <ShoppingCart className="w-6 h-6" />,
            gradient: 'gradient-secondary',
            permission: 'billing:view'
        },
        {
            label: 'Active Tables',
            value: statsData?.activeTables?.toString() || '0',
            change: 'Live',
            icon: <Package className="w-6 h-6" />,
            gradient: 'gradient-accent',
            permission: 'tables:view'
        },
        {
            label: 'Active Staff',
            value: staffCount.toString(),
            change: 'Online',
            icon: <Users className="w-6 h-6" />,
            gradient: 'gradient-primary',
            permission: 'users:view'
        },
    ].filter(card => {
        if (!card.permission) return true
        if (user?.isSuperAdmin) return true
        return user?.permissions?.includes(card.permission) || user?.permissions?.includes('*:*')
    })

    const recentOrders = statsData?.recentOrders || []

    return (
        <div className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {isStatsLoading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-card/95 animate-pulse h-32 rounded-2xl border border-border" />
                    ))
                ) : (
                    statCards.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-card/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${stat.change.startsWith('+') || stat.change === 'Live' || stat.change === 'Online'
                                    ? 'bg-green-500/10 text-green-500'
                                    : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
                            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-border"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-foreground">Recent Orders</h3>
                    <button
                        onClick={() => router.push('/dashboard/orders')}
                        className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
                    >
                        View All →
                    </button>
                </div>
                <div className="space-y-3">
                    {isStatsLoading ? (
                        [...Array(5)].map((_, i) => (
                            <div key={i} className="bg-muted animate-pulse h-20 rounded-xl" />
                        ))
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">No recent orders found</p>
                        </div>
                    ) : (
                        recentOrders.map((order: any) => (
                            <motion.div
                                key={order.id}
                                whileHover={{ x: 5, scale: 1.01 }}
                                className="flex items-center justify-between p-4 rounded-xl hover:bg-muted transition-all duration-300 border border-transparent hover:border-border"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                                        {order.tableNumber ? `T${order.tableNumber}` : 'O'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {order.tableNumber ? `Table ${order.tableNumber}` : `Order #${order.orderNumber}`}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <p className="text-lg font-bold text-foreground">₹{order.total.toLocaleString()}</p>
                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${order.status === 'COMPLETED'
                                        ? 'bg-green-500/10 text-green-500'
                                        : order.status === 'PREPARING'
                                            ? 'bg-blue-500/10 text-blue-500'
                                            : order.status === 'PENDING'
                                                ? 'bg-yellow-500/10 text-yellow-500'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    )
}
