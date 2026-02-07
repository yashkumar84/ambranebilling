import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X, UtensilsCrossed, Plus, Trash2, Tag, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { useMenuStore } from '@/store/useMenuStore'
import { MenuItem, MenuItemVariant } from '@/types'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

interface AddMenuItemModalProps {
    isOpen: boolean
    onClose: () => void
    itemToEdit?: MenuItem | null
}

export default function AddMenuItemModal({ isOpen, onClose, itemToEdit }: AddMenuItemModalProps) {
    const { addMenuItem, updateMenuItem } = useMenuStore()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<'basic' | 'variants'>('basic')
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        isVeg: false,
        isAvailable: true,
        variants: [] as Partial<MenuItemVariant>[]
    })

    useEffect(() => {
        if (itemToEdit) {
            setFormData({
                name: itemToEdit.name,
                description: itemToEdit.description || '',
                price: itemToEdit.price.toString(),
                category: itemToEdit.category,
                isVeg: itemToEdit.isVeg,
                isAvailable: itemToEdit.isAvailable,
                variants: itemToEdit.variants || []
            })
        } else {
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
                isVeg: false,
                isAvailable: true,
                variants: []
            })
        }
        setActiveTab('basic')
    }, [itemToEdit, isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleAddVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                { variantName: '', priceAdjustment: 0, variantSku: '', isActive: true }
            ]
        }))
    }

    const handleRemoveVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }))
    }

    const handleVariantChange = (index: number, field: keyof MenuItemVariant, value: any) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.map((v, i) => i === index ? { ...v, [field]: value } : v)
        }))
    }

    const handleClose = () => {
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
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: parseFloat(formData.price),
                category: formData.category,
                isVeg: formData.isVeg,
                isAvailable: formData.isAvailable,
                variants: formData.variants.filter(v => v.variantName?.trim())
            }

            if (itemToEdit) {
                await updateMenuItem(itemToEdit.id, payload)
                toast.success('Menu item updated successfully!')
            } else {
                await addMenuItem(payload)
                toast.success('Menu item added successfully!')
            }
            handleClose()
        } catch (error: any) {
            toast.error(error.message || 'Failed to save menu item')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10000]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-card rounded-3xl shadow-2xl z-[10001] border border-border overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <UtensilsCrossed className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-foreground leading-tight">
                                        {itemToEdit ? 'Configure Item' : 'New Menu Addition'}
                                    </h2>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                        {itemToEdit ? `Modifying ID: #${itemToEdit.id.slice(-6)}` : 'Entry Metadata Required'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-6 gap-4">
                            <button
                                onClick={() => setActiveTab('basic')}
                                className={cn(
                                    "pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                                    activeTab === 'basic' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                                )}
                            >
                                Basic Details
                            </button>
                            <button
                                onClick={() => setActiveTab('variants')}
                                className={cn(
                                    "pb-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                                    activeTab === 'variants' ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                                )}
                            >
                                Price Variants
                                {formData.variants.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-muted text-[9px] text-muted-foreground">
                                        {formData.variants.length}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'basic' ? (
                                    <motion.div
                                        key="basic"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                                Item Name <span className="text-primary">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Truffle Infused Risotto"
                                                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/50 font-medium"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Brief overview of the culinary profile..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-muted-foreground/50 font-medium resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                                    Base Price (₹) <span className="text-primary">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all text-foreground font-black"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                                                    Category <span className="text-primary">*</span>
                                                </label>
                                                <select
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/30 outline-none transition-all text-foreground font-bold appearance-none"
                                                    required
                                                >
                                                    <option value="" className="bg-slate-900">Select...</option>
                                                    <option value="Appetizers" className="bg-slate-900">Appetizers</option>
                                                    <option value="Main Course" className="bg-slate-900">Main Course</option>
                                                    <option value="Desserts" className="bg-slate-900">Desserts</option>
                                                    <option value="Beverages" className="bg-slate-900">Beverages</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex gap-8 pt-2">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                    formData.isVeg ? "bg-success-500/20 border-success-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : "border-white/10"
                                                )}>
                                                    {formData.isVeg && <div className="w-2.5 h-2.5 rounded-full bg-success-500" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    name="isVeg"
                                                    checked={formData.isVeg}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">Vegetarian Selection</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                    formData.isAvailable ? "bg-primary/20 border-primary shadow-lg shadow-primary/20" : "border-border"
                                                )}>
                                                    {formData.isAvailable && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    name="isAvailable"
                                                    checked={formData.isAvailable}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">Live on Menu</span>
                                            </label>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="variants"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Defined Variants</h4>
                                            <button
                                                type="button"
                                                onClick={handleAddVariant}
                                                className="text-[10px] font-black text-primary hover:text-foreground uppercase tracking-widest border border-primary/30 px-3 py-1 rounded-lg bg-primary/5 transition-all"
                                            >
                                                Add Variant
                                            </button>
                                        </div>

                                        {formData.variants.length === 0 ? (
                                            <div className="py-12 text-center border border-dashed border-border rounded-3xl bg-muted/10">
                                                <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                                                <p className="text-xs text-muted-foreground font-medium">No variants defined. Add sizes or custom options.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {formData.variants.map((variant, index) => (
                                                    <div key={index} className="p-4 rounded-2xl bg-muted/10 border border-border space-y-4 group relative">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1.5 ml-1">Label</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g., Regular / Large"
                                                                    value={variant.variantName}
                                                                    onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                                                                    className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary outline-none"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] mb-1.5 ml-1">Price Adjust (₹)</label>
                                                                <input
                                                                    type="number"
                                                                    placeholder="+ /- 0"
                                                                    value={variant.priceAdjustment}
                                                                    onChange={(e) => handleVariantChange(index, 'priceAdjustment', parseFloat(e.target.value))}
                                                                    className="w-full h-10 px-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary outline-none font-black"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Custom ID / SKU (Optional)"
                                                                    value={variant.variantSku}
                                                                    onChange={(e) => handleVariantChange(index, 'variantSku', e.target.value)}
                                                                    className="w-full h-9 px-3 bg-muted/20 border border-transparent rounded-lg text-[10px] text-muted-foreground focus:bg-muted/40 outline-none font-mono"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveVariant(index)}
                                                                className="p-1.5 text-muted-foreground/50 hover:text-destructive transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-4 pt-8 border-t border-border mt-6">
                                <p className="text-[10px] text-muted-foreground font-extrabold uppercase tracking-widest italic">
                                    Fields with * are required
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-6 py-2.5 bg-muted text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted/80 hover:text-foreground transition-all border border-border"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-2.5 gradient-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 transition-all disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Syncing...' : (itemToEdit ? 'Save Changes' : 'Confirm Entry')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

