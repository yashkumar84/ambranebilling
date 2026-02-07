'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ShieldCheck, Zap, Globe, Sparkles, ChevronRight, Store, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number required').regex(/^\+?[1-9]\d{9,14}$/, 'Invalid format'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Include an uppercase letter')
        .regex(/[0-9]/, 'Include a number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])
    const router = useRouter()

    const {
        register,
        trigger,
        getValues,
        watch,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange'
    })

    const emailValue = watch('email')

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (cooldown > 0) {
            timer = setInterval(() => setCooldown(prev => prev - 1), 1000)
        }
        return () => clearInterval(timer)
    }, [cooldown])

    const nextStep = async () => {
        let fieldsToValidate: (keyof RegisterValues)[] = []
        if (step === 1) fieldsToValidate = ['name', 'email', 'phone']
        if (step === 2) fieldsToValidate = ['password', 'confirmPassword']

        const isValid = await trigger(fieldsToValidate)
        if (isValid) {
            if (step === 2) {
                handleSendOtp()
            } else {
                setStep((prev) => (prev + 1) as 1 | 2 | 3)
            }
        }
    }

    const handleSendOtp = async () => {
        setIsLoading(true)
        try {
            await api.post('/api/auth/send-otp', { email: emailValue })
            toast.success('Code sent to your email.')
            setCooldown(60)
            setStep(3)
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to send code')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRegister = async () => {
        const otpCode = otp.join('')
        if (otpCode.length !== 6) return toast.error('Enter 6-digit code')

        setIsLoading(true)
        const { confirmPassword, ...formData } = getValues()

        try {
            await api.post(endpoints.auth.register, {
                ...formData,
                otpCode,
            })
            toast.success('Welcome to Ambrane!')
            router.push('/login')
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full min-h-screen px-6 md:px-20 py-12 flex flex-col justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto w-full">

                {/* Left Column: Cinematic Headline */}
                <div className="space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-[0.4em]">
                            <Sparkles className="w-4 h-4" /> Global Network
                        </div>
                        <h1 className="text-7xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
                            Build <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-300 to-white/50">Anything.</span>
                        </h1>
                        <p className="text-white/40 text-xl font-medium max-w-md leading-relaxed">
                            Join over 5,000+ merchants scales their business with Ambrane's intelligent commerce tools.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center gap-12"
                    >
                        <div className="space-y-1">
                            <p className="text-white text-3xl font-black">99.9%</p>
                            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Uptime</p>
                        </div>
                        <div className="w-px h-12 bg-white/10" />
                        <div className="space-y-1">
                            <p className="text-white text-3xl font-black">5.2s</p>
                            <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">Avg Onboard</p>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Borderless Luminous Form */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-10"
                            >
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <h2 className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Phase 01: Identification</h2>
                                        <div className="space-y-8">
                                            {/* Name Island */}
                                            <div className="space-y-3 group">
                                                <div className="relative">
                                                    <input
                                                        {...register('name')}
                                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-t-[2rem] focus:bg-white/[0.08] focus:border-teal-400 outline-none transition-all text-white text-2xl font-bold placeholder:text-white/10"
                                                        placeholder="Name"
                                                    />
                                                    <User className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-teal-400 transition-colors" />
                                                </div>
                                                {errors.name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.name.message}</p>}
                                            </div>

                                            {/* Email Island */}
                                            <div className="space-y-3 group">
                                                <div className="relative">
                                                    <input
                                                        {...register('email')}
                                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 focus:bg-white/[0.08] focus:border-cyan-400 outline-none transition-all text-white text-2xl font-bold placeholder:text-white/10"
                                                        placeholder="Email Address"
                                                    />
                                                    <Mail className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-cyan-400 transition-colors" />
                                                </div>
                                                {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.email.message}</p>}
                                            </div>

                                            {/* Phone Island */}
                                            <div className="space-y-3 group">
                                                <div className="relative">
                                                    <input
                                                        {...register('phone')}
                                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-b-[2rem] focus:bg-white/[0.08] focus:border-emerald-400 outline-none transition-all text-white text-2xl font-bold placeholder:text-white/10"
                                                        placeholder="Phone"
                                                    />
                                                    <Phone className="absolute right-8 top-1/2 -translate-y-1/2 w-5 h-5 text-white/10 group-focus-within:text-emerald-400 transition-colors" />
                                                </div>
                                                {errors.phone && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.phone.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={nextStep}
                                        className="inline-flex items-center gap-4 text-white group"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            <ArrowRight className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.4em]">Next Phase</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-10"
                            >
                                <div className="space-y-12">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Phase 02: Security</h2>
                                            <button onClick={() => setStep(1)} className="text-white/20 hover:text-white flex items-center gap-2 transition-colors">
                                                <ArrowLeft className="w-3 h-3" /> <span className="text-[10px] font-bold uppercase tracking-widest">Back</span>
                                            </button>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="space-y-3 group">
                                                <div className="relative">
                                                    <input
                                                        {...register('password')}
                                                        type={showPassword ? 'text' : 'password'}
                                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-t-[2rem] focus:bg-white/[0.08] focus:border-violet-400 outline-none transition-all text-white text-2xl font-bold tracking-widest placeholder:text-white/10"
                                                        placeholder="Password"
                                                    />
                                                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-white/10 hover:text-white transition-colors">
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-3 group">
                                                <div className="relative">
                                                    <input
                                                        {...register('confirmPassword')}
                                                        type="password"
                                                        className="w-full bg-white/[0.03] border-b border-white/10 px-8 py-6 rounded-b-[2rem] focus:bg-white/[0.08] focus:border-fuchsia-400 outline-none transition-all text-white text-2xl font-bold tracking-widest placeholder:text-white/10"
                                                        placeholder="Confirm"
                                                    />
                                                </div>
                                                {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-4">{errors.confirmPassword.message}</p>}
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={nextStep}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-4 text-white group disabled:opacity-50"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                            {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.4em]">Verify Identity</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-12"
                            >
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em]">Phase 03: Verification</h2>
                                        <p className="text-white/60 text-lg font-medium">Entering the code sent to <span className="text-teal-400 font-bold">{emailValue}</span></p>
                                    </div>

                                    <div className="flex gap-4">
                                        {otp.map((digit, idx) => (
                                            <input
                                                key={idx}
                                                ref={(el) => { otpRefs.current[idx] = el }}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => {
                                                    const value = e.target.value
                                                    if (!/^\d*$/.test(value)) return
                                                    const newOtp = [...otp]
                                                    newOtp[idx] = value.slice(-1)
                                                    setOtp(newOtp)
                                                    if (value && idx < 5) otpRefs.current[idx + 1]?.focus()
                                                }}
                                                className="w-16 h-20 text-center text-4xl font-black bg-white/[0.03] border-b-2 border-white/10 focus:border-teal-400 focus:bg-white/10 transition-all text-white outline-none rounded-2xl"
                                            />
                                        ))}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleRegister}
                                        disabled={isLoading}
                                        className="inline-flex items-center gap-4 text-white group disabled:opacity-50"
                                    >
                                        <div className="w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center group-hover:bg-teal-400 group-hover:text-black transition-all">
                                            {isLoading ? <div className="w-8 h-8 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Zap className="w-8 h-8" />}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.4em]">Finalize Account</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Industrial Background Accents */}
                    <div className="absolute -z-10 -top-20 -right-20 w-64 h-64 bg-teal-400/5 blur-[100px] rounded-full" />
                </div>
            </div>

            {/* Footer Legend */}
            <div className="mt-20 flex items-center justify-between border-t border-white/5 pt-8 max-w-7xl mx-auto w-full">
                <div className="flex gap-10">
                    <div className="space-y-1">
                        <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Protocol</p>
                        <p className="text-white text-[10px] font-bold tracking-widest">TLS 1.3 ENABLED</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Location</p>
                        <p className="text-white text-[10px] font-bold tracking-widest">SECURE CLOUD NODE</p>
                    </div>
                </div>
                <a href="/login" className="text-white/20 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors pb-1 border-b border-transparent hover:border-white/20">Existing Merchant? Sign In</a>
            </div>
        </div>
    )
}
