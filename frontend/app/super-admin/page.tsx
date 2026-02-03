'use client'

import { useEffect } from 'react'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'

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
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
                <p className="text-muted-foreground mt-1">Overview of your SaaS platform</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                    <div className="text-sm font-medium text-muted-foreground">Total Tenants</div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{analytics?.totalTenants || 0}</div>
                    <div className="mt-2 text-sm text-accent">
                        {analytics?.activeTenants || 0} active
                    </div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                    <div className="text-sm font-medium text-muted-foreground">Total Users</div>
                    <div className="mt-2 text-3xl font-bold text-foreground">{analytics?.totalUsers || 0}</div>
                    <div className="mt-2 text-sm text-muted-foreground">Across all tenants</div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                    <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
                    <div className="mt-2 text-3xl font-bold text-foreground">
                        {analytics?.totalOrders?.toLocaleString() || 0}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">All time</div>
                </div>

                <div className="bg-card rounded-lg shadow-lg p-6 border border-border gradient-primary">
                    <div className="text-sm font-medium text-white opacity-90">MRR</div>
                    <div className="mt-2 text-3xl font-bold text-white">
                        ₹{analytics?.mrr?.toLocaleString() || 0}
                    </div>
                    <div className="mt-2 text-sm text-white opacity-80">Monthly Recurring Revenue</div>
                </div>
            </div>

            {/* Revenue by Plan */}
            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Revenue by Plan</h2>
                <div className="space-y-4">
                    {analytics?.revenueByPlan?.map((plan) => (
                        <div key={plan.planName} className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-foreground">{plan.planName}</span>
                                    <span className="text-sm text-muted-foreground">
                                        {plan.subscribers} subscriber{plan.subscribers !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="gradient-primary h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${analytics.mrr > 0 ? (plan.monthlyRevenue / analytics.mrr) * 100 : 0
                                                }%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="ml-4 text-sm font-semibold text-foreground">
                                ₹{plan.monthlyRevenue.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/super-admin/stores/create"
                        className="flex items-center justify-center px-4 py-3 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
                    >
                        + Create New Store
                    </a>
                    <a
                        href="/super-admin/stores"
                        className="flex items-center justify-center px-4 py-3 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
                    >
                        View All Stores
                    </a>
                    <a
                        href="/super-admin/subscriptions"
                        className="flex items-center justify-center px-4 py-3 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-card hover:bg-muted transition-colors"
                    >
                        Manage Subscriptions
                    </a>
                </div>
            </div>
        </div>
    )
}
