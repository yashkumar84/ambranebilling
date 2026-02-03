'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useCustomerStore } from '@/store/useCustomerStore'

interface AddCustomerModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
    const { addCustomer } = useCustomerStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleClose = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
        })
        onClose()
    }

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[6-9]\d{9}$/
        return phoneRegex.test(phone)
    }

    const validateEmail = (email: string): boolean => {
        if (!email) return true // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Please enter customer name')
            return
        }
        if (!formData.phone.trim()) {
            toast.error('Please enter phone number')
            return
        }
        if (!validatePhone(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number')
            return
        }
        if (formData.email && !validateEmail(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)
        try {
            await addCustomer({
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || undefined,
                address: formData.address.trim() || undefined,
            })
            toast.success('Customer added successfully!')
            handleClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to add customer')
        } finally {
            setIsSubmitting(false)
        }
    }

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
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-2xl shadow-2xl z-[10001] border border-border"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-secondary flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Add Customer</h2>
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
                                    Customer Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., John Doe"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-foreground"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g., 9876543210"
                                    maxLength={10}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-foreground"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">10-digit mobile number</p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g., john@example.com"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-foreground"
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Customer's address..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-foreground resize-none"
                                />
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
                                    className="px-6 py-3 gradient-secondary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Customer'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
