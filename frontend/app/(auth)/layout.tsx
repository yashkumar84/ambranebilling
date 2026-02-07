'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme } from '@/lib/theme'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const theme = getStoredTheme()
        applyTheme(theme)
    }, [])

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#02040a] selection:bg-teal-500/30">
            {/* Core Luminous Plasma Field - Centered Brilliance */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {/* Central Primary Glow */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1.1, 1],
                        opacity: [0.3, 0.45, 0.35, 0.3],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-gradient-to-r from-teal-500/30 via-cyan-400/20 to-violet-500/30 blur-[160px]"
                />

                {/* Shifting Aurora Orbs */}
                <motion.div
                    animate={{
                        x: ['-10%', '10%', '-5%', '-10%'],
                        y: ['-5%', '15%', '0%', '-5%'],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute top-[10%] left-[15%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px]"
                />
                <motion.div
                    animate={{
                        x: ['10%', '-15%', '5%', '10%'],
                        y: ['15%', '-10%', '0%', '15%'],
                        rotate: [0, -90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    className="absolute bottom-[10%] right-[15%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[130px]"
                />
            </div>

            {/* Prismatic Overlay Layer */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03)_0%,transparent_100%)]" />
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Boundless Content Container */}
            <div className="relative z-10 w-full min-h-screen">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="auth-content"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
