'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    UserPlus,
    Mail,
    Phone,
    MapPin,
    History,
    Users as UsersIcon,
    MoreVertical,
    Star,
    Crown,
    CheckCircle2,
    Calendar,
    MessageSquare,
    ChevronRight,
    ArrowUpRight,
    CreditCard,
    Zap,
    Trash
} from 'lucide-react'
import { toast } from 'sonner'
import { useCustomerStore } from '@/store/useCustomerStore'
import AddCustomerModal from '@/components/AddCustomerModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const { customers, loading, fetchCustomers, removeCustomer } = useCustomerStore()

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await removeCustomer(id)
            toast.success('Removed', { description: 'Customer profile has been permanently deleted.' })
        } catch (error: any) {
            toast.error('Failed', { description: error.message || 'Could not remove customer.' })
        }
    }

    const filteredCustomers = customers?.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Customer Directory</h1>
                    <p className="text-muted-foreground font-medium">Manage relationships, track loyalty, and view purchase history.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="h-11 shadow-lg shadow-indigo-500/20 gradient-secondary border-none"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Customer
                    </Button>
                </div>
            </div>

            {/* Directory Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UsersIcon className="w-12 h-12 text-foreground" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Customers</p>
                        <h3 className="text-3xl font-black text-foreground">{customers?.length || 0}</h3>
                        <div className="flex items-center gap-1.5 mt-2 text-success-600 text-[10px] font-bold">
                            <ArrowUpRight className="w-3 h-3" />
                            8.2% Growth MoM
                        </div>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Crown className="w-12 h-12 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Elite Members</p>
                        <h3 className="text-3xl font-black text-foreground">
                            {customers?.filter(c => new Date(c.createdAt) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2 text-indigo-600 text-[10px] font-bold">
                            <Zap className="w-3 h-3" />
                            Loyalty Program Active
                        </div>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-12 h-12 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Avg. Ticket Value</p>
                        <h3 className="text-3xl font-black text-foreground">₹1,420</h3>
                        <p className="text-[10px] text-muted-foreground mt-2 font-bold uppercase tracking-wider">Historical Average</p>
                    </div>
                </Card>
            </div>

            {/* Filter Bar */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Find customer by name, phone, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                        />
                    </div>
                </div>
            </Card>

            {/* Customer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading && customers.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <Card key={i} className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                                </div>
                            </div>
                            <div className="h-20 w-full bg-muted/50 rounded-xl animate-pulse" />
                        </Card>
                    ))
                ) : filteredCustomers?.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/30 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center text-center px-4">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                            <UsersIcon className="w-10 h-10 text-muted-foreground opacity-30" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No matching customers</h3>
                        <p className="text-muted-foreground text-sm max-w-xs font-medium">
                            We couldn't find any customers matching your search.
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredCustomers?.map((customer, idx) => (
                            <motion.div
                                layout
                                key={customer.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: idx * 0.03 }}
                            >
                                <Card className="group transition-all duration-500 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-secondary-500/10 transition-colors" />

                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center font-black text-lg text-indigo-600 group-hover:bg-indigo-500/10 transition-all">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground leading-tight mb-1 group-hover:text-indigo-600 transition-colors uppercase">
                                                        {customer.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                            ID: #{customer.id.slice(-6)}
                                                        </span>
                                                        <span className="w-1 h-1 rounded-full bg-border" />
                                                        <div className="flex items-center gap-1 text-[10px] font-bold text-success-600">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Verified
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-2 rounded-xl bg-error-500/5 border border-error-500/10 text-error-600 hover:bg-error-500 hover:text-white transition-all"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex flex-wrap gap-2">
                                                <div className="px-3 py-1.5 rounded-xl bg-muted border border-border flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                                                    <span className="text-xs font-bold text-foreground">{customer.phone}</span>
                                                </div>
                                                {customer.email && (
                                                    <div className="px-3 py-1.5 rounded-xl bg-muted border border-border flex items-center gap-2 max-w-[180px]">
                                                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="text-xs font-bold text-muted-foreground truncate">{customer.email}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {customer.address && (
                                                <div className="flex gap-2 p-3 rounded-xl bg-muted/50 border border-border">
                                                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <p className="text-[11px] font-medium text-muted-foreground leading-normal line-clamp-1 italic">
                                                        {customer.address}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Last Visit</span>
                                                    <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                                                        <History className="w-3 h-3 text-muted-foreground" />
                                                        Today, 2:40 PM
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground group">
                                                    History <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer / Directory Meta */}
            {!loading && filteredCustomers?.length > 0 && (
                <div className="flex items-center justify-between pt-8 border-t border-border">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        Data sync active
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled h-9>Previous</Button>
                        <Button variant="outline" size="sm" h-9>Next</Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddCustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    )
}
