'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, MapPin, Phone, Briefcase, ArrowRight, Loader2, CreditCard, CheckCircle2, Sparkles, ShieldCheck, ChevronRight, Hash } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function OnboardingPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const planId = searchParams.get('plan')
    const { user, setUser } = useAuthStore()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'RESTAURANT',
        address: '',
        phone: '',
        gstNumber: ''
    })

    const isTrial = searchParams.get('trial') === 'true'
    const billingCycle = searchParams.get('cycle') || 'MONTHLY'

    // Pre-fill phone number if available in user object
    useEffect(() => {
        if (user?.phone && !formData.phone) {
            setFormData(prev => ({ ...prev, phone: user.phone as string }))
        }
    }, [user, formData.phone])

    // Close custom select on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsSelectOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const finalPlanId = planId || 'STARTER'

        try {
            const response = await api.post('/api/tenants', {
                ...formData,
                planId: finalPlanId
            })

            const { user: updatedUser, accessToken, refreshToken } = response.data.data

            setUser(updatedUser)
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken)
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken)
            }

            if (isTrial) {
                setStep('success')
                toast.success('7-Day Trial activated! Enjoy the full experience.')
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 3000)
            } else {
                toast.success('Store created! Initiating secure payment.')
                await initiatePayment(finalPlanId)
            }
        } catch (error: any) {
            // If the error is that they already have a tenant, we should try to move forward
            // The api interceptor flattens error.response into error.status and error.data
            const isConflict =
                (error.status === 400 || error.response?.status === 400) &&
                (error.data?.error?.includes('already belongs') || error.response?.data?.error?.includes('already belongs'))

            if (isConflict) {
                toast.success('Resuming your store setup...')
                if (isTrial) {
                    setStep('success')
                    setTimeout(() => { window.location.href = '/dashboard' }, 3000)
                } else {
                    await initiatePayment(finalPlanId)
                }
                return
            }
            toast.error(error.message || 'Failed to create your store')
            setLoading(false)
        }
    }

    const initiatePayment = async (selectedPlanId?: string) => {
        try {
            setStep('payment')

            const orderResponse = await api.post('/api/subscriptions/purchase', {
                planId: selectedPlanId || planId || 'STARTER',
                billingCycle: billingCycle
            })

            const order = orderResponse.data.data

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Ambrane Billing',
                description: `${planId?.toUpperCase() || 'STARTER'} Plan Subscription`,
                order_id: order.id,
                handler: async function (response: any) {
                    await verifyPayment(response)
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: formData.phone
                },
                theme: {
                    color: '#22d3ee'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                        setStep('form')
                        toast.error('Payment cancelled. You are currently on a 7-day trial.')
                    }
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error: any) {
            toast.error(error.message || 'Failed to initiate payment')
            setLoading(false)
            setStep('form')
        }
    }

    const verifyPayment = async (paymentData: any) => {
        try {
            await api.post('/api/subscriptions/verify', {
                orderId: paymentData.razorpay_order_id,
                paymentId: paymentData.razorpay_payment_id,
                signature: paymentData.razorpay_signature
            })

            setStep('success')
            toast.success('Payment verified. Welcome to Ambrane.')

            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (error: any) {
            toast.error(error.message || 'Payment verification failed')
            setLoading(false)
            setStep('form')
        }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#02040a] text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-teal-500/10 blur-[150px] pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center relative z-10"
                >
                    <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-teal-500/20 shadow-[0_0_50px_rgba(20,184,166,0.1)]">
                        <CheckCircle2 className="w-12 h-12 text-teal-400" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">Identity Confirmed.</h1>
                    <p className="text-white/40 font-medium mb-8">Accessing the primary command center...</p>
                    <div className="w-12 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="w-full h-full bg-teal-400"
                        />
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#02040a] selection:bg-teal-500/30 text-white">
            {/* Boundless Luminous Background - Synced with Auth & Subscription */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.15, 1.05, 1],
                        opacity: [0.3, 0.4, 0.35, 0.3],
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-500/10 via-emerald-400/20 to-cyan-500/10 blur-[180px]"
                />
            </div>

            {/* Prismatic Overlays */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            <div className="relative z-10 w-full min-h-screen px-6 md:px-20 py-20 flex flex-col items-center justify-center">
                <div className="max-w-7xl w-full">

                    {/* Cinematic Layout: Two-Column Composition */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">

                        {/* Column 1: Institutional Authority */}
                        <div className="space-y-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-teal-400"
                            >
                                <Sparkles className="w-3 h-3" /> Store Setup
                            </motion.div>

                            <div className="space-y-6">
                                <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase">
                                    Set up your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-white/50">Store.</span>
                                </h1>
                                <p className="text-white/30 text-xl font-medium max-w-sm leading-relaxed">
                                    Tell us a few details about your business to get started with the network.
                                </p>
                            </div>

                            <div className="pt-8 flex items-center gap-8">
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-teal-400">99.9% UPTIME</p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic text-nowrap">GLOBAL NODE NETWORK</p>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-white/60">ENCRYPTED</p>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic text-nowrap">AES-256 COMPLIANT</p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: The Floating Glass Matrix */}
                        <div className="relative">
                            <AnimatePresence mode="wait">
                                {step === 'payment' ? (
                                    <motion.div
                                        key="payment-loader"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.05 }}
                                        className="p-16 text-center space-y-10"
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <Loader2 className="w-16 h-16 animate-spin text-teal-400 opacity-20" />
                                            <CreditCard className="w-8 h-8 text-white absolute" />
                                        </div>
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Initializing Gateway</h2>
                                            <p className="text-white/40 text-sm font-medium">Please finalize authentication at the secure payment node.</p>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="setup-form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-10"
                                    >
                                        {/* Cinematic Input Islands */}
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Store Name Island */}
                                            <div className="group relative">
                                                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-0 bg-teal-400 group-focus-within:h-12 transition-all duration-500 rounded-full" />
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic group-focus-within:text-teal-400 transition-colors">Business Name</label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                                                        <input
                                                            required
                                                            type="text"
                                                            placeholder="Enter Store Name"
                                                            value={formData.businessName}
                                                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                                            className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:bg-white/[0.08] focus:border-teal-400/50 outline-none font-black text-sm tracking-widest placeholder:text-white/10 transition-all uppercase"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Grid: Type & Contact */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Industry Selection Island */}
                                                <div className="group relative">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic group-focus-within:text-teal-400 transition-colors">Industry</label>
                                                        <div className="relative">
                                                            <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors pointer-events-none z-10" />

                                                            <div className="relative" ref={selectRef}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setIsSelectOpen(!isSelectOpen)}
                                                                    className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:border-teal-400/50 outline-none font-black text-[10px] tracking-[0.2em] transition-all text-left uppercase flex items-center justify-between"
                                                                >
                                                                    <span>{formData.businessType.replace(/_/g, ' ')}</span>
                                                                    <motion.div
                                                                        animate={{ rotate: isSelectOpen ? 180 : 0 }}
                                                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                                    >
                                                                        <ChevronRight className="w-4 h-4 opacity-30 rotate-90" />
                                                                    </motion.div>
                                                                </button>

                                                                <AnimatePresence>
                                                                    {isSelectOpen && (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                            className="absolute left-0 right-0 top-full mt-4 p-2 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                                                                        >
                                                                            {[
                                                                                { id: "RESTAURANT", label: "RESTAURANT / CAFE" },
                                                                                { id: "KIRANA", label: "KIRANA / GROCERY" },
                                                                                { id: "CONFECTIONARY", label: "CONFECTIONARY" },
                                                                                { id: "PHARMACY", label: "PHARMACY" },
                                                                                { id: "RETAIL", label: "GENERAL RETAIL" },
                                                                                { id: "CLOTHING", label: "CLOTHING / APPAREL" },
                                                                                { id: "OTHER", label: "OTHER ENTITY" }
                                                                            ].map((option) => (
                                                                                <button
                                                                                    key={option.id}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setFormData({ ...formData, businessType: option.id })
                                                                                        setIsSelectOpen(false)
                                                                                    }}
                                                                                    className="w-full px-6 py-4 rounded-xl text-[10px] font-black tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/5 transition-all text-left uppercase flex items-center justify-between group/opt"
                                                                                >
                                                                                    {option.label}
                                                                                    {formData.businessType === option.id && (
                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contact Island */}
                                                <div className="group relative">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic group-focus-within:text-teal-400 transition-colors">Phone Number</label>
                                                        <div className="relative">
                                                            <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                                                            <input
                                                                required
                                                                type="tel"
                                                                placeholder="Mobile Number"
                                                                value={formData.phone}
                                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                                className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:border-teal-400/50 outline-none font-black text-sm tracking-widest placeholder:text-white/10 transition-all uppercase"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location Island */}
                                            <div className="group relative">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic group-focus-within:text-teal-400 transition-colors">Business Address</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-6 top-7 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                                                        <textarea
                                                            required
                                                            rows={2}
                                                            placeholder="Full Address"
                                                            value={formData.address}
                                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                            className="w-full pl-16 pr-8 py-6 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:border-teal-400/50 outline-none font-black text-xs leading-relaxed tracking-widest placeholder:text-white/10 transition-all uppercase resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* GST Island (Optional) */}
                                            <div className="group relative opacity-50 focus-within:opacity-100 transition-opacity">
                                                <div className="space-y-4">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic">Tax ID (Optional)</label>
                                                    <div className="relative">
                                                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                                                        <input
                                                            type="text"
                                                            placeholder="GST Number"
                                                            value={formData.gstNumber}
                                                            onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                                            className="w-full pl-16 pr-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:border-teal-400/50 outline-none font-black text-sm tracking-widest placeholder:text-white/10 transition-all uppercase"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* High-Velocity CTA */}
                                        <div className="space-y-6 pt-4">
                                            <motion.button
                                                whileHover={{ scale: 1.02, y: -4 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit"
                                                disabled={loading}
                                                className="w-full py-6 rounded-3xl bg-white text-black font-black text-xs uppercase tracking-[0.4em] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {loading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        Complete Setup <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </motion.button>

                                            <div className="flex items-center justify-center gap-6 opacity-30">
                                                <div className="flex items-center gap-2">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Secure Link Active</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-white/50" />
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">{isTrial ? 'Activation: Trial' : 'Activation: Terminal'}</span>
                                            </div>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>

                            {/* Floating Ambient Light behind form */}
                            <div className="absolute -inset-10 -z-10 bg-teal-400/5 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
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
