'use client'

import { motion } from 'framer-motion'
import { CreditCard, DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePaymentStore } from '@/store/usePaymentStore'
import { Payment, PaymentMethod, PaymentStatus } from '@/types'
import { format } from 'date-fns'

export default function PaymentsPage() {
    const { payments, loading, fetchPayments } = usePaymentStore()
    const [filterMethod, setFilterMethod] = useState<PaymentMethod | ''>('')
    const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('')

    useEffect(() => {
        fetchPayments()
    }, [])

    const filteredPayments = payments.filter(payment => {
        if (filterMethod && payment.method !== filterMethod) return false
        if (filterStatus && payment.status !== filterStatus) return false
        return true
    })

    const stats = {
        total: payments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0),
        count: payments.filter(p => p.status === 'COMPLETED').length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        failed: payments.filter(p => p.status === 'FAILED').length,
    }

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-500/10 text-green-500'
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-500'
            case 'FAILED': return 'bg-red-500/10 text-red-500'
            case 'REFUNDED': return 'bg-blue-500/10 text-blue-500'
        }
    }

    const getMethodIcon = (method: PaymentMethod) => {
        switch (method) {
            case 'CASH': return '💵'
            case 'CARD': return '💳'
            case 'UPI': return '📱'
            case 'WALLET': return '👛'
        }
    }

    if (loading && payments.length === 0) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-card rounded-2xl w-1/3" />
                <div className="grid grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-2xl" />)}
                </div>
                <div className="h-96 bg-card rounded-2xl" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-black text-foreground">Payments</h1>
                <p className="text-muted-foreground mt-1">Track and manage all payments</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">₹{stats.total.toLocaleString()}</h3>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Total Revenue</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.count}</h3>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Completed</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.pending}</h3>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Pending</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-red-500" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground mb-1">{stats.failed}</h3>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Failed</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | '')}
                        className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="CARD">Card</option>
                        <option value="UPI">UPI</option>
                        <option value="WALLET">Wallet</option>
                    </select>
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
                    className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary"
                >
                    <option value="">All Status</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                </select>
            </div>

            {/* Payments Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">ID</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Amount</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Method</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Transaction ID</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-foreground font-semibold">#{payment.id}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">#{payment.orderId}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-foreground">₹{payment.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
                                            <span>{getMethodIcon(payment.method)}</span>
                                            <span className="font-semibold text-foreground">{payment.method}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
                                        {payment.transactionId || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                        {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
