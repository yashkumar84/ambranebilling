'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Rocket, Crown, Loader2, ArrowRight, ShieldCheck, Sparkles, Star, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Plan {
    id: string
    name: string
    priceMonthly: number
    priceYearly: number
    features: any
}

const planIcons: Record<string, any> = {
    'Starter': Rocket,
    'Professional': Zap,
    'Enterprise': Crown
}

const planGlows: Record<string, string> = {
    'Starter': 'from-teal-500/20 to-cyan-500/20',
    'Professional': 'from-cyan-400/30 to-blue-500/30',
    'Enterprise': 'from-violet-500/20 to-fuchsia-500/20'
}

const planAccents: Record<string, string> = {
    'Starter': 'text-teal-400',
    'Professional': 'text-cyan-400',
    'Enterprise': 'text-violet-400'
}

export default function SubscriptionPage() {
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY')

    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        try {
            const response = await api.get('/api/subscriptions/plans')
            setPlans(response.data.data)
        } catch (error) {
            toast.error('Failed to load subscription plans')
        } finally {
            setLoading(false)
        }
    }

    const handleSelectPlan = (planId: string) => {
        router.push(`/onboarding?plan=${planId}&cycle=${billingCycle}`)
    }

    const handleStartTrial = () => {
        const starterPlan = plans.find(p => p.name === 'Starter')
        router.push(`/onboarding?plan=${starterPlan?.id || 'starter'}&trial=true`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 border-2 border-teal-500/30 border-t-teal-500 rounded-full"
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#02040a] selection:bg-teal-500/30 text-white">
            {/* Boundless Luminous Background - Synced with Auth Style */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1.1, 1],
                        opacity: [0.3, 0.45, 0.35, 0.3],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-500/20 via-cyan-400/30 to-violet-500/20 blur-[180px]"
                />
            </div>

            {/* Prismatic Overlays */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <div className="relative z-10 w-full min-h-screen px-6 md:px-20 py-16 flex flex-col items-center">
                <div className="max-w-7xl w-full">

                    {/* Cinematic Header Section - Two-Column Style */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-end mb-24">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400"
                            >
                                <Sparkles className="w-3 h-3" /> Select Your Tier
                            </motion.div>
                            <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter">
                                Unlock <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-white/50">Velocity.</span>
                            </h1>
                        </div>

                        <div className="space-y-8 pb-4">
                            <p className="text-white/40 text-xl font-medium max-w-md leading-relaxed">
                                Deploy the most advanced commerce OS for your establishment. No hidden fees, just pure scale.
                            </p>

                            {/* Cinematic Billing Toggle */}
                            <div className="flex items-center gap-6">
                                <button
                                    onClick={() => setBillingCycle('MONTHLY')}
                                    className={`text-xs font-black uppercase tracking-[0.3em] transition-all ${billingCycle === 'MONTHLY' ? 'text-white' : 'text-white/20'}`}
                                >
                                    Monthly
                                </button>
                                <div
                                    onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
                                    className="w-14 h-7 rounded-full bg-white/5 border border-white/10 relative p-1 cursor-pointer transition-colors hover:border-white/20"
                                >
                                    <motion.div
                                        animate={{ x: billingCycle === 'MONTHLY' ? 0 : 28 }}
                                        className="w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                    />
                                </div>
                                <button
                                    onClick={() => setBillingCycle('YEARLY')}
                                    className={`text-xs font-black uppercase tracking-[0.3em] transition-all ${billingCycle === 'YEARLY' ? 'text-white' : 'text-white/20'}`}
                                >
                                    Yearly <span className="text-[10px] text-teal-400 ml-2">SAVE 20%</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Boundless Pricing Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 items-stretch mb-24">
                        {plans.map((plan, index) => {
                            const Icon = planIcons[plan.name] || Rocket
                            const glowClass = planGlows[plan.name] || 'from-white/10 to-white/5'
                            const accentClass = planAccents[plan.name] || 'text-white'
                            const isPopular = plan.name === 'Professional'

                            return (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.8 }}
                                    className="relative h-full"
                                >
                                    {/* Ghost Tier Container - No Boxes */}
                                    <div className="relative p-10 space-y-10 group h-full flex flex-col">

                                        {/* Cinematic Plan Title */}
                                        <div className="space-y-4">
                                            {isPopular && (
                                                <div className="absolute -top-6 left-10 flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400">
                                                    <Star className="w-3 h-3 fill-current" /> Most Recommended
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-3xl font-black uppercase tracking-tighter">{plan.name}</h3>
                                                <Icon className={`w-8 h-8 ${accentClass} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-6xl font-black tracking-tighter">₹{billingCycle === 'MONTHLY' ? plan.priceMonthly : plan.priceYearly}</span>
                                                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">/ {billingCycle === 'MONTHLY' ? 'Mo' : 'Yr'}</span>
                                            </div>
                                        </div>

                                        {/* Feature Island - Flex Grow to fill height */}
                                        <div className="flex-1 p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] group-hover:bg-white/[0.05] group-hover:border-white/20 transition-all duration-500 min-h-[480px]">
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 ml-2 italic">Included Capabilities</h4>
                                            <ul className="space-y-5">
                                                {Object.entries(plan.features).map(([key, value]) => {
                                                    if (value === false) return null
                                                    return (
                                                        <li key={key} className="flex items-center gap-4 text-sm font-medium text-white/60 group-hover:text-white transition-colors">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border border-white/10 ${isPopular ? 'bg-cyan-400/10 border-cyan-400/20' : ''}`}>
                                                                <Check className={`w-3 h-3 ${isPopular ? 'text-cyan-400' : 'text-white/40'}`} />
                                                            </div>
                                                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>

                                        {/* High-Velocity CTA */}
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelectPlan(plan.id)}
                                            className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.4em] transition-all relative overflow-hidden group/btn ${isPopular
                                                ? 'bg-white text-black shadow-[0_20px_50px_rgba(255,255,255,0.1)]'
                                                : 'bg-white/5 text-white/60 hover:text-white border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                Start Execution <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </span>
                                        </motion.button>
                                    </div>

                                    {/* Ambient Plan Glow */}
                                    <div className={`absolute inset-0 -z-10 bg-gradient-to-b ${glowClass} opacity-0 group-hover:opacity-100 blur-[80px] transition-opacity duration-1000`} />
                                </motion.div>
                            )
                        })}
                    </div>

                    {/* Secondary Action - Trial */}
                    <div className="flex flex-col items-center gap-10">
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={handleStartTrial}
                            className="group flex flex-col items-center gap-4"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/30 group-hover:text-cyan-400 transition-colors">Not Ready for Commitment?</span>
                            <div className="flex items-center gap-4 px-10 py-5 bg-white/5 border border-white/10 rounded-full group-hover:bg-white group-hover:text-black transition-all">
                                <ShieldCheck className="w-5 h-5 text-cyan-400 group-hover:text-black" />
                                <span className="text-xs font-bold uppercase tracking-widest">Activate 7-Day Precision Trial</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </div>
                        </motion.button>

                        <div className="h-px w-24 bg-white/10" />

                        <div className="text-center space-y-2 opacity-30">
                            <p className="text-[9px] font-black uppercase tracking-[0.5em]">Enterprise Grade SLA Available</p>
                            <p className="text-xs font-medium italic">14-Day Satisfaction Guarantee protocol active.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cinematic Navigation Overlay */}
            <div className="fixed top-8 left-8 z-50">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-4 group"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-4 h-4 rotate-180" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">Return</span>
                </button>
            </div>
        </div>
    )
}
