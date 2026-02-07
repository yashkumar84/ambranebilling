'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Phone, ArrowRight, Sparkles, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'

export default function CustomerLoginPage() {
    const router = useRouter()
    const { tenantId } = useParams()
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // In a real app, we might send an OTP here. 
            // For now, we just verify the profile exists in this tenant.
            const response = await api.get(`/api/public/hub/${tenantId}/${phone}`)

            if (response.data.success) {
                // Persist session locally (keyed by tenant to keep it store-specific)
                localStorage.setItem(`customer_session_${tenantId}`, JSON.stringify({
                    phone,
                    tenantId,
                    lastAccess: new Date().toISOString()
                }))

                toast.success('Identity Verified. Accessing Hub.')
                router.push(`/order/${tenantId}/hub`)
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Profile not found. Please place an order first.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#02040a] text-white selection:bg-teal-500/30">
            {/* Luminous Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1.05, 1],
                        opacity: [0.3, 0.4, 0.35, 0.3],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-gradient-to-r from-teal-500/10 via-emerald-400/20 to-cyan-500/10 blur-[180px]"
                />
            </div>

            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-12 text-center"
                >
                    <div className="space-y-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-teal-400"
                        >
                            <Sparkles className="w-3 h-3" /> Identity Access
                        </motion.div>
                        <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
                            Access Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300">Hub.</span>
                        </h1>
                        <p className="text-white/30 text-sm font-medium">Verify your registered mobile number to <br /> check rewards and offers.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 text-left">
                        <div className="group relative">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 italic group-focus-within:text-teal-400 transition-colors">Mobile Number</label>
                            <div className="relative mt-4">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-teal-400 transition-colors" />
                                <input
                                    required
                                    type="tel"
                                    placeholder="Enter Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-16 pr-8 py-6 bg-white/[0.03] border border-white/10 rounded-3xl group-hover:bg-white/[0.05] group-hover:border-white/20 focus:border-teal-400/50 outline-none font-black text-lg tracking-[0.2em] transition-all uppercase placeholder:text-white/5"
                                />
                            </div>
                        </div>

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
                                    Verify Identity <Phone className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pt-10">
                        <ShieldCheck className="w-3 h-3 text-teal-400" /> Secure Link Active
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
