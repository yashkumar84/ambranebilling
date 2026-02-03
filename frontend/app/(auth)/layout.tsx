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
        <div className="min-h-screen gradient-animated relative overflow-hidden selection:bg-primary/30">
            {/* Background Orbs - Original Style */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)`,
                        filter: 'blur(100px)',
                    }}
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -80, 0],
                        y: [0, 80, 0],
                        rotate: [360, 180, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2,
                    }}
                    className="absolute -top-20 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
                    style={{
                        background: `radial-gradient(circle, hsl(var(--secondary)) 0%, transparent 70%)`,
                        filter: 'blur(100px)',
                    }}
                />
            </div>

            {/* Decorative Grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            {/* Floating Particles - Hydration Safe */}
            {mounted && (
                <div className="fixed inset-0 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-primary/20"
                            style={{
                                left: `${(i * 7) % 100}%`,
                                top: `${(i * 13) % 100}%`,
                                width: `${(i % 4) + 2}px`,
                                height: `${(i % 4) + 2}px`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.2, 0.5, 0.2],
                            }}
                            transition={{
                                duration: 3 + (i % 3),
                                repeat: Infinity,
                                delay: i * 0.1,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Content Container */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="auth-content"
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
