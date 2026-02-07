'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShieldCheck, Sparkles, Fingerprint, ChevronRight, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const setAuth = useAuthStore((state: any) => state.setAuth)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
    })

    const onLogin = async (data: LoginValues) => {
        setIsLoading(true)
        try {
            const response = await api.post(endpoints.auth.login, data)
            const userData = response.data.data
            setAuth(userData)

            toast.success(`Access Granted. Welcome, ${userData.name.split(' ')[0]}.`)

            if (userData.isSuperAdmin) {
                router.push('/dashboard/super-admin')
            } else if (!userData.tenantId) {
                router.push('/onboarding')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Access Denied: Check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen px-6 md:px-20 py-12 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto w-full">

                {/* Left Column: Cinematic Headline */}
                <div className="space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-3 text-violet-400 font-bold text-xs uppercase tracking-[0.4em]">
                            <ShieldCheck className="w-4 h-4" /> Secure Auth
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            Welcome <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-300 to-white/50">Back.</span>
                        </h1>
                        <p className="text-white/40 text-xl font-medium max-w-sm leading-relaxed">
                            Authorized access to the Ambrane Command Center.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 w-fit">
                            <Fingerprint className="w-4 h-4 text-white/40" />
                            <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">Biometric Tunnel Ready</span>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Borderless Luminous Form */}
                <form onSubmit={handleSubmit(onLogin)} className="space-y-12 relative">
                    <div className="space-y-4">
                        <h2 className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Session Initialization</h2>
                        <div className="space-y-8">
                            {/* Email Island */}
                            <div className="space-y-3 group">
                                <div className="relative">
                                    <input
                                        {...register('email')}
                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-t-[2rem] focus:bg-white/[0.08] focus:border-violet-400 outline-none transition-all text-white text-2xl font-bold placeholder:text-white/10"
                                        placeholder="Email Address"
                                    />
                                    <Mail className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-violet-400 transition-colors" />
                                </div>
                                {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.email.message}</p>}
                            </div>

                            {/* Password Island */}
                            <div className="space-y-3 group">
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        type={showPassword ? 'text' : 'password'}
                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-b-[2rem] focus:bg-white/[0.08] focus:border-fuchsia-400 outline-none transition-all text-white text-2xl font-bold tracking-widest placeholder:text-white/10"
                                        placeholder="Password"
                                    />
                                    <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors">
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.password.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="inline-flex items-center gap-4 text-white group disabled:opacity-50"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                {isLoading ? <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-8 h-8" />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.4em]">Sign In</span>
                        </motion.button>

                        <div className="flex items-center gap-6">
                            <div className="h-px flex-1 bg-white/5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">or connect with</span>
                            <div className="h-px flex-1 bg-white/5" />
                        </div>

                        <button type="button" className="flex items-center gap-3 text-white/40 hover:text-white transition-colors">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">Connect Google</span>
                        </button>
                    </div>

                    {/* Ambient Background Accents */}
                    <div className="absolute -z-10 -bottom-20 -left-20 w-64 h-64 bg-fuchsia-400/5 blur-[100px] rounded-full" />
                </form>
            </div>

            {/* Footer Legend */}
            <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-8 max-w-7xl mx-auto w-full">
                <div className="flex gap-10">
                    <div className="space-y-1">
                        <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">System</p>
                        <p className="text-white text-[10px] font-bold tracking-widest">AMBRANE NETWORK v4.0</p>
                    </div>
                </div>
                <div className="flex gap-12 items-center">
                    <a href="/register" className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors pb-1 border-b border-transparent hover:border-white/20">New Store? Sign Up</a>
                </div>
            </div>
        </div>
    )
}
