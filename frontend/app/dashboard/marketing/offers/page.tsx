'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
    Ticket,
    Plus,
    Calendar,
    Tag,
    Percent,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Info,
    Search,
    Filter,
    ArrowUpRight,
    TrendingUp,
    Gift,
    Target,
    Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function OffersPage() {
    const queryClient = useQueryClient()
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingOffer, setEditingOffer] = useState<any>(null)

    // Fetch Offers
    const { data: offers, isLoading } = useQuery({
        queryKey: ['marketing-offers'],
        queryFn: async () => {
            const response = await api.get('/api/marketing')
            return response.data.data
        }
    })

    // Create/Update Mutation
    const offerMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingOffer) {
                return api.patch(`/api/marketing/${editingOffer.id}`, data)
            }
            return api.post('/api/marketing', data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketing-offers'] })
            toast.success(editingOffer ? 'Offer Updated' : 'Offer Created')
            setIsCreateModalOpen(false)
            setEditingOffer(null)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Action failed')
        }
    })

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/api/marketing/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketing-offers'] })
            toast.success('Offer Removed')
        }
    })

    const handleCreateOffer = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        offerMutation.mutate({
            ...data,
            discountValue: parseFloat(data.discountValue as string),
            minOrderAmount: parseFloat(data.minOrderAmount as string || '0'),
            maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount as string) : null,
        })
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
                        Marketing <span className="text-primary">&</span> Offers.
                    </h1>
                    <p className="text-muted-foreground font-medium">Deploy rewards and attract patrons to the network.</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingOffer(null)
                        setIsCreateModalOpen(true)
                    }}
                    className="h-14 px-8 bg-foreground text-background font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary transition-all shadow-xl"
                >
                    <Plus className="w-4 h-4 mr-2" /> Launch New offer
                </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Promotions', value: offers?.filter((o: any) => o.isActive).length || 0, icon: Target, color: 'text-primary' },
                    { label: 'Loyalty Participation', value: '42%', icon: TrendingUp, color: 'text-success' },
                    { label: 'Store-Specific Rewards', value: '12', icon: Gift, color: 'text-secondary' }
                ].map((stat, i) => (
                    <Card key={i} className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12" />
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-muted border border-border ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground">{stat.value}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {isLoading ? (
                        [...Array(3)].map((_, i) => (
                            <Card key={i} className="h-64 bg-white/[0.02] border-white/5 animate-pulse rounded-3xl" />
                        ))
                    ) : offers?.length === 0 ? (
                        <div className="lg:col-span-full py-20 text-center space-y-4">
                            <Ticket className="w-16 h-16 text-muted-foreground/20 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Access the network to deploy offers</p>
                        </div>
                    ) : (
                        offers?.map((offer: any, idx: number) => (
                            <motion.div
                                key={offer.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-8 bg-white/[0.03] border-white/5 rounded-[2.5rem] relative overflow-hidden group hover:border-teal-400/30 transition-all duration-500">
                                    <div className="absolute top-0 right-10 w-32 h-32 bg-teal-400/5 blur-[60px] rounded-full group-hover:bg-teal-400/10 transition-colors" />

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-foreground group-hover:text-primary transition-colors">
                                                    {offer.title}
                                                </h3>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-lg">
                                                    <Tag className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{offer.code || 'NO_CODE'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-2xl font-black text-foreground tabular-nums">
                                                    {offer.type === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                                                </span>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Benefit</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                                            {offer.description || 'No additional parameters defined for this reward node.'}
                                        </p>

                                        <div className="pt-6 border-t border-border flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-muted-foreground/40" />
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                        {offer.expiryDate ? format(new Date(offer.expiryDate), 'MMM dd, yyyy') : 'PERMANENT'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${offer.isActive ? 'bg-primary animate-pulse' : 'bg-muted'}`} />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                                        {offer.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setEditingOffer(offer)
                                                        setIsCreateModalOpen(true)
                                                    }}
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        if (confirm('Deactivate this offer?')) deleteMutation.mutate(offer.id)
                                                    }}
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 text-destructive hover:bg-destructive hover:text-white"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-card border border-border rounded-[3rem] p-10 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />

                            <div className="relative z-10 space-y-10">
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black uppercase tracking-tighter italic text-foreground">
                                        {editingOffer ? 'Modify' : 'Initialize'} <span className="text-primary">Offer.</span>
                                    </h2>
                                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Configure marketing parameters for the network.</p>
                                </div>

                                <form onSubmit={handleCreateOffer} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Title</label>
                                            <input
                                                name="title"
                                                required
                                                defaultValue={editingOffer?.title}
                                                placeholder="e.g. VIP Summer Discount"
                                                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-bold placeholder:text-muted-foreground/20 text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Code</label>
                                            <input
                                                name="code"
                                                defaultValue={editingOffer?.code}
                                                placeholder="e.g. SUMMER24"
                                                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-black uppercase tracking-widest placeholder:text-muted-foreground/20 text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Type</label>
                                            <select
                                                name="type"
                                                defaultValue={editingOffer?.type || 'PERCENTAGE'}
                                                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-bold appearance-none text-foreground"
                                            >
                                                <option value="PERCENTAGE">PERCENTAGE</option>
                                                <option value="FIXED_AMOUNT">FIXED AMOUNT</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Benefit Value</label>
                                            <div className="relative">
                                                <input
                                                    name="discountValue"
                                                    required
                                                    type="number"
                                                    defaultValue={editingOffer?.discountValue}
                                                    placeholder="0.00"
                                                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-black text-foreground"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Min order</label>
                                            <input
                                                name="minOrderAmount"
                                                type="number"
                                                defaultValue={editingOffer?.minOrderAmount || 0}
                                                placeholder="₹ 0"
                                                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-bold text-foreground"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Expiry Date</label>
                                            <input
                                                name="expiryDate"
                                                type="date"
                                                defaultValue={editingOffer?.expiryDate ? format(new Date(editingOffer.expiryDate), 'yyyy-MM-dd') : ''}
                                                className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-bold text-foreground"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2">Description</label>
                                        <textarea
                                            name="description"
                                            defaultValue={editingOffer?.description}
                                            rows={3}
                                            placeholder="Define the scope of this offer..."
                                            className="w-full px-6 py-4 bg-muted border border-border rounded-2xl focus:border-primary/50 transition-all outline-none font-medium text-sm placeholder:text-muted-foreground/20 text-foreground resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <Button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            variant="outline"
                                            className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={offerMutation.isPending}
                                            type="submit"
                                            className="flex-[2] h-16 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all"
                                        >
                                            {offerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingOffer ? 'Confirm Update' : 'Deploy Offer'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
