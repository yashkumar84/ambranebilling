'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Plus,
    Users as UsersIcon,
    Circle,
    MoreHorizontal,
    Clock,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    Map as MapIcon,
    ChefHat,
    GlassWater,
    ArrowUpRight,
    Star,
    MoreVertical,
    Coffee,
    Pizza
} from 'lucide-react'
import { toast } from 'sonner'
import { useTableStore } from '@/store/useTableStore'
import { TableStatus } from '@/types'
import AddTableModal from '@/components/AddTableModal'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

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
            toast.success('Status synced', {
                description: `Table ${tables.find(t => t.id === id)?.number} is now ${status.toLowerCase()}.`
            })
        } catch (error: any) {
            toast.error('Sync failed')
        }
    }

    const filteredTables = statusFilter === 'ALL' ? tables : tables.filter(t => t.status === statusFilter)

    const getStatusConfig = (status: TableStatus) => {
        switch (status) {
            case 'AVAILABLE': return {
                color: 'text-success-400 bg-success-400/10 border-success-400/20',
                glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
                icon: CheckCircle2,
                label: 'Empty'
            }
            case 'OCCUPIED': return {
                color: 'text-error-400 bg-error-400/10 border-error-400/20',
                glow: 'shadow-[0_0_15px_rgba(239,44,44,0.3)]',
                icon: ChefHat,
                label: 'Dine-in'
            }
            case 'RESERVED': return {
                color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
                glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
                icon: Clock,
                label: 'Booked'
            }
        }
    }

    const stats = {
        total: tables.length,
        available: tables.filter(t => t.status === 'AVAILABLE').length,
        occupied: tables.filter(t => t.status === 'OCCUPIED').length,
        reserved: tables.filter(t => t.status === 'RESERVED').length,
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Floor Management</h1>
                    <p className="text-muted-foreground font-medium">Monitor live table status and optimize restaurant seating.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-11">
                        <MapIcon className="w-5 h-5 mr-2" />
                        Floor Plan
                    </Button>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-11 shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Table
                    </Button>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Capacity', value: stats.total, icon: LayoutGrid, color: 'text-foreground' },
                    { label: 'Available Now', value: stats.available, icon: CheckCircle2, color: 'text-success-600' },
                    { label: 'Currently Dining', value: stats.occupied, icon: ChefHat, color: 'text-error-600' },
                    { label: 'Reservations', value: stats.reserved, icon: Clock, color: 'text-yellow-600' },
                ].map((stat, i) => (
                    <Card key={i} className="p-5 group transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={cn("w-5 h-5 opacity-50", stat.color)} />
                            <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-30" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <p className={cn("text-2xl font-black", stat.color)}>{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Filter Navigation */}
            <Card className="p-4">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {(['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
                                statusFilter === status
                                    ? "bg-primary-500/10 border-primary-500/30 text-primary-400 shadow-lg shadow-primary-500/10"
                                    : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border"
                            )}
                        >
                            {status === 'ALL' ? 'Everything' : status.toLowerCase()}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {loading && tables.length === 0 ? (
                    [...Array(10)].map((_, i) => (
                        <Card key={i} className="h-48 animate-pulse rounded-[2rem]" />
                    ))
                ) : filteredTables.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/30 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center px-4">
                        <LayoutGrid className="w-12 h-12 text-muted-foreground opacity-30 mb-4" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No tables found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs font-medium">There are no tables in the current zone matching your filters.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredTables.map((table, idx) => {
                            const config = getStatusConfig(table.status)
                            return (
                                <motion.div
                                    layout
                                    key={table.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4, delay: idx * 0.02 }}
                                >
                                    <Card
                                        className={cn(
                                            "group cursor-pointer transition-all duration-500 rounded-[2rem] overflow-hidden"
                                        )}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col items-center text-center">
                                                {/* Table Number & Status Glow */}
                                                <div className="relative mb-6">
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all duration-700",
                                                        "bg-muted border border-border text-foreground",
                                                        "group-hover:scale-110",
                                                        config.glow
                                                    )}>
                                                        {table.number}
                                                    </div>
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ring-2 ring-muted",
                                                        config.color.split(' ')[1] // bg color
                                                    )}>
                                                        <config.icon className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1 mb-6">
                                                    <h4 className={cn("text-[10px] font-black uppercase tracking-widest", config.color.split(' ')[0])}>
                                                        {config.label}
                                                    </h4>
                                                    <div className="flex items-center gap-1.5 justify-center text-muted-foreground">
                                                        <UsersIcon className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-bold tracking-widest uppercase">{table.capacity} Seats</span>
                                                    </div>
                                                </div>

                                                {/* Action Toggle */}
                                                <div className="flex gap-2 w-full pt-4 border-t border-border">
                                                    {table.status === 'AVAILABLE' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(table.id, 'OCCUPIED')}
                                                            className="flex-1 py-2 rounded-xl bg-muted border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:bg-error-500/10 hover:text-error-600 transition-all"
                                                        >
                                                            Occupy
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(table.id, 'AVAILABLE')}
                                                            className="flex-1 py-2 rounded-xl bg-muted border border-border text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:bg-success-500/10 hover:text-success-600 transition-all"
                                                        >
                                                            Release
                                                        </button>
                                                    )}
                                                    <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Zone Map Hint */}
            <div className="flex items-center justify-center pt-10">
                <Card className="px-8 py-3 rounded-full">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 text-success-500 fill-current" /> Inside Zone</span>
                        <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 text-blue-500 fill-current" /> Terrace</span>
                        <span className="flex items-center gap-1.5"><Circle className="w-2 h-2 text-indigo-500 fill-current" /> VIP Lounge</span>
                    </p>
                </Card>
            </div>

            <AddTableModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    )
}
