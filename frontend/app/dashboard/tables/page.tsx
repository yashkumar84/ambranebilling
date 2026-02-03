'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon, Circle } from 'lucide-react'
import { toast } from 'sonner'
import { useTableStore } from '@/store/useTableStore'
import { TableStatus } from '@/types'
import AddTableModal from '@/components/AddTableModal'

export default function TablesPage() {
    const [statusFilter, setStatusFilter] = useState<TableStatus | 'ALL'>('ALL')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const { tables, loading, fetchTables, updateTableStatus } = useTableStore()

    useEffect(() => {
        fetchTables()
    }, [])

    const handleStatusUpdate = async (id: string, status: TableStatus) => {
        try {
            await updateTableStatus(id, status)
            toast.success('Table status updated successfully')
        } catch (error: any) {
            toast.error('Failed to update table status')
        }
    }

    const filteredTables = statusFilter === 'ALL' ? tables : tables.filter(t => t.status === statusFilter)

    const getStatusColor = (status: TableStatus) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-green-500'
            case 'OCCUPIED': return 'bg-red-500'
            case 'RESERVED': return 'bg-yellow-500'
        }
    }

    const stats = {
        total: tables.length,
        available: tables.filter(t => t.status === 'AVAILABLE').length,
        occupied: tables.filter(t => t.status === 'OCCUPIED').length,
        reserved: tables.filter(t => t.status === 'RESERVED').length,
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tables</h1>
                    <p className="text-muted-foreground mt-1">Manage restaurant tables and seating</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Table
                </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <UsersIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Tables</p>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Circle className="w-6 h-6 text-green-500 fill-current" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Available</p>
                            <p className="text-2xl font-bold text-foreground">{stats.available}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Circle className="w-6 h-6 text-red-500 fill-current" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Occupied</p>
                            <p className="text-2xl font-bold text-foreground">{stats.occupied}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                            <Circle className="w-6 h-6 text-yellow-500 fill-current" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Reserved</p>
                            <p className="text-2xl font-bold text-foreground">{stats.reserved}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 p-1 bg-muted w-fit rounded-xl border border-border">
                {(['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'] as const).map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${statusFilter === status
                            ? 'gradient-primary text-white shadow-lg'
                            : 'text-muted-foreground hover:bg-card hover:text-foreground'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading && tables.length === 0 ? (
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="bg-card animate-pulse h-48 rounded-2xl border border-border" />
                    ))
                ) : filteredTables.length === 0 ? (
                    <div className="col-span-full bg-card rounded-2xl p-12 text-center border border-border">
                        <UsersIcon className="w-16 h-16 text-muted mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No tables found</p>
                    </div>
                ) : (
                    filteredTables.map((table) => (
                        <motion.div
                            key={table.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            className={`rounded-2xl p-6 shadow-lg border-2 cursor-pointer transition-all bg-card ${table.status === 'AVAILABLE' ? 'border-green-500/20' :
                                table.status === 'OCCUPIED' ? 'border-red-500/20' :
                                    'border-yellow-500/20'
                                }`}
                        >
                            <div className="text-center">
                                <div className="flex items-center justify-center mb-3">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)} animate-pulse shadow-[0_0_10px_currentColor]`} />
                                </div>
                                <h3 className="text-3xl font-black text-foreground mb-2">
                                    {table.number}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                    <UsersIcon className="w-4 h-4 inline mr-1" />
                                    {table.capacity} seats
                                </p>
                                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${table.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500' :
                                    table.status === 'OCCUPIED' ? 'bg-red-500/10 text-red-500' :
                                        'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    {table.status}
                                </span>

                                {/* Current Order info removed as it's not in the base table model anymore or needs to be fetched separately */}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Table Modal */}
            <AddTableModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    )
}
