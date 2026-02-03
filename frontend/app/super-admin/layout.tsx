'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { applyTheme, getStoredTheme } from '@/lib/theme'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { user, logout } = useAuthStore()

    useEffect(() => {
        const theme = getStoredTheme()
        applyTheme(theme)
    }, [])

    useEffect(() => {
        if (!user?.isSuperAdmin) {
            router.push('/dashboard')
        }
    }, [user, router])

    if (!user?.isSuperAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-bold text-gradient-primary">Super Admin</h1>
                            <nav className="hidden md:flex space-x-4">
                                <Link
                                    href="/super-admin"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    href="/super-admin/stores"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                    Stores
                                </Link>
                                <Link
                                    href="/super-admin/plans"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                    Plans
                                </Link>
                                <Link
                                    href="/super-admin/subscriptions"
                                    className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                                >
                                    Subscriptions
                                </Link>
                            </nav>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeSwitcher />
                            <Link
                                href="/dashboard"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Regular Dashboard
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-md hover:opacity-90 transition-opacity"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </div>
    )
}
