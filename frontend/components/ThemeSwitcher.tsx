'use client'

import { motion } from 'framer-motion'
import { Palette, Check } from 'lucide-react'
import { applyTheme, themes, type ThemeName } from '@/lib/theme'
import { useState, useEffect } from 'react'

export default function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState<ThemeName>('pastel')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme') as ThemeName
            if (stored && themes[stored]) {
                setCurrentTheme(stored)
            }
        }
    }, [])

    const handleThemeChange = (themeName: ThemeName) => {
        setCurrentTheme(themeName)
        applyTheme(themeName)
        setIsOpen(false)
    }

    const themeColors: Record<ThemeName, { primary: string; secondary: string; background: string }> = {
        pastel: { primary: '#9ECAD6', secondary: '#748DAE', background: '#F8FAFC' },
        teal: { primary: '#062925', secondary: '#3A9188', background: '#041B18' },
        sky: { primary: '#9FB3DF', secondary: '#9EC6F3', background: '#F0F9FF' },
        default: { primary: '#3B82F6', secondary: '#F59E0B', background: '#FFFFFF' },
        forest: { primary: '#10B981', secondary: '#F59E0B', background: '#F0FDF4' },
        sunset: { primary: '#F59E0B', secondary: '#EF4444', background: '#FFF7ED' },
        ocean: { primary: '#06B6D4', secondary: '#A855F7', background: '#ECFEFF' },
    }

    return (
        <div className="relative">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl bg-card/80 backdrop-blur-md border border-border shadow-lg hover:shadow-xl transition-all duration-300"
                title="Change Theme"
            >
                <Palette className="w-5 h-5 text-foreground" />
            </motion.button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Theme Menu */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-72 bg-card rounded-2xl shadow-2xl border border-border p-4 z-[9999] backdrop-blur-xl ring-1 ring-black/5"
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-sm font-bold text-foreground">
                                Themes
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Select One</span>
                        </div>

                        <div className="space-y-1.5">
                            {(Object.keys(themes) as ThemeName[]).map((themeName) => (
                                <motion.button
                                    key={themeName}
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleThemeChange(themeName)}
                                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-200 border ${currentTheme === themeName
                                        ? 'bg-primary/10 border-primary/20 shadow-sm'
                                        : 'hover:bg-muted border-transparent'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-1.5">
                                            <div
                                                className="w-5 h-5 rounded-full ring-2 ring-card shadow-sm z-30"
                                                style={{ backgroundColor: themeColors[themeName].primary }}
                                                title="Primary"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full ring-2 ring-card shadow-sm z-20"
                                                style={{ backgroundColor: themeColors[themeName].secondary }}
                                                title="Secondary"
                                            />
                                            <div
                                                className="w-5 h-5 rounded-full ring-2 ring-card shadow-sm z-10"
                                                style={{ backgroundColor: themeColors[themeName].background }}
                                                title="Background"
                                            />
                                        </div>
                                        <span className={`text-sm font-semibold ${currentTheme === themeName ? 'text-primary' : 'text-foreground'}`}>
                                            {themes[themeName].name}
                                        </span>
                                    </div>
                                    {currentTheme === themeName && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}
