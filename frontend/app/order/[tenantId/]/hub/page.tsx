'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    Sparkles,
    Clock,
    Gift,
    History,
    ArrowLeft,
    ChevronRight,
    Loader2,
    Ticket,
    Copy,
    ArrowUpRight,
    UtensilsCrossed
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function CustomerHubPage() {
    const router = useRouter()
    const { tenantId } = useParams()
    const [loading, setLoading] = useState(true)
    const [customerData, setCustomerData] = useState<any>(null)
    const [offers, setOffers] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState<'rewards' | 'orders' | 'offers'>('rewards')

    useEffect(() => {
        const fetchHubData = async () => {
            const sessionData = localStorage.getItem(`customer_session_${tenantId}`)
            if (!sessionData) {
                router.push(`/order/${tenantId}/login`)
                return
            }

            const { phone } = JSON.parse(sessionData)

            try {
                const [hubRes, offersRes] = await Promise.all([
                    api.get(`/api/public/hub/${tenantId}/${phone}`),
                    api.get(`/api/public/offers/${tenantId}`)
                ])

                setCustomerData(hubRes.data.data)
                setOffers(offersRes.data.data)
            } catch (error) {
                toast.error('Failed to sync your profile.')
                router.push(`/order/${tenantId}/login`)
            } finally {
                setLoading(false)
            }
        }

        fetchHubData()
    }, [tenantId, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#02040a] text-white selection:bg-teal-500/30 pb-20">
            {/* Luminous Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1.1, 1],
                        opacity: [0.2, 0.3, 0.25, 0.2],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-0 right-0 w-[80%] h-[80%] rounded-full bg-gradient-to-b from-teal-500/10 via-emerald-400/5 to-transparent blur-[150px]"
                />
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/5 bg-black/20 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.push(`/order/${tenantId}`)}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Menu
                </button>
                <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-teal-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ambrane Network</span>
                </div>
            </div>

            <div className="relative z-10 px-6 pt-10 max-w-lg mx-auto space-y-10">
                {/* Greeting */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                        Welcome Back, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-white">{customerData?.profile.name.split(' ')[0]}.</span>
                    </h1>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">Member since {new Date().getFullYear()}</p>
                </div>

                {/* Main Fidelity Card: Loyalty Points */}
                <motion.div
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="relative p-10 rounded-[3rem] bg-gradient-to-br from-teal-500/10 via-white/5 to-emerald-500/5 border border-white/10 overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.4)]"
                >
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                <Sparkles className="w-6 h-6 text-teal-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Loyalty Node</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-6xl font-black tracking-tighter tabular-nums">{customerData?.profile.loyaltyPoints}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Total Points Accumulated</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Next Reward</p>
                                <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-2/3 h-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 p-1.5 bg-white/5 rounded-[2rem] border border-white/5">
                    {[
                        { id: 'rewards', label: 'Rewards', icon: Gift },
                        { id: 'orders', label: 'History', icon: History },
                        { id: 'offers', label: 'Offers', icon: Ticket }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3.5 rounded-[1.5rem] flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id
                                    ? 'bg-white text-black font-black'
                                    : 'text-white/40 font-bold hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-[8px] uppercase tracking-[0.2em]">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Dynamic Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {activeTab === 'orders' && (
                            <div className="space-y-4">
                                {customerData?.recentOrders.length > 0 ? (
                                    customerData.recentOrders.map((order: any) => (
                                        <div
                                            key={order.id}
                                            className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/10 text-teal-400">
                                                        #{order.orderNumber.split('-')[1]}
                                                    </span>
                                                    <span className="text-[10px] font-medium text-white/20 uppercase">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-black uppercase tracking-widest">
                                                    ₹{order.totalAmount} — {order.status}
                                                </p>
                                            </div>
                                            <button className="p-3 bg-white/5 rounded-2xl group-hover:bg-teal-500 group-hover:text-black transition-all">
                                                <ArrowUpRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Clock className="w-10 h-10 text-white/5 mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">No execution history found</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'offers' && (
                            <div className="space-y-4">
                                {offers.length > 0 ? (
                                    offers.map((offer: any) => (
                                        <div
                                            key={offer.id}
                                            className="relative p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-white/10 space-y-4 overflow-hidden group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-black uppercase tracking-tighter italic">{offer.title}</h3>
                                                <div className="flex flex-col items-end">
                                                    <p className="text-xl font-black text-teal-400 leading-none">
                                                        {offer.type === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1 italic">OFF</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{offer.code}</span>
                                                    <Copy className="w-3 h-3 text-white/20 hover:text-white cursor-pointer" />
                                                </div>
                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest italic">
                                                    Exp: {offer.expiryDate ? new Date(offer.expiryDate).toLocaleDateString() : 'LIFETIME'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center space-y-4">
                                        <Ticket className="w-10 h-10 text-white/5 mx-auto" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">No active offers available</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'rewards' && (
                            <div className="space-y-8">
                                <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black uppercase tracking-[0.4em] text-teal-400 italic">Available Rewards</h3>
                                        <p className="text-[10px] font-medium text-white/30">Exchange your points for exclusive benefits.</p>
                                    </div>

                                    <div className="space-y-4 opacity-40">
                                        {[
                                            { label: 'Free Dessert', points: 500 },
                                            { label: '15% Discount on Total', points: 1500 },
                                            { label: 'Exclusive VIP Table', points: 5000 }
                                        ].map((reward, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-black/20">
                                                <span className="text-[10px] font-black uppercase tracking-widest">{reward.label}</span>
                                                <span className="text-[10px] font-black text-white/40">{reward.points} PTS</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-center text-white/10">Coming soon to the network</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
