'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Sparkles, Key, ChevronLeft } from 'lucide-react'
import { gsap } from 'gsap'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional().refine(val => !val || /^\+?[1-9]\d{9,14}$/.test(val), {
        message: 'Invalid phone number format'
    }),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const [step, setStep] = useState<'details' | 'otp'>('details')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    const router = useRouter()
    const containerRef = useRef<HTMLDivElement>(null)

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        getValues,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        }
    })

    const emailValue = watch('email')

    useEffect(() => {
        let timer: NodeJS.Timeout
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown(prev => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [cooldown])

    const handleSendOtp = async () => {
        const isStep1Valid = await trigger()
        if (!isStep1Valid) return

        setSendingOtp(true)
        try {
            await api.post('/api/auth/send-otp', { email: emailValue })
            toast.success('OTP sent successfully! Check your email.')
            setCooldown(60)
            setStep('otp')
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to send OTP'
            toast.error(msg)
        } finally {
            setSendingOtp(false)
        }
    }

    const onOtpChange = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1)
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus()
        }
    }

    const onOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus()
        } else if (e.key === 'Enter' && otp.every(digit => digit !== '')) {
            handleRegister()
        }
    }

    const handleRegister = async () => {
        const otpCode = otp.join('')
        if (otpCode.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP')
            return
        }

        setIsLoading(true)
        const { confirmPassword, ...formData } = getValues()

        try {
            await api.post(endpoints.auth.register, {
                ...formData,
                phone: formData.phone || undefined,
                otpCode,
            })

            toast.success('Account created successfully! Please login.')
            router.push('/login')
        } catch (err: any) {
            let errorMessage = err.response?.data?.message || 'Registration failed. Please try again.'
            toast.error(errorMessage)

            // If OTP is invalid, stay on OTP step
            if (err.status !== 400 || !errorMessage.toLowerCase().includes('otp')) {
                // For other errors, maybe we need to go back? 
                // Usually 409 (Conflict) stays on details, but we are already on OTP.
            }
        } finally {
            setIsLoading(false)
        }
    }

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
        >
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 border border-gray-100 dark:border-slate-700/50">
                <AnimatePresence mode="wait">
                    {step === 'details' ? (
                        <motion.div
                            key="details"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header */}
                            <div className="text-center mb-6">
                                <motion.div
                                    animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
                                    transition={{
                                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                    }}
                                    className="inline-block mb-4"
                                >
                                    <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                                        <Sparkles className="w-8 h-8 text-white" />
                                    </div>
                                </motion.div>

                                <h1 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                    Create Account
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 font-medium">
                                    Join us and start your journey
                                </p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Full Name</label>
                                    <div className="relative">
                                        <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.name ? 'text-red-500' : 'text-slate-500'}`} />
                                        <input
                                            {...register('name')}
                                            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-slate-950 dark:text-white font-medium ${errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 shadow-sm'}`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.email ? 'text-red-500' : 'text-slate-500'}`} />
                                        <input
                                            {...register('email')}
                                            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-slate-950 dark:text-white font-medium ${errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 shadow-sm'}`}
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Phone Number (Optional)</label>
                                    <div className="relative">
                                        <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.phone ? 'text-red-500' : 'text-slate-500'}`} />
                                        <input
                                            {...register('phone')}
                                            type="tel"
                                            className={`w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-slate-950 dark:text-white font-medium ${errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 shadow-sm'}`}
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5 uppercase tracking-wide">Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.password ? 'text-red-500' : 'text-slate-500'}`} />
                                        <input
                                            {...register('password')}
                                            type={showPassword ? 'text' : 'password'}
                                            className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-900 border-2 rounded-xl focus:ring-2 focus:ring-secondary focus:border-transparent transition-all text-slate-950 dark:text-white font-medium ${errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 shadow-sm'}`}
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                                        <input
                                            {...register('confirmPassword')}
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            className={`w-full pl-12 pr-12 py-3 bg-white dark:bg-slate-900/50 border-2 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all text-gray-900 dark:text-white ${errors.confirmPassword ? 'border-red-200 dark:border-red-900/50' : 'border-gray-200 dark:border-slate-600 shadow-sm'}`}
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={sendingOtp}
                                    className="w-full py-3.5 gradient-secondary text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {sendingOtp ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Register <ArrowRight className="w-5 h-5" /></>
                                    )}
                                </motion.button>
                            </form>

                            <div className="relative my-7">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-slate-700" /></div>
                                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-800 text-gray-400">Or continue with</span></div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3.5 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-600 rounded-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 shadow-sm hover:border-[var(--color-secondary)]"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </motion.button>

                            <p className="mt-8 text-center text-sm text-gray-500">
                                Already have an account? <a href="/login" className="font-bold text-[var(--color-secondary)] hover:underline">Sign in →</a>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                        >
                            <button
                                onClick={() => setStep('details')}
                                className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-secondary)] transition-colors mb-6 group"
                            >
                                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                                Back to details
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 gradient-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Key className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2">Verify Email</h1>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Enter the 6-digit code sent to <br />
                                    <span className="font-bold text-gray-900 dark:text-white">{emailValue}</span>
                                </p>
                            </div>

                            <div className="flex justify-between gap-2 mb-8">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={(el) => { otpRefs.current[idx] = el }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => onOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => onOtpKeyDown(idx, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary transition-all outline-none text-blue-600 dark:text-blue-400 shadow-sm"
                                    />
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleRegister}
                                disabled={isLoading}
                                className="w-full py-3.5 gradient-secondary text-white rounded-xl font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mb-6"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Verify & Create Account <ArrowRight className="w-5 h-5" /></>
                                )}
                            </motion.button>

                            <div className="text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp || cooldown > 0}
                                    className="text-sm font-bold text-[var(--color-secondary)] hover:underline disabled:opacity-50"
                                >
                                    {sendingOtp ? 'Sending...' : (cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
