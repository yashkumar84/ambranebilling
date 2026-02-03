'use client'

import { motion } from 'framer-motion'
import { Key, Plus, Trash2, Filter } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePermissionStore } from '@/store/usePermissionStore'
import { Permission } from '@/types'
import { toast } from 'sonner'

export default function PermissionsPage() {
    const { permissions, loading, fetchPermissions, addPermission, removePermission } = usePermissionStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ resource: '', action: '', description: '' })
    const [filterResource, setFilterResource] = useState<string>('')

    useEffect(() => {
        fetchPermissions()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await addPermission(formData)
            toast.success('Permission created successfully')
            setIsModalOpen(false)
            setFormData({ resource: '', action: '', description: '' })
        } catch (error) {
            toast.error('Failed to create permission')
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            try {
                await removePermission(id.toString())
                toast.success('Permission deleted successfully')
            } catch (error) {
                toast.error('Failed to delete permission')
            }
        }
    }

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, permission) => {
        if (!acc[permission.resource]) {
            acc[permission.resource] = []
        }
        acc[permission.resource].push(permission)
        return acc
    }, {} as Record<string, Permission[]>)

    const filteredResources = filterResource
        ? Object.keys(groupedPermissions).filter(r => r.toLowerCase().includes(filterResource.toLowerCase()))
        : Object.keys(groupedPermissions)

    if (loading && permissions.length === 0) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-card rounded-2xl w-1/3" />
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Permissions Management</h1>
                    <p className="text-muted-foreground mt-1">Manage system permissions</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Permission
                </motion.button>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Filter by resource..."
                    value={filterResource}
                    onChange={(e) => setFilterResource(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* Grouped Permissions */}
            <div className="space-y-6">
                {filteredResources.map((resource) => (
                    <motion.div
                        key={resource}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card rounded-2xl p-6 shadow-lg border border-border"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                                <Key className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-foreground capitalize">{resource}</h2>
                            <span className="ml-auto text-sm text-muted-foreground">
                                {groupedPermissions[resource].length} permissions
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {groupedPermissions[resource].map((permission) => (
                                <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-all"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{permission.action}</p>
                                        {permission.description && (
                                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(permission.id)}
                                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border"
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">Create Permission</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Resource
                                </label>
                                <input
                                    type="text"
                                    value={formData.resource}
                                    onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                                    placeholder="e.g., menu, orders, users"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Action
                                </label>
                                <input
                                    type="text"
                                    value={formData.action}
                                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                                    placeholder="e.g., create, read, update, delete"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all resize-none"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false)
                                        setFormData({ resource: '', action: '', description: '' })
                                    }}
                                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
