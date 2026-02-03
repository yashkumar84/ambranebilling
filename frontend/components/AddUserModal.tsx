'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { useUserStore } from '@/store/useUserStore'
import { useRoleStore } from '@/store/useRoleStore'

interface AddUserModalProps {
    isOpen: boolean
    onClose: () => void
    staffOnly?: boolean // If true, only show staff-related roles
    editData?: any // Data for editing an existing user
}

export default function AddUserModal({ isOpen, onClose, staffOnly = false, editData = null }: AddUserModalProps) {
    const { addUser, updateUser } = useUserStore()
    const { roles, fetchRoles } = useRoleStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        roleId: '',
    })

    useEffect(() => {
        if (isOpen) {
            fetchRoles()
            if (editData) {
                setFormData({
                    name: editData.name,
                    email: editData.email,
                    password: '', // Don't show existing password
                    confirmPassword: '',
                    phone: editData.phone || '',
                    roleId: editData.roleId || editData.role?.id || '',
                })
            }
        }
    }, [isOpen, fetchRoles, editData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            roleId: '',
        })
        onClose()
    }

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePassword = (password: string): boolean => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        return password.length >= 8
    }

    const validatePhone = (phone: string): boolean => {
        if (!phone) return true // Phone is optional
        const phoneRegex = /^[6-9]\d{9}$/
        return phoneRegex.test(phone)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Please enter user name')
            return
        }
        if (!formData.email.trim()) {
            toast.error('Please enter email address')
            return
        }
        if (!validateEmail(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }
        if (!editData && !formData.password) {
            toast.error('Please enter password')
            return
        }
        if (formData.password && !validatePassword(formData.password)) {
            toast.error('Password must be at least 8 characters long')
            return
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        if (formData.phone && !validatePhone(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number')
            return
        }
        if (!formData.roleId) {
            toast.error('Please select a role')
            return
        }

        setIsSubmitting(true)
        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim() || undefined,
                roleId: formData.roleId,
            } as any

            if (formData.password) {
                userData.password = formData.password
            }

            if (editData) {
                await updateUser(editData.id.toString(), userData)
                toast.success('User updated successfully!')
            } else {
                await addUser(userData)
                toast.success('User added successfully!')
            }
            handleClose()
        } catch (error: any) {
            toast.error(error.message || `Failed to ${editData ? 'update' : 'add'} user`)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter roles if staffOnly is true
    const availableRoles = staffOnly
        ? roles.filter(role => ['MANAGER', 'CASHIER', 'WAITER', 'STAFF'].includes((role.name || '').toUpperCase()))
        : roles

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-md z-[10000]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl z-[10001] border border-border"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">
                                    {editData ? (staffOnly ? 'Edit Staff Member' : 'Edit User') : (staffOnly ? 'Add Staff Member' : 'Add User')}
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Jane Smith"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g., jane@restaurant.com"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                    required
                                />
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={editData ? "Leave blank to keep current" : "Min. 8 characters"}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                        required={!editData}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder={editData ? "Leave blank to keep current" : "Re-enter password"}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                        required={!editData}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g., 9876543210"
                                    maxLength={10}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Optional - 10-digit mobile number</p>
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="roleId"
                                    value={formData.roleId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="">Select a role</option>
                                    {availableRoles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleClose}
                                    className="px-6 py-3 bg-muted text-foreground rounded-xl font-semibold hover:bg-muted/80 border border-border transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting}
                                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? (editData ? 'Updating...' : 'Adding...') : editData ? (staffOnly ? 'Update Staff' : 'Update User') : (staffOnly ? 'Add Staff' : 'Add User')}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
