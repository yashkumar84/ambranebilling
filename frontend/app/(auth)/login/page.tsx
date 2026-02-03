'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react'
import { gsap } from 'gsap'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { useAuthStore } from '@/store/authStore'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const formRef = useRef<HTMLDivElement>(null)
    const { setAuth } = useAuthStore()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(formRef.current.children,
                {
                    opacity: 0,
                    y: 20,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.08,
                    ease: 'power2.out',
                }
            )
        }
    }, [])

    const onSubmit = async (data: LoginValues) => {
        setIsLoading(true)

        try {
            const response = await api.post(endpoints.auth.login, {
                email: data.email,
                password: data.password,
            })

            // Backend returns ApiResponse.success(user, 'Login successful')
            // So response.data.data IS the user object directly

            // DEBUG: Log everything
            console.log('🔍 Full Response:', response)
            console.log('📦 response.data:', response.data)
            console.log('📦 response.data.data:', response.data.data)
            console.log('📦 typeof response.data.data:', typeof response.data.data)
            console.log('📦 Object.keys(response.data.data):', Object.keys(response.data.data || {}))

            const user = response.data.data

            // DEBUG: Log the user object
            console.log('🔍 Login Response:', response.data)
            console.log('👤 User Object:', user)
            console.log('🔐 isSuperAdmin:', user.isSuperAdmin)
            console.log('📧 Email:', user.email)

            // Store auth data (tokens are handled by HttpOnly cookies)
            setAuth(user)

            toast.success('Welcome back! Login successful.')

            // Redirect based on user type
            console.log('🚀 Redirecting...', user.isSuperAdmin ? '/super-admin' : '/dashboard')
            if (user.isSuperAdmin) {
                router.push('/super-admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            let errorMessage = 'Unable to login. Please try again.'

            if (err.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials.'
            } else if (err.status === 500) {
                errorMessage = 'Server error. Please try again in a moment.'
            } else if (err.status === 429) {
                errorMessage = 'Too many login attempts. Please wait a moment.'
            } else if (!navigator.onLine) {
                errorMessage = 'No internet connection. Please check your network.'
            }

            toast.error(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
        >
            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-8 border-2 border-slate-200 dark:border-slate-700 relative z-10">
                <div ref={formRef}>
                    {/* Logo/Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            className="inline-block mb-5"
                        >
                            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-3xl font-black mb-2 text-slate-950 dark:text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">
                            Sign in to continue your journey
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-950 dark:text-white mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-500'}`} />
                                <input
                                    {...register('email')}
                                    type="email"
                                    className={`w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-slate-950 dark:text-white placeholder-slate-500 font-medium ${errors.email ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-400 dark:border-slate-600'}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-slate-950 dark:text-white mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${errors.password ? 'text-red-500' : 'text-slate-500'}`} />
                                <input
                                    {...register('password')}
                                    type={showPassword ? 'text' : 'password'}
                                    className={`w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800 border-2 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-slate-950 dark:text-white placeholder-slate-500 font-medium ${errors.password ? 'border-red-500 bg-red-50/50 dark:bg-red-900/20' : 'border-slate-400 dark:border-slate-600'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1.5 text-xs font-medium text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all"
                                />
                                <span className="ml-2 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors font-medium">Remember me</span>
                            </label>
                            <a href="#" className="font-bold text-primary hover:underline decoration-2 underline-offset-4 transition-all">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-6 gradient-primary text-white rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-semibold">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        className="w-full py-3.5 px-4 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-3 shadow-md"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </motion.button>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-slate-700 dark:text-slate-300 font-medium">
                        Don't have an account?{' '}
                        <a href="/register" className="font-bold text-primary hover:underline decoration-2 underline-offset-4 transition-all">
                            Sign up for free →
                        </a>
                    </p>
                </div>
            </div>
        </motion.div>
    )
}
