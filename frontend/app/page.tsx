'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChefHat, TrendingUp, Users, Zap } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function Home() {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(heroRef.current.children,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
        }
      )
    }
  }, [])

  const features = [
    {
      icon: <ChefHat className="w-8 h-8" />,
      title: 'Smart Menu Management',
      description: 'Organize your menu with categories, pricing, and availability',
      gradient: 'gradient-primary',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Lightning Fast Orders',
      description: 'Process orders quickly with our intuitive POS interface',
      gradient: 'gradient-secondary',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Real-time Analytics',
      description: 'Track sales, revenue, and performance in real-time',
      gradient: 'gradient-accent',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Management',
      description: 'Manage staff with role-based permissions',
      gradient: 'gradient-primary',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 selection:bg-primary/30">
      {/* Animated Background Orbs - Adjusted opacity for better visibility */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-primary/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-20 -right-10 w-96 h-96 bg-secondary/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-accent/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 container mx-auto px-4 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold uppercase tracking-widest animate-pulse">
            Next Generation POS
          </div>
          <h1 className="text-6xl md:text-9xl font-black mb-8 text-slate-950 dark:text-white tracking-tight leading-[0.9]">
            Ambrane <br />
            <span className="text-primary italic relative">
              Billing
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span>
          </h1>
          <p className="text-xl md:text-3xl text-slate-800 dark:text-slate-200 mb-10 max-w-3xl mx-auto font-bold tracking-tight">
            The ultimate restaurant management system.
          </p>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
            From smart menu orchestration to real-time analytics, streamline every byte of your restaurant operations with precision and style.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px -15px rgba(var(--primary), 0.5)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/login')}
              className="px-12 py-5 gradient-primary text-white rounded-2xl font-black text-lg shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started <Zap className="w-5 h-5 fill-current" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/register')}
              className="px-12 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-lg shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary transition-all duration-300"
            >
              Free Trial
            </motion.button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-300 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[5rem] translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500" />
              <div className={`w-16 h-16 rounded-2xl ${feature.gradient} flex items-center justify-center text-white mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 text-slate-950 dark:text-white tracking-tight">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-slate-100 dark:border-slate-800 pt-20"
        >
          {[
            { number: '1.2M+', label: 'Orders Processed' },
            { number: '2.5K+', label: 'Global Restaurants' },
            { number: '99.99%', label: 'System Uptime' },
          ].map((stat, index) => (
            <div key={index} className="text-center group bg-slate-50/50 dark:bg-slate-900/50 p-10 rounded-3xl hover:bg-white dark:hover:bg-slate-900 transition-all duration-500 border border-transparent hover:border-primary/10">
              <div className="text-6xl md:text-7xl font-black text-slate-950 dark:text-white mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">
                {stat.number}
              </div>
              <div className="text-slate-500 dark:text-slate-400 text-xl font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
