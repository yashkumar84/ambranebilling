'use client'

import { motion } from 'framer-motion'
import { Shield, Plus, Edit, Trash2, Key } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRoleStore } from '@/store/useRoleStore'
import { usePermissionStore } from '@/store/usePermissionStore'
import { Role, Permission } from '@/types'
import { toast } from 'sonner'

export default function RolesPage() {
    const { roles, loading, fetchRoles, addRole, updateRole, removeRole, assignPermissions } = useRoleStore()
    const { permissions, fetchPermissions } = usePermissionStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [formData, setFormData] = useState({ name: '', description: '' })
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

    useEffect(() => {
        fetchRoles()
        fetchPermissions()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (selectedRole) {
                await updateRole(selectedRole.id.toString(), formData)
                toast.success('Role updated successfully')
            } else {
                await addRole(formData)
                toast.success('Role created successfully')
            }
            setIsModalOpen(false)
            setFormData({ name: '', description: '' })
            setSelectedRole(null)
        } catch (error) {
            toast.error('Failed to save role')
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this role?')) {
            try {
                await removeRole(id.toString())
                toast.success('Role deleted successfully')
            } catch (error) {
                toast.error('Failed to delete role')
            }
        }
    }

    const handleEdit = (role: Role) => {
        setSelectedRole(role)
        setFormData({ name: role.name, description: role.description || '' })
        setIsModalOpen(true)
    }

    const handleAssignPermissions = async () => {
        if (!selectedRole) return
        try {
            await assignPermissions(selectedRole.id.toString(), selectedPermissions)
            toast.success('Permissions assigned successfully')
            setIsPermissionModalOpen(false)
            setSelectedRole(null)
            setSelectedPermissions([])
        } catch (error) {
            toast.error('Failed to assign permissions')
        }
    }

    const openPermissionModal = (role: Role) => {
        setSelectedRole(role)
        setSelectedPermissions(role.permissions?.map(p => p.id) || [])
        setIsPermissionModalOpen(true)
    }

    if (loading && roles.length === 0) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="h-20 bg-card rounded-2xl w-1/3" />
                <div className="grid grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-card rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-foreground">Roles Management</h1>
                    <p className="text-muted-foreground mt-1">Manage user roles and permissions</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Role
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role, index) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-2xl p-6 shadow-lg border border-border hover:border-primary/50 transition-all"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openPermissionModal(role)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                    title="Manage Permissions"
                                >
                                    <Key className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => handleEdit(role)}
                                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                    onClick={() => handleDelete(role.id)}
                                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{role.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{role.description || 'No description'}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Permissions</span>
                            <span className="font-bold text-primary">{role.permissions?.length || 0}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl p-6 max-w-md w-full shadow-2xl border border-border"
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            {selectedRole ? 'Edit Role' : 'Create Role'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Description
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
                                        setSelectedRole(null)
                                        setFormData({ name: '', description: '' })
                                    }}
                                    className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                >
                                    {selectedRole ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Permission Assignment Modal */}
            {isPermissionModalOpen && selectedRole && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-border max-h-[80vh] overflow-y-auto"
                    >
                        <h2 className="text-2xl font-bold text-foreground mb-6">
                            Assign Permissions to {selectedRole.name}
                        </h2>
                        <div className="space-y-3 mb-6">
                            {permissions.map((permission) => (
                                <label
                                    key={permission.id}
                                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl hover:bg-muted transition-all cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(permission.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedPermissions([...selectedPermissions, permission.id])
                                            } else {
                                                setSelectedPermissions(selectedPermissions.filter(id => id !== permission.id))
                                            }
                                        }}
                                        className="w-5 h-5 rounded text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">
                                            {permission.resource}:{permission.action}
                                        </p>
                                        {permission.description && (
                                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsPermissionModalOpen(false)
                                    setSelectedRole(null)
                                    setSelectedPermissions([])
                                }}
                                className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignPermissions}
                                className="flex-1 px-4 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            >
                                Assign Permissions
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
