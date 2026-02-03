'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { useMenuStore } from '@/store/useMenuStore'

interface AddMenuItemModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function AddMenuItemModal({ isOpen, onClose }: AddMenuItemModalProps) {
    const { addMenuItem } = useMenuStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        isVeg: false,
        isAvailable: true,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            isVeg: false,
            isAvailable: true,
        })
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error('Please enter item name')
            return
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            toast.error('Please enter a valid price')
            return
        }
        if (!formData.category.trim()) {
            toast.error('Please select a category')
            return
        }

        setIsSubmitting(true)
        try {
            await addMenuItem({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: parseFloat(formData.price),
                category: formData.category,
                isVeg: formData.isVeg,
                isAvailable: formData.isAvailable,
            })
            toast.success('Menu item added successfully!')
            handleClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to add menu item')
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
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                    <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground">Add Menu Item</h2>
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
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Margherita Pizza"
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief description of the item..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground resize-none"
                                />
                            </div>

                            {/* Price and Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Price (₹) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="Appetizers">Appetizers</option>
                                        <option value="Main Course">Main Course</option>
                                        <option value="Desserts">Desserts</option>
                                        <option value="Beverages">Beverages</option>
                                        <option value="Salads">Salads</option>
                                        <option value="Soups">Soups</option>
                                    </select>
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isVeg"
                                        checked={formData.isVeg}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-foreground">Vegetarian</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={handleChange}
                                        className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-foreground">Available</span>
                                </label>
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
                                    {isSubmitting ? 'Adding...' : 'Add Item'}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
