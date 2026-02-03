'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Info, Zap, Rocket, Crown } from 'lucide-react'
import { toast } from 'sonner'

import { usePlanStore, Plan } from '@/store/usePlanStore'

export default function PlansManagementPage() {
    const { plans, loading, fetchPlans, createPlan, updatePlan, deletePlan } = usePlanStore()

    useEffect(() => {
        fetchPlans()
    }, [])

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
    const [formData, setFormData] = useState<Partial<Plan>>({
        name: '',
        priceMonthly: 0,
        priceYearly: 0,
        maxUsers: 1,
        maxProducts: 100,
        maxBillsPerMonth: null,
        features: {},
        isActive: true
    })

    const featureList = [
        { id: 'billing', name: 'Basic Billing' },
        { id: 'thermal_printer', name: 'Thermal Printer' },
        { id: 'inventory', name: 'Inventory Management' },
        { id: 'qr_ordering', name: 'QR Table Ordering' },
        { id: 'kot_system', name: 'KOT System' },
        { id: 'whatsapp_billing', name: 'WhatsApp Billing' },
        { id: 'analytics', name: 'Advanced Analytics' },
        { id: 'multi_store', name: 'Multi-Store Support' }
    ]

    useEffect(() => {
        if (editingPlan) {
            setFormData(editingPlan)
        } else {
            setFormData({
                name: '',
                priceMonthly: 0,
                priceYearly: 0,
                maxUsers: 1,
                maxProducts: 100,
                maxBillsPerMonth: null,
                features: { billing: true },
                isActive: true
            })
        }
    }, [editingPlan, isModalOpen])

    const handleToggleFeature = (featureId: string) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [featureId]: !prev.features?.[featureId]
            }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            if (editingPlan) {
                await updatePlan(editingPlan.id, formData)
                toast.success('Plan updated successfully')
            } else {
                await createPlan(formData)
                toast.success('Plan created successfully')
            }
            setIsModalOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Action failed')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this plan?')) {
            try {
                await deletePlan(id)
                toast.success('Plan deleted')
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">Subscription Plans</h1>
                    <p className="text-muted-foreground">Manage service tiers, pricing, and feature limits.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setEditingPlan(null)
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Create New Plan
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.id}
                        layout
                        className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setEditingPlan(plan)
                                        setIsModalOpen(true)
                                    }}
                                    className="p-2 bg-muted hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="p-2 bg-muted hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    {plan.isActive ? (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[10px] font-black text-destructive bg-destructive/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            <XCircle className="w-3 h-3" /> Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-muted-foreground">Monthly</span>
                                <span className="text-3xl font-black tracking-tighter text-foreground">₹{plan.priceMonthly}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-muted-foreground">Yearly (est.)</span>
                                <span className="text-xl font-black tracking-tighter text-muted-foreground">₹{plan.priceYearly}</span>
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-border border-dashed">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Max Users</span>
                                <span className="font-bold">{plan.maxUsers}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Max Products</span>
                                <span className="font-bold">{plan.maxProducts} {plan.maxProducts > 1000 ? ' (High Limit)' : ''}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground font-medium">Monthly Bills</span>
                                <span className="font-bold">{plan.maxBillsPerMonth || 'Unlimited'}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-2">
                            {Object.keys(plan.features).map(feature => (
                                <span key={feature} className="text-[10px] font-bold bg-muted px-2 py-1 rounded-md text-muted-foreground uppercase">
                                    {feature.replace('_', ' ')}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {loading && plans.length === 0 && (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-96 bg-card border border-border rounded-3xl animate-pulse" />
                    ))
                )}
            </div>

            {/* Modal for Create/Edit - Simplified check for now */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full max-w-2xl bg-card border border-border rounded-[2rem] shadow-2xl z-[101] overflow-hidden"
                        >
                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">
                                        {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                                    </h2>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                        <Info className="w-5 h-5 rotate-45" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Plan Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-muted border-none rounded-xl p-4 font-bold outline-none ring-2 ring-transparent focus:ring-primary/50 transition-all text-foreground"
                                            placeholder="e.g. Pro Max"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Monthly Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.priceMonthly}
                                            onChange={(e) => setFormData({ ...formData, priceMonthly: parseFloat(e.target.value) })}
                                            className="w-full bg-muted border-none rounded-xl p-4 font-bold outline-none text-foreground"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Yearly Price (₹)</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.priceYearly}
                                            onChange={(e) => setFormData({ ...formData, priceYearly: parseFloat(e.target.value) })}
                                            className="w-full bg-muted border-none rounded-xl p-4 font-bold outline-none text-foreground"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Users</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.maxUsers}
                                            onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                                            className="w-full bg-muted border-none rounded-xl p-4 font-bold outline-none text-foreground"
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Max Products</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.maxProducts}
                                            onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
                                            className="w-full bg-muted border-none rounded-xl p-4 font-bold outline-none text-foreground"
                                            placeholder="100"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-3">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Features Included</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {featureList.map(feature => (
                                                <button
                                                    key={feature.id}
                                                    type="button"
                                                    onClick={() => handleToggleFeature(feature.id)}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.features?.[feature.id]
                                                        ? 'bg-primary/10 border-primary text-primary'
                                                        : 'bg-muted border-transparent text-muted-foreground grayscale'
                                                        }`}
                                                >
                                                    <CheckCircle2 className={`w-4 h-4 ${formData.features?.[feature.id] ? 'opacity-100' : 'opacity-20'}`} />
                                                    <span className="text-xs font-bold">{feature.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-muted-foreground hover:bg-muted rounded-xl transition-all">Cancel</button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-2 py-4 px-8 gradient-primary text-white font-black rounded-xl shadow-xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Plan Configuration'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
