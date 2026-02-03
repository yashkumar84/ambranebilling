'use client'

import { motion } from 'framer-motion'
import { Check, Zap, Rocket, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 299,
        description: 'Perfect for small shops & cafes',
        features: ['1 User', '50 Products', '1,000 Bills/mo', 'Thermal Printing', 'Basic Reports'],
        icon: Rocket,
        color: 'from-blue-500/20 to-blue-600/20',
        borderColor: 'border-blue-500/30'
    },
    {
        id: 'pro',
        name: 'Professional',
        price: 699,
        description: 'Best for growing restaurants',
        features: ['5 Users', '500 Products', 'Unlimited Bills', 'QR Ordering', 'Inventory Management', 'KOT Support', 'WhatsApp Alerts'],
        icon: Zap,
        color: 'from-primary/20 to-primary/30',
        borderColor: 'border-primary',
        popular: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 1499,
        description: 'For large franchises & multi-stores',
        features: ['Unlimited Users', 'Unlimited Products', 'Multi-Store Sync', 'Batch & Expiry Tracking', 'AI Pricing Insights', '24/7 Priority Support'],
        icon: Crown,
        color: 'from-purple-500/20 to-purple-600/20',
        borderColor: 'border-purple-500/30'
    }
]

export default function SubscriptionPage() {
    const router = useRouter()
    const { user } = useAuthStore()

    const handleSelectPlan = (planId: string) => {
        // In a real app, this would redirect to a payment gateway
        // For now, we simulate success and move to onboarding
        router.push(`/onboarding?plan=${planId}`)
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4"
                    >
                        Choose Your Power
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
                    >
                        TRANSFORM YOUR <span className="text-primary italic">BUSINESS</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg max-w-2xl mx-auto"
                    >
                        You're just one step away from the most powerful POS experience.
                        Select a plan that fits your ambition.
                    </motion.p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            className={`relative group p-8 rounded-[2.5rem] bg-card border-2 transition-all hover:scale-[1.02] ${plan.borderColor} ${plan.popular ? 'shadow-2xl shadow-primary/20' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full z-10">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                                <plan.icon className="w-8 h-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-6 h-10">{plan.description}</p>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black tracking-tighter">₹{plan.price}</span>
                                <span className="text-gray-500 font-bold">/mo</span>
                            </div>

                            <ul className="space-y-4 mb-10 h-64 overflow-y-auto no-scrollbar">
                                {plan.features.map(feature => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Check className="w-3 h-3 text-primary" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all ${plan.popular
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:shadow-primary/50'
                                        : 'bg-white text-black hover:bg-gray-200'
                                    }`}
                            >
                                Get Started
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center mt-12 text-gray-500 text-sm font-medium"
                >
                    All plans come with a 7-day money-back guarantee. No hidden fees.
                </motion.p>
            </div>
        </div>
    )
}
