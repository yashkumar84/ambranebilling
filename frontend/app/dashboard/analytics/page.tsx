'use client'

import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, ShoppingCart, Users, PieChart as PieChartIcon, BarChart3, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
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
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'

export default function AnalyticsPage() {
    // Fetch detailed analytics
    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['analytics-detailed'],
        queryFn: async () => {
            // Using restaurantId 1 for now
            const response = await api.get(endpoints.orders.analytics('1'))
            return response.data.data
        }
    })

    // Fetch basic stats for top cards
    const { data: statsData } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get(endpoints.orders.stats('1'))
            return response.data.data
        }
    })

    const chartData = analyticsData?.last7Days ?
        [...Array(7)].map((_, i) => {
            const date = subDays(new Date(), 6 - i)
            const dateStr = format(date, 'MMM dd')
            const total = analyticsData.last7Days
                .filter((o: any) => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))
                .reduce((sum: number, o: any) => sum + o.total, 0)
            return { name: dateStr, revenue: total }
        }) : []

    const stats = [
        { label: 'Total Revenue', value: statsData ? `₹${statsData.totalRevenue.toLocaleString()}` : '₹0', change: '+12.5%', icon: DollarSign },
        { label: 'Total Orders', value: statsData ? statsData.totalOrders.toString() : '0', change: '+8.2%', icon: ShoppingCart },
        { label: 'Avg Order Value', value: statsData && statsData.totalOrders > 0 ? `₹${Math.round(statsData.totalRevenue / statsData.totalOrders)}` : '₹0', change: '+5.1%', icon: TrendingUp },
        { label: 'Active Tables', value: statsData ? statsData.activeTables.toString() : '0', change: 'Live', icon: Users },
    ]

    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#0088FE', '#00C49F']

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-card rounded-2xl w-1/3" />
                <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-2xl" />)}
                </div>
                <div className="h-[400px] bg-card rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Performance Analytics</h1>
                    <p className="text-muted-foreground mt-1">Real-time insights for your restaurant</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-muted transition-colors">
                        <Calendar className="w-4 h-4" />
                        Last 7 Days
                    </button>
                </div>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <stat.icon className="w-6 h-6 text-primary" />
                            </div>
                            <span className={`text-xs font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-foreground mb-1">{stat.value}</h3>
                        <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-secondary" />
                            </div>
                            <h3 className="text-xl font-black text-foreground">Revenue Trend</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `₹${value}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--foreground)',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Categories Chart */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <PieChartIcon className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-xl font-black text-foreground">Revenue by Category</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData?.revenueByCategory || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(analyticsData?.revenueByCategory || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        borderRadius: '12px',
                                        color: 'var(--foreground)'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {(analyticsData?.revenueByCategory || []).map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                <span className="text-xs font-bold text-muted-foreground truncate">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
