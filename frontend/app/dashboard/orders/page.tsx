'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useOrderStore } from '@/store/useOrderStore'
import { OrderStatus } from '@/types'

export default function OrdersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL')
    const { orders, loading, fetchOrders, updateOrderStatus } = useOrderStore()

    useEffect(() => {
        fetchOrders()
    }, [])

    const handleStatusUpdate = async (id: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(id, status)
            toast.success('Order status updated successfully')
        } catch (error: any) {
            toast.error('Failed to update order status')
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tableId?.toString().includes(searchQuery)
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
            case 'PREPARING': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            case 'READY': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            case 'COMPLETED': return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            case 'CANCELLED': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }
    }

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4" />
            case 'PREPARING': return <Package className="w-4 h-4" />
            case 'READY': return <CheckCircle className="w-4 h-4" />
            case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
            case 'CANCELLED': return <XCircle className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Orders</h1>
                    <p className="text-muted-foreground mt-1">Manage and track all orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by order number or table..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                            className="pl-12 pr-10 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="READY">Ready</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {loading && orders.length === 0 ? (
                    [...Array(5)].map((_, i) => (
                        <div key={i} className="bg-card animate-pulse h-32 rounded-2xl" />
                    ))
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center border border-border">
                        <Package className="w-16 h-16 text-muted mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No orders found</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h3 className="text-xl font-bold text-foreground">
                                            Order #{order.orderNumber}
                                        </h3>
                                        {order.tableId && (
                                            <span className="px-3 py-1 bg-muted text-foreground rounded-lg text-sm font-medium border border-border">
                                                Table {order.tableId}
                                            </span>
                                        )}
                                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <span>{formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</span>
                                        <span>{order.items?.length || 0} items</span>
                                        <span className="text-lg font-bold text-foreground">₹{order.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Status Actions */}
                                <div className="flex items-center gap-2">
                                    {order.status === 'PENDING' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(order.id.toString(), 'PREPARING')}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                        >
                                            Start Preparing
                                        </motion.button>
                                    )}
                                    {order.status === 'PREPARING' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(order.id.toString(), 'READY')}
                                            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
                                        >
                                            Mark Ready
                                        </motion.button>
                                    )}
                                    {order.status === 'READY' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(order.id.toString(), 'COMPLETED')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                                        >
                                            Complete
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
