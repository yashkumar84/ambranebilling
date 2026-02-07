'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    ShoppingCart,
    Users,
    TrendingUp,
    DollarSign,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Clock,
    CheckCircle2,
    Play,
    Calendar,
    ArrowRight,
    UtensilsCrossed,
    UsersRound,
    Download
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { useQuery } from '@tanstack/react-query'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
    const { user } = useAuthStore()
    const router = useRouter()

    // 1. Fetch Dashboard Metrics
    const { data: metrics, isLoading: isMetricsLoading } = useQuery({
        queryKey: ['analytics-dashboard'],
        queryFn: async () => {
            const response = await api.get(endpoints.analytics.dashboard)
            return response.data.data
        },
        enabled: !!user,
        refetchInterval: 60000,
    })

    // 2. Fetch Sales Trends
    const { data: trends, isLoading: isTrendsLoading } = useQuery({
        queryKey: ['analytics-trends'],
        queryFn: async () => {
            const response = await api.get(endpoints.analytics.trends(7))
            return response.data.data
        },
        enabled: !!user,
    })

    // 3. Fetch Recent Orders (Can use existing orders list for now or a dedicated list)
    const { data: recentOrdersData, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['recent-orders'],
        queryFn: async () => {
            const response = await api.get(endpoints.orders.list, { params: { limit: 5 } })
            return response.data.data.items
        },
        enabled: !!user,
    })

    const statCards = [
        {
            label: 'Total Revenue',
            value: metrics?.revenue?.current ? `₹${metrics.revenue.current.toLocaleString()}` : '₹0',
            growth: metrics?.revenue?.growth || 0,
            icon: DollarSign,
            color: 'primary'
        },
        {
            label: 'Total Orders',
            value: metrics?.orders?.current?.toString() || '0',
            growth: metrics?.orders?.growth || 0,
            icon: ShoppingCart,
            color: 'secondary'
        },
        {
            label: 'Active Customers',
            value: metrics?.customers?.toString() || '0',
            growth: 12.5, // Mocked for now
            icon: Users,
            color: 'primary'
        },
        {
            label: 'Active Products',
            value: metrics?.products?.toString() || '0',
            growth: 4.2, // Mocked for now
            icon: Package,
            color: 'accent'
        },
    ]

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                    <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                    <p className="text-sm font-black text-white">
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Good morning, {user?.email?.split('@')[0]}
                    </h1>
                    <p className="text-slate-400 font-medium">
                        Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 7 Days
                    </Button>
                    <Button className="h-10 px-4">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            {/* Dashboard Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {isMetricsLoading ? (
                    [...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                            <Skeleton className="h-8 w-24 mb-2" />
                            <Skeleton className="h-4 w-32" />
                        </Card>
                    ))
                ) : (
                    statCards.map((stat, index) => {
                        const Icon = stat.icon
                        const isPositive = stat.growth >= 0
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="p-4 relative overflow-hidden group hover:border-primary-500/30 transition-all duration-500">
                                    {/* Decorative Gradient Blur */}
                                    <div className={cn(
                                        "absolute -right-4 -top-4 w-20 h-20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity",
                                        stat.color === 'primary' ? "bg-primary-500" :
                                            stat.color === 'secondary' ? "bg-secondary-500" : "bg-accent-500"
                                    )} />

                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                            stat.color === 'primary' ? "bg-primary-500/10 text-primary-400" :
                                                stat.color === 'secondary' ? "bg-secondary-500/10 text-secondary-400" :
                                                    "bg-accent-500/10 text-accent-400"
                                        )}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
                                                {stat.label}
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-xl font-black text-foreground">
                                                    {stat.value}
                                                </h3>
                                                <div className={cn(
                                                    "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full border",
                                                    isPositive
                                                        ? "text-success-400 bg-success-400/10 border-success-400/20"
                                                        : "text-error-400 bg-error-400/10 border-error-400/20"
                                                )}>
                                                    {isPositive ? (
                                                        <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" />
                                                    ) : (
                                                        <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />
                                                    )}
                                                    {Math.abs(stat.growth)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )
                    })
                )}
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trends Chart */}
                <Card className="lg:col-span-2 p-6 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                Revenue Trends
                                <span className="text-[10px] text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded-full border border-primary-400/20">
                                    Sales
                                </span>
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Daily revenue insights for the past week</p>
                        </div>
                        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                            {['7D', '1M', '3M'].map(t => (
                                <button key={t} className={cn(
                                    "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                                    t === '7D' ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-white"
                                )}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-[320px] w-full">
                        {isTrendsLoading ? (
                            <Skeleton className="w-full h-full rounded-2xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.05} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        opacity={0.5}
                                        fontSize={10}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            const d = new Date(str)
                                            return d.toLocaleDateString(undefined, { weekday: 'short' })
                                        }}
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        opacity={0.5}
                                        fontSize={10}
                                        fontWeight={600}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `₹${val}`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#06B6D4"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2, fill: '#FFFFFF' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Performance Analytics - 1/3 Width */}
                <Card className="p-8 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-foreground tracking-tight">Recent Activity</h3>
                        <p className="text-xs text-muted-foreground font-medium">Latest orders and system logs</p>
                    </div>

                    <div className="flex-1 space-y-6">
                        {isOrdersLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>
                            ))
                        ) : recentOrdersData?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 opacity-50">
                                <Clock className="w-10 h-10 text-slate-600 mb-4" />
                                <p className="text-sm font-bold text-slate-500">No activity found</p>
                            </div>
                        ) : (
                            recentOrdersData?.map((order: any, idx: number) => (
                                <div key={order.id} className="flex items-start gap-4 group cursor-pointer">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ring-1 ring-white/5 transition-colors group-hover:ring-primary-500/30",
                                        order.status === 'COMPLETED' ? "bg-success-500/10 text-success-400" : "bg-primary-500/10 text-primary-400"
                                    )}>
                                        {order.orderNumber?.slice(-2) || 'OR'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-sm font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                                                Order #{order.orderNumber}
                                            </p>
                                            <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap ml-2">
                                                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground font-medium italic">
                                            ₹{order.totalAmount.toLocaleString()} • {order.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <Button variant="ghost" className="w-full mt-6 text-slate-400 hover:text-white hover:bg-white/5 font-bold text-xs group">
                        View Audit Log
                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Card>
            </div>

            {/* Quick Actions / Getting Started */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-800 border-none relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                            <Plus className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Create New Order</h3>
                        <p className="text-white/70 text-sm font-medium mb-6">Start a new billing session for a table or takeaway.</p>
                        <Button className="bg-white text-primary-700 hover:bg-white/90 font-bold shadow-xl border-none">
                            Get Started
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 group hover:border-border transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-500/10 transition-colors">
                        <UtensilsCrossed className="w-6 h-6 text-primary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Manage Inventory</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-6">Update menu items, categories, and stock levels effortlessly.</p>
                    <button className="text-xs font-black text-foreground uppercase tracking-wider flex items-center group-hover:text-primary-400 transition-colors">
                        Open Menu Manager <ArrowRight className="w-3 h-3 ml-2" />
                    </button>
                </Card>

                <Card className="p-6 group hover:border-border transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary-500/10 transition-colors">
                        <UsersRound className="w-6 h-6 text-secondary-400" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">Customer Khata</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-6">View credit balances and manage loyalty points for regular patrons.</p>
                    <button className="text-xs font-black text-foreground uppercase tracking-wider flex items-center group-hover:text-secondary-400 transition-colors">
                        View Ledgers <ArrowRight className="w-3 h-3 ml-2" />
                    </button>
                </Card>
            </div>
        </div>
    )
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
