'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, UserPlus, Mail, Phone, MapPin, History, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomerStore } from '@/store/useCustomerStore'
import AddCustomerModal from '@/components/AddCustomerModal'

export default function CustomersPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const { customers, loading, fetchCustomers, removeCustomer } = useCustomerStore()

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await removeCustomer(id.toString())
            toast.success('Customer removed successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove customer')
        }
    }

    const filteredCustomers = customers?.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Customer Directory</h1>
                    <p className="text-muted-foreground mt-1">Manage your customer relationships and order history</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 gradient-secondary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    New Customer
                </motion.button>
            </div>

            {/* Search and Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-card rounded-2xl p-6 shadow-lg border border-border">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-foreground"
                        />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-6 border border-secondary/20 flex flex-col justify-center">
                    <p className="text-sm font-bold text-secondary uppercase tracking-widest mb-1">Total Customers</p>
                    <h3 className="text-4xl font-black text-foreground">{customers?.length || 0}</h3>
                </div>
            </div>

            {/* Customers Table/Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading && customers.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-card animate-pulse h-56 rounded-2xl border border-border" />
                    ))
                ) : filteredCustomers?.length === 0 ? (
                    <div className="col-span-full bg-card rounded-2xl p-12 text-center border border-border">
                        <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground text-lg">No customers listed</p>
                    </div>
                ) : (
                    filteredCustomers?.map((customer) => (
                        <motion.div
                            key={customer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:scale-150" />

                            <div className="flex items-start justify-between mb-4 relative">
                                <div>
                                    <h3 className="font-bold text-foreground text-xl mb-1">{customer.name}</h3>
                                    <div className="flex items-center gap-2 text-secondary font-bold text-sm">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>{customer.phone}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 bg-muted text-muted-foreground hover:text-secondary rounded-lg transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(customer.id)}
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border relative">
                                {customer.email && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                        <span>{customer.email}</span>
                                    </div>
                                )}
                                {customer.address && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span className="line-clamp-1">{customer.address}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <History className="w-3.5 h-3.5" />
                                        <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className="text-xs font-bold text-secondary hover:underline">View History</button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Customer Modal */}
            <AddCustomerModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    )
}
