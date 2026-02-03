'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, UserPlus, Shield, Mail, Phone, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useUserStore } from '@/store/useUserStore'
import { UserRole, RoleObject } from '@/types'
import AddUserModal from '@/components/AddUserModal'

export default function StaffPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const { users, loading, fetchUsers, deleteUser } = useUserStore()

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleEdit = (user: any) => {
        setEditingUser(user)
        setShowAddModal(true)
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id)
            toast.success('Staff member removed successfully')
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove staff member')
        }
    }

    const filteredUsers = users?.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleColor = (role: string) => {
        switch (role.toUpperCase()) {
            case 'TENANT_OWNER': return 'bg-red-500/10 text-red-500'
            case 'MANAGER': return 'bg-purple-500/10 text-purple-500'
            case 'CASHIER': return 'bg-blue-500/10 text-blue-500'
            case 'WAITER': return 'bg-blue-500/10 text-blue-500'
            case 'STAFF': return 'bg-green-500/10 text-green-500'
            default: return 'bg-gray-500/10 text-gray-500'
        }
    }

    const getRoleName = (role?: UserRole | RoleObject): string => {
        if (!role) return 'N/A'
        return typeof role === 'string' ? role : role?.name || 'N/A'
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Staff Management</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant team and roles</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-5 h-5" />
                    Add Staff
                </motion.button>
            </div>

            {/* Search and Filter */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                    />
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && users.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-card animate-pulse h-48 rounded-2xl border border-border" />
                    ))
                ) : filteredUsers?.length === 0 ? (
                    <div className="col-span-full bg-card rounded-2xl p-12 text-center border border-border">
                        <UserIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground text-lg">No staff members found</p>
                    </div>
                ) : (
                    filteredUsers?.map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-lg">{user.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleColor(getRoleName(user.role))}`}>
                                            {getRoleName(user.role)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="p-2 bg-muted text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>Added {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Staff Modal */}
            <AddUserModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false)
                    setEditingUser(null)
                }}
                staffOnly={true}
                editData={editingUser}
            />
        </div>
    )
}
