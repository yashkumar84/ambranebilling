'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Search,
    Filter,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    ChevronRight,
    MoreHorizontal,
    RotateCcw,
    DollarSign,
    Calendar,
    ArrowUpRight,
    Play,
    Truck,
    CheckCircle,
    Printer,
    Coins,
    QrCode,
    CreditCard as CardIcon,
    FileText
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useOrderStore } from '@/store/useOrderStore'
import { OrderStatus } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { orderService } from '@/services/orderService'

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
            toast.success('Order status updated', {
                description: `Order #${(orders || []).find(o => o.id === id)?.orderNumber} is now ${status.toLowerCase()}.`
            })
        } catch (error: any) {
            toast.error('Update failed', {
                description: 'Could not update order status. Please try again.'
            })
        }
    }

    const handleRefund = async (id: string) => {
        try {
            await api.post(endpoints.orders.get(id) + '/refund')
            await fetchOrders()
            toast.success('Refund processed', {
                description: 'The order has been cancelled and refunded successfully.'
            })
        } catch (error: any) {
            toast.error('Refund failed', {
                description: error.response?.data?.message || 'Could not process refund.'
            })
        }
    }

    const handleDownloadA4 = async (id: string, orderNumber: string) => {
        try {
            await orderService.downloadA4Invoice(id, orderNumber)
            toast.success('Invoice generated', {
                description: `A4 Invoice for order #${orderNumber} has been downloaded.`
            })
        } catch (error: any) {
            toast.error('Download failed', {
                description: 'Could not generate invoice. Please try again.'
            })
        }
    }

    const handlePrintThermal = async (id: string) => {
        try {
            await orderService.downloadReceipt(id)
            toast.success('Receipt ready', {
                description: 'Thermal receipt has been sent to the printer.'
            })
        } catch (error: any) {
            toast.error('Print failed', {
                description: 'Could not generate thermal receipt.'
            })
        }
    }

    const filteredOrders = (orders || []).filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.tableId?.toString().includes(searchQuery)
        const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusConfig = (status: OrderStatus) => {
        switch (status) {
            case 'PENDING': return {
                color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                icon: Clock,
                label: 'Pending'
            }
            case 'PREPARING': return {
                color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                icon: Play,
                label: 'Preparing'
            }
            case 'READY': return {
                color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                icon: Package,
                label: 'Ready'
            }
            case 'SERVED': return {
                color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
                icon: Truck,
                label: 'Served'
            }
            case 'COMPLETED': return {
                color: 'text-success-400 bg-success-400/10 border-success-400/20',
                icon: CheckCircle2,
                label: 'Completed'
            }
            case 'CANCELLED': return {
                color: 'text-error-400 bg-error-400/10 border-error-400/20',
                icon: XCircle,
                label: 'Cancelled'
            }
            default: return {
                color: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
                icon: Clock,
                label: status
            }
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Orders</h1>
                    <p className="text-slate-400 font-medium">Manage and track your restaurant's orders in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-white hover:bg-white/10">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Summaries
                    </Button>
                    <Button className="h-10">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats / Mini Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', count: (orders || []).filter(o => o.status === 'PENDING').length, color: 'text-yellow-400' },
                    { label: 'In Kitchen', count: (orders || []).filter(o => o.status === 'PREPARING').length, color: 'text-blue-400' },
                    { label: 'Ready', count: (orders || []).filter(o => o.status === 'READY').length, color: 'text-purple-400' },
                    { label: 'Completed Today', count: (orders || []).filter(o => o.status === 'COMPLETED').length, color: 'text-success-400' },
                ].map((stat, i) => (
                    <Card key={i} className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <p className={cn("text-2xl font-black", stat.color)}>{stat.count}</p>
                    </Card>
                ))}
            </div>

            {/* Filters Section */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                                    statusFilter === status
                                        ? "bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-lg shadow-primary-500/10"
                                        : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10"
                                )}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(5)].map((_, i) => (
                            <motion.div key={`skeleton-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Card className="p-6 h-24" />
                            </motion.div>
                        ))
                    ) : filteredOrders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 px-4 bg-muted/30 border border-dashed border-border rounded-[2rem]"
                        >
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                                <Package className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No orders found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs text-center font-medium">
                                We couldn't find any orders matching your current filters. Try adjusting your search criteria.
                            </p>
                        </motion.div>
                    ) : (
                        filteredOrders.map((order, idx) => {
                            const config = getStatusConfig(order.status)
                            const Icon = config.icon
                            return (
                                <motion.div
                                    layout
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                                >
                                    <Card isHoverable className="group overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                                                {/* Start Section: ID & Table */}
                                                <div className="flex items-center gap-4 min-w-[180px]">
                                                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground group-hover:bg-primary-500/10 group-hover:text-primary transition-all">
                                                        #{order.orderNumber.slice(-4)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-foreground truncate max-w-[120px]">
                                                            {order.tableId ? `Table ${order.tableId}` : 'Takeaway'}
                                                        </h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <Clock className="w-3 h-3 text-muted-foreground" />
                                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Items Info */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.items?.map((item, i) => (
                                                            <span key={i} className="px-2.5 py-1 rounded-lg bg-muted/50 border border-border text-[10px] font-extrabold text-foreground">
                                                                <span className="text-primary mr-1">{item.quantity}x</span>
                                                                {item.menuItem?.name || 'Item'}
                                                            </span>
                                                        ))}
                                                        {(!order.items || order.items.length === 0) && (
                                                            <span className="text-xs text-muted-foreground font-medium italic">General Order</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Amount & Status */}
                                                <div className="flex items-center justify-between md:justify-end gap-6 md:min-w-[240px]">
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-0.5">Total</p>
                                                        <p className="text-lg font-black text-foreground tracking-tight">₹{(order.totalAmount || 0).toLocaleString()}</p>
                                                    </div>

                                                    <div className={cn(
                                                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                                                        config.color
                                                    )}>
                                                        <Icon className="w-3.5 h-3.5" />
                                                        {config.label}
                                                    </div>

                                                    {/* Payment Method Badge */}
                                                    {order.paymentMethod && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg border border-border">
                                                            {order.paymentMethod === 'UPI' && <QrCode className="w-3 h-3 text-primary" />}
                                                            {order.paymentMethod === 'CASH' && <Coins className="w-3 h-3 text-yellow-500" />}
                                                            {order.paymentMethod === 'CARD' && <CardIcon className="w-3 h-3 text-blue-500" />}
                                                            <span className="text-[8px] font-black uppercase text-muted-foreground">{order.paymentMethod}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                                                    {order.status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-9 px-4 hidden lg:flex"
                                                            onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                                        >
                                                            Start Cooking
                                                        </Button>
                                                    )}
                                                    {order.status === 'PREPARING' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-9 px-4 hidden lg:flex"
                                                            onClick={() => handleStatusUpdate(order.id, 'READY')}
                                                        >
                                                            Mark Ready
                                                        </Button>
                                                    )}
                                                    {order.status === 'READY' && (
                                                        <Button
                                                            size="sm"
                                                            className="h-9 px-4 hidden lg:flex"
                                                            onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                                                        >
                                                            Finish Order
                                                        </Button>
                                                    )}
                                                    {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 border-error-500/20 text-error-400 hover:bg-error-500/10"
                                                            onClick={() => handleRefund(order.id)}
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    )}

                                                    {/* Print Options: A4 Invoice & Thermal Receipt */}
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9 border-primary/20 text-primary hover:bg-primary/10"
                                                        onClick={() => handleDownloadA4(order.id, order.orderNumber)}
                                                        title="Download A4 Invoice"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                        onClick={() => handlePrintThermal(order.id)}
                                                        title="Print Thermal Receipt"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </Button>

                                                    <Button variant="outline" size="icon" className="h-9 w-9">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })
                    )}
                </AnimatePresence >
            </div >
        </div >
    )
}
