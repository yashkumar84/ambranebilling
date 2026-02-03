'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, MapPin, Phone, Briefcase, ArrowRight, Loader2, CreditCard, CheckCircle2 } from 'lucide-react'
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
    const [tenantCreated, setTenantCreated] = useState(false)
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'RESTAURANT',
        address: '',
        phone: '',
        gstNumber: ''
    })

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Create Tenant (with isActive: false)
            const response = await api.post('/api/tenants', {
                ...formData,
                planId: planId || 'starter'
            })

            const { tenant, user: updatedUser, accessToken, refreshToken } = response.data

            // 2. Update local state with new tokens
            setUser(updatedUser)
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken)
            }
            if (refreshToken) {
                localStorage.setItem('refreshToken', refreshToken)
            }

            setTenantCreated(true)
            toast.success('Store created! Now complete payment to activate.')

            // 3. Initiate Payment
            await initiatePayment()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create your store')
            setLoading(false)
        }
    }

    const initiatePayment = async () => {
        try {
            setStep('payment')

            // 1. Create Razorpay Order
            const orderResponse = await api.post('/api/subscriptions/purchase', {
                planId: planId || 'starter',
                billingCycle: 'MONTHLY'
            })

            const order = orderResponse.data

            // 2. Open Razorpay Modal
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
                    color: '#8B5CF6'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false)
                        setStep('form')
                        toast.error('Payment cancelled. Please try again to activate your store.')
                    }
                }
            }

            const rzp = new window.Razorpay(options)
            rzp.open()
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to initiate payment')
            setLoading(false)
            setStep('form')
        }
    }

    const verifyPayment = async (paymentData: any) => {
        try {
            // Verify payment on backend
            await api.post('/api/subscriptions/verify', {
                orderId: paymentData.razorpay_order_id,
                paymentId: paymentData.razorpay_payment_id,
                signature: paymentData.razorpay_signature
            })

            setStep('success')
            toast.success('Payment successful! Your store is now active.')

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Payment verification failed')
            setLoading(false)
            setStep('form')
        }
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">Payment Successful!</h1>
                    <p className="text-gray-400 mb-4">Your store is now active. Redirecting to dashboard...</p>
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30"
                    >
                        {step === 'payment' ? (
                            <CreditCard className="w-10 h-10 text-primary" />
                        ) : (
                            <Building2 className="w-10 h-10 text-primary" />
                        )}
                    </motion.div>
                    <h1 className="text-3xl font-black tracking-tighter mb-2 uppercase">
                        {step === 'payment' ? 'Complete Payment' : 'Set up your store'}
                    </h1>
                    <p className="text-gray-400">
                        {step === 'payment'
                            ? 'Pay to activate your store and unlock all features.'
                            : 'Tell us about your business to get started.'}
                    </p>
                </div>

                {step === 'payment' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card p-8 rounded-[2rem] border border-white/5 shadow-2xl text-center"
                    >
                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-lg font-bold mb-2">Opening payment gateway...</p>
                        <p className="text-sm text-gray-400">Please complete the payment to activate your store.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card p-8 rounded-[2rem] border border-white/5 shadow-2xl"
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Business Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Business Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Vanta Coffee Roasters"
                                        value={formData.businessName}
                                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold placeholder:font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Business Type */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Business Type</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                    <select
                                        value={formData.businessType}
                                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all appearance-none"
                                    >
                                        <option value="RESTAURANT">Restaurant / Cafe</option>
                                        <option value="KIRANA">Kirana / Grocery</option>
                                        <option value="CONFECTIONARY">Confectionary / Bakery</option>
                                        <option value="CLOTHING">Clothing / Boutique</option>
                                        <option value="OTHER">Other Retail</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Business Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+91 ..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold placeholder:font-medium transition-all"
                                        />
                                    </div>
                                </div>

                                {/* GST */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">GST Number (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="27AAAAA..."
                                        value={formData.gstNumber}
                                        onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold placeholder:font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Business Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-600" />
                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Street, City, Pin Code"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold placeholder:font-medium transition-all resize-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-2xl bg-primary text-white font-black text-sm tracking-widest uppercase hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Continue to Payment
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
