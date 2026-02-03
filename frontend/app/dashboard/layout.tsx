'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    ShoppingCart,
    UtensilsCrossed,
    Users,
    Settings,
    LogOut,
    Menu as MenuIcon,
    X,
    TrendingUp,
    Shield,
    Key,
    CreditCard,
    UserCog,
    UsersRound,
} from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import NewOrderModal from '@/components/NewOrderModal'
import { applyTheme, getStoredTheme } from '@/lib/theme'
import { useAuthStore } from '@/store/authStore'
import AuthGuard from '@/components/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, clearAuth } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Redirect if no tenant/subscription (except for Super Admin)
        if (user && !user.isSuperAdmin && !user.tenantId) {
            router.push('/subscription')
            return
        }

        const theme = getStoredTheme()
        applyTheme(theme)

        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [user, router])

    const handleLogout = () => {
        clearAuth()
        router.push('/login')
    }

    const menuItems = [
        { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
        { icon: <ShoppingCart className="w-5 h-5" />, label: 'Orders', path: '/dashboard/orders', permission: 'billing:view' },
        { icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Menu', path: '/dashboard/menu', permission: 'inventory:view' },
        { icon: <Users className="w-5 h-5" />, label: 'Tables', path: '/dashboard/tables', permission: 'tables:view' },
        { icon: <TrendingUp className="w-5 h-5" />, label: 'Analytics', path: '/dashboard/analytics', permission: 'reports:view_sales' },
        { icon: <UserCog className="w-5 h-5" />, label: 'Staff', path: '/dashboard/staff', permission: 'users:view' },
        { icon: <UsersRound className="w-5 h-5" />, label: 'Users', path: '/dashboard/users', permission: 'users:view' },
        { icon: <UsersRound className="w-5 h-5" />, label: 'Customers', path: '/dashboard/customers', permission: 'customers:view' },
        { icon: <Shield className="w-5 h-5" />, label: 'Roles', path: '/dashboard/roles', permission: 'roles:view' },
        { icon: <Key className="w-5 h-5" />, label: 'Permissions', path: '/dashboard/permissions', permission: 'roles:assign_permissions' },
        { icon: <CreditCard className="w-5 h-5" />, label: 'Payments', path: '/dashboard/payments', permission: 'billing:view' },
        { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings', permission: 'settings:view' },
    ]

    const filteredMenuItems = menuItems.filter(item => {
        if (!item.permission) return true
        if (user?.isSuperAdmin) return true
        return user?.permissions?.includes(item.permission) || user?.permissions?.includes('*:*')
    })

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
                <div className="fixed inset-0 gradient-animated opacity-50 pointer-events-none" />

                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{ width: sidebarOpen ? 256 : 80 }}
                    className="fixed left-0 top-0 h-screen bg-card/95 backdrop-blur-xl border-r border-border shadow-xl z-40 transition-all duration-300"
                >
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                    <LayoutDashboard className="w-6 h-6 text-white" />
                                </div>
                                {sidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <h1 className="text-xl font-black text-foreground">Ambrane</h1>
                                        <p className="text-xs text-muted-foreground">Billing System</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            {filteredMenuItems.map((item) => {
                                const isActive = pathname === item.path
                                return (
                                    <Link key={item.path} href={item.path}>
                                        <motion.div
                                            whileHover={{ scale: 1.02, x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${isActive
                                                ? 'gradient-primary text-white shadow-lg'
                                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                }`}
                                        >
                                            {item.icon}
                                            {sidebarOpen && (
                                                <span className="font-semibold">{item.label}</span>
                                            )}
                                        </motion.div>
                                    </Link>
                                )
                            })}
                        </nav>

                        {/* User Section */}
                        <div className="p-4 border-t border-border">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                {sidebarOpen && <span className="font-semibold">Logout</span>}
                            </motion.button>
                        </div>

                        {/* Toggle Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                        >
                            {sidebarOpen ? <X className="w-3 h-3" /> : <MenuIcon className="w-3 h-3" />}
                        </button>
                    </div>
                </motion.aside>

                {/* Main Content */}
                <div
                    className="transition-all duration-300 relative"
                    style={{ marginLeft: sidebarOpen ? 256 : 80 }}
                >
                    {/* Header */}
                    <header className="bg-card/90 backdrop-blur-xl border-b border-border p-6 shadow-md sticky top-0 z-[60] overflow-visible">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-1">
                                    {menuItems.find(item => item.path === pathname)?.label || 'Dashboard'}
                                </h2>
                                <p className="text-muted-foreground">
                                    {currentTime.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })} • {currentTime.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            <div className="flex items-center gap-4 relative z-50">
                                <ThemeSwitcher />
                                {user?.isSuperAdmin && (
                                    <Link href="/super-admin">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Super Admin
                                        </motion.button>
                                    </Link>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setIsNewOrderOpen(true)}
                                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    + New Order
                                </motion.button>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="relative">
                        {children}
                    </main>
                </div>

                {/* New Order Modal */}
                <NewOrderModal isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} />
            </div>
        </AuthGuard>
    )
}
