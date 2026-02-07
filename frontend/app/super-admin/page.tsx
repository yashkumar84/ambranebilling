'use client'

import { useEffect } from 'react'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'
import {
    Users,
    ShoppingCart,
    DollarSign,
    Building2,
    Plus,
    LayoutDashboard,
    CreditCard,
    TrendingUp,
    ArrowUpRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function SuperAdminDashboard() {
    const { analytics, analyticsLoading, fetchAnalytics } = useSuperAdminStore()

    useEffect(() => {
        fetchAnalytics()
    }, [fetchAnalytics])

    if (analyticsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading analytics...</div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-2">
                        <LayoutDashboard className="w-8 h-8 text-primary" />
                        Platform Analytics
                    </h1>
                    <p className="text-muted-foreground font-medium">Overview of your SaaS platform performance</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => window.location.href = '/super-admin/stores/create'}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Store
                    </Button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Tenants', value: analytics?.totalTenants || 0, sub: `${analytics?.activeTenants || 0} active`, icon: Building2, color: 'primary' },
                    { label: 'Total Users', value: analytics?.totalUsers || 0, sub: 'Across all tenants', icon: Users, color: 'secondary' },
                    { label: 'Total Orders', value: (analytics?.totalOrders || 0).toLocaleString(), sub: 'All time volume', icon: ShoppingCart, color: 'accent' },
                    { label: 'MRR', value: `₹${(analytics?.mrr || 0).toLocaleString()}`, sub: 'Monthly Recurring', icon: DollarSign, color: 'success' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card isHoverable className="p-6 relative overflow-hidden group">
                            <div className={cn(
                                "absolute -right-4 -top-4 w-20 h-20 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
                                stat.color === 'primary' ? "bg-primary-500" :
                                    stat.color === 'secondary' ? "bg-secondary-500" :
                                        stat.color === 'accent' ? "bg-accent-500" : "bg-success-500"
                            )} />

                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                    stat.color === 'primary' ? "bg-primary/10 text-primary" :
                                        stat.color === 'secondary' ? "bg-secondary/10 text-secondary" :
                                            stat.color === 'accent' ? "bg-accent/10 text-accent" : "bg-success-500/10 text-success-500"
                                )}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Live</div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black text-foreground mb-1">{stat.value}</h3>
                                <p className="text-xs font-medium text-muted-foreground">{stat.sub}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue by Plan */}
                <Card className="lg:col-span-2 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-1">Revenue by Plan</h3>
                            <p className="text-sm text-muted-foreground font-medium">Distribution of MRR across different subscription tiers</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-primary opacity-50" />
                    </div>

                    <div className="space-y-8">
                        {analytics?.revenueByPlan?.map((plan, i) => (
                            <div key={plan.planName} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-sm font-bold text-foreground capitalize">{plan.planName}</span>
                                        <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
                                            {plan.subscribers} Users
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-black text-foreground">₹{plan.monthlyRevenue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${analytics.mrr > 0 ? (plan.monthlyRevenue / analytics.mrr) * 100 : 0}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="gradient-primary h-full rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-8">
                    <h3 className="text-xl font-bold text-foreground mb-6">Quick Management</h3>
                    <div className="space-y-3">
                        {[
                            { label: 'View All Stores', href: '/super-admin/stores', icon: Building2, desc: 'Manage tenant details & status' },
                            { label: 'Manage Plans', href: '/super-admin/subscriptions', icon: CreditCard, desc: 'Edit pricing & features' },
                            { label: 'System Logs', href: '#', icon: ShoppingCart, desc: 'Audit trail for platform' },
                        ].map((action, i) => (
                            <a
                                key={i}
                                href={action.href}
                                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground mb-0.5">{action.label}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium truncate">{action.desc}</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                            </a>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    )
}
