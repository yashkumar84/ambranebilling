'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Search, Filter, ShieldCheck, AlertCircle, Clock, Building2 } from 'lucide-react'
import api from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import { ApiResponse } from '@/types'
import { toast } from 'sonner'

interface Subscription {
    id: string
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    startDate: string
    endDate: string
    plan: {
        id: string
        name: string
    }
    tenant: {
        id: string
        businessName: string
        email: string
        _count?: {
            users: number
            products: number
            orders: number
        }
    }
}

export default function SubscriptionsManagementPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')

    useEffect(() => {
        fetchSubscriptions()
    }, [])

    const fetchSubscriptions = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Subscription[]>>(endpoints.superAdmin.subscriptions)
            setSubscriptions(response.data.data)
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch subscriptions')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-500'
            case 'TRIAL': return 'bg-blue-500/10 text-blue-500'
            case 'EXPIRED': return 'bg-amber-500/10 text-amber-500'
            case 'CANCELLED': return 'bg-rose-500/10 text-rose-500'
            default: return 'bg-muted text-muted-foreground'
        }
    }

    const filteredSubscriptions = (subscriptions || []).filter(sub => {
        const matchesSearch = sub.tenant?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.tenant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Active Subscriptions</h1>
                    <p className="text-muted-foreground">Monitor and manage all tenant subscription lifecycles.</p>
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-card border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="TRIAL">Trial</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-card border border-border rounded-3xl animate-pulse" />
                    ))
                ) : filteredSubscriptions.length === 0 ? (
                    <div className="col-span-full py-20 bg-card border border-border rounded-3xl border-dashed flex flex-col items-center text-muted-foreground">
                        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p className="font-bold">No subscriptions found</p>
                    </div>
                ) : filteredSubscriptions.map((sub) => (
                    <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-3xl p-6 relative overflow-hidden group hover:border-primary/50 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-black tracking-tight text-lg line-clamp-1">{sub.tenant.businessName}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{sub.tenant.email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(sub.status)}`}>
                                {sub.status}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {sub.tenant._count && (
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-muted px-3 py-2 rounded-xl text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Orders</p>
                                        <p className="font-black text-xs">{sub.tenant._count.orders}</p>
                                    </div>
                                    <div className="bg-muted px-3 py-2 rounded-xl text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Products</p>
                                        <p className="font-black text-xs">{sub.tenant._count.products}</p>
                                    </div>
                                    <div className="bg-muted px-3 py-2 rounded-xl text-center">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Staff</p>
                                        <p className="font-black text-xs">{sub.tenant._count.users}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Plan</span>
                                    <span className="font-bold text-primary italic uppercase tracking-tighter">
                                        <ShieldCheck className="w-3 h-3 inline mr-1" />
                                        {sub.plan.name}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Auto Renew</span>
                                    <span className="font-bold">Enabled</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Date</p>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                        {new Date(sub.startDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expiry Date</p>
                                    <div className="flex items-center justify-end gap-2 text-xs font-bold">
                                        <Clock className="w-3 h-3 text-rose-500" />
                                        {new Date(sub.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border border-dashed flex gap-3">
                            <button className="flex-1 py-2 bg-muted hover:bg-muted/80 text-xs font-bold rounded-xl transition-all">
                                Extend Plan
                            </button>
                            <button className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all">
                                Change Plan
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
