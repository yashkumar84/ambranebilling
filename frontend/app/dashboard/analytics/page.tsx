'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    Filter,
    Activity,
    Target,
    Zap,
    History,
    MoreHorizontal
} from 'lucide-react'
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
    Cell,
    LineChart,
    Line
} from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function AnalyticsPage() {
    // Fetch detailed analytics
    const { data: analyticsData, isLoading } = useQuery({
        queryKey: ['analytics-detailed'],
        queryFn: async () => {
            const response = await api.get(endpoints.orders.analytics('1'))
            return response.data.data
        }
    })

    // Fetch basic stats
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
        { label: 'Total Revenue', value: statsData ? `₹${(statsData.totalRevenue || 0).toLocaleString()}` : '₹0', growth: 12.5, icon: DollarSign, color: 'text-primary-400' },
        { label: 'Orders Processed', value: statsData ? (statsData.totalOrders || 0).toString() : '0', growth: 8.2, icon: ShoppingCart, color: 'text-secondary-400' },
        { label: 'Avg Order Value', value: statsData && (statsData.totalOrders || 0) > 0 ? `₹${Math.round((statsData.totalRevenue || 0) / statsData.totalOrders)}` : '₹0', growth: -2.4, icon: TrendingUp, color: 'text-accent-400' },
        { label: 'Active Sessions', value: statsData ? (statsData.activeTables || 0).toString() : '0', growth: 0, icon: Users, color: 'text-success-400' },
    ]

    const COLORS = ['#06B6D4', '#6366F1', '#F43F5E', '#10B981', '#F59E0B']

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse pb-10">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-white/5 rounded-lg" />
                        <div className="h-4 w-48 bg-white/5 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <Card key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2 h-[400px]" />
                    <Card className="h-[400px]" />
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground mb-0.5">Performance Analytics</h1>
                    <p className="text-xs text-muted-foreground font-medium">Multi-dimensional insights and business intelligence.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-11">
                        <Calendar className="w-4 h-4 mr-2" />
                        Custom Range
                    </Button>
                    <Button className="h-11 shadow-lg shadow-primary/20">
                        <Download className="w-4 h-4 mr-2" />
                        Generate PDF
                    </Button>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-4 transition-all duration-300 hover:border-primary-500/30 group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-500/5 border border-white/5 flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                </div>
                                {stat.growth !== 0 && (
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase border",
                                        stat.growth > 0 ? "bg-success-500/10 text-success-600 border-success-500/20" : "bg-error-500/10 text-error-600 border-error-500/20"
                                    )}>
                                        {stat.growth > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                        {Math.abs(stat.growth)}%
                                    </div>
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-foreground mb-0.5 tracking-tighter group-hover:translate-x-1 transition-transform">{stat.value}</h3>
                            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Insights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Momentum Chart */}
                <Card className="lg:col-span-2 p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" />
                                Revenue Momentum
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Time-series analysis of daily gross revenue</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Earnings</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[340px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenueAnalytics" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    fontWeight={700}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `₹${val}`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        borderColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                        borderWidth: '1px'
                                    }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#06B6D4"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenueAnalytics)"
                                    activeDot={{ r: 6, stroke: '#06B6D4', strokeWidth: 2, fill: '#FFFFFF' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Contribution Breakdown */}
                <Card className="p-8 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                            <PieChartIcon className="w-4 h-4 text-purple-600" />
                            Revenue Contribution
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">Distribution by product category</p>
                    </div>

                    <div className="flex-1 relative min-h-[280px]">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={analyticsData?.revenueByCategory || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {(analyticsData?.revenueByCategory || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Top Sector</span>
                            <span className="text-xl font-black text-foreground">Main Course</span>
                        </div>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-white/5">
                        {(analyticsData?.revenueByCategory || []).map((entry: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-bold text-muted-foreground capitalize">{entry.name}</span>
                                </div>
                                <span className="text-xs font-black text-foreground">₹{entry.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Deep Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hourly Heatmap Preview */}
                <Card className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-600" />
                                Velocity Insights
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">Peak hours and order velocity mapping</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-500"><MoreHorizontal /></Button>
                    </div>

                    <div className="grid grid-cols-12 gap-2">
                        {[...Array(48)].map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-8 rounded-md transition-all duration-500",
                                    i % 12 > 4 && i % 12 < 9 ? "bg-primary-500/40" :
                                        i % 12 > 8 ? "bg-primary-500/10" : "bg-white/[0.02]"
                                )}
                                title={`Hour ${Math.floor(i / 2)}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase">12 AM</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase">12 PM</span>
                        <span className="text-[9px] font-black text-slate-600 uppercase">11 PM</span>
                    </div>
                </Card>

                {/* Retention / Activity Timeline */}
                <Card className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-600" />
                                Efficiency Score
                            </h3>
                            <p className="text-xs text-muted-foreground font-medium">System performance and service latency</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {[
                            { label: 'Order Processing', value: '3.2m', sub: 'Avg prep time', color: 'bg-indigo-500' },
                            { label: 'Table Turnover', value: '42m', sub: 'Avg stay duration', color: 'bg-purple-500' },
                            { label: 'Billing Latency', value: '14s', sub: 'Action to payment', color: 'bg-teal-500' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                                    <span className="text-sm font-black text-foreground">{item.value}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '70%' }}
                                        transition={{ duration: 1, delay: i * 0.2 }}
                                        className={cn("h-full rounded-full", item.color)}
                                    />
                                </div>
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.sub}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
