'use client'

import { motion, AnimatePresence } from 'framer-motion'
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
    Search,
    Bell,
    ChevronRight,
    Sparkles,
    Target,
    Receipt,
    Building2,
    UserPlus,
    Table,
    Plus,
    Calculator
} from 'lucide-react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import NewOrderModal from '@/components/NewOrderModal'
import { applyTheme, getStoredTheme } from '@/lib/theme'
import { useAuthStore } from '@/store/authStore'
import AuthGuard from '@/components/AuthGuard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, clearAuth } = useAuthStore()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isNewOrderOpen, setIsNewOrderOpen] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (user && !user.isSuperAdmin && !user.tenantId) {
            router.push('/subscription')
            return
        }

        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)

        const theme = getStoredTheme()
        applyTheme(theme)

        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            clearInterval(timer)
        }
    }, [user, router])

    const handleLogout = () => {
        clearAuth()
        router.push('/login')
    }

    // Main operational menu items (visible to all users)
    const mainMenuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Calculator, label: 'Billing', path: '/dashboard/pos' },
        { icon: ShoppingCart, label: 'Orders', path: '/dashboard/orders' },
        { icon: UtensilsCrossed, label: 'Menu Items', path: '/dashboard/menu' },
        { icon: Table, label: 'Tables', path: '/dashboard/tables' },
        { icon: UsersRound, label: 'Customers', path: '/dashboard/customers' },
    ]

    // Tenant management (visible to owners and admins)
    const tenantMenuItems = [
        { icon: CreditCard, label: 'Subscription', path: '/dashboard/settings?tab=subscription', requireOwner: true },
        { icon: Receipt, label: 'Billing Settings', path: '/dashboard/settings?tab=billing', requireOwner: true },
        { icon: UserPlus, label: 'Team', path: '/dashboard/staff', requireOwnerOrAdmin: true },
        { icon: Building2, label: 'Tenant Settings', path: '/dashboard/settings', requireOwner: true },
    ]

    // Analytics & Reports
    const analyticsMenuItems = [
        { icon: TrendingUp, label: 'Analytics', path: '/dashboard/analytics' },
        { icon: Target, label: 'Marketing', path: '/dashboard/marketing/offers' },
    ]

    // Admin features (require specific permissions)
    const adminMenuItems = [
        { icon: Shield, label: 'Roles', path: '/dashboard/roles', permission: 'roles:view' },
        { icon: Key, label: 'Permissions', path: '/dashboard/permissions', permission: 'roles:assign_permissions' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ]

    // Filter tenant items based on user role
    const filteredTenantItems = tenantMenuItems.filter(item => {
        if (user?.isSuperAdmin) return true
        if (item.requireOwner && user?.role !== 'OWNER') return false
        if (item.requireOwnerOrAdmin && !['OWNER', 'ADMIN'].includes(user?.role || '')) return false
        return true
    })

    // Filter admin items based on permissions
    const filteredAdminItems = adminMenuItems.filter(item => {
        if (!item.permission) return true
        if (user?.isSuperAdmin) return true
        return user?.permissions?.includes(item.permission) || user?.permissions?.includes('*:*')
    })

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background text-foreground selection:bg-primary-500/30 font-sans transition-colors duration-500">
                {/* Background effects */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-900/10 blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-900/10 blur-[120px]" />
                </div>

                {/* Sidebar */}
                <motion.aside
                    initial={false}
                    animate={{
                        width: sidebarOpen ? 280 : 88,
                        x: 0
                    }}
                    className={cn(
                        "fixed left-0 top-0 h-screen z-50 transition-all duration-500 ease-[0.16,1,0.3,1]",
                        "bg-card/40 backdrop-blur-2xl border-r border-border shadow-2xl"
                    )}
                >
                    <div className="flex flex-col h-full py-6 px-4">
                        {/* Brand */}
                        <div className="px-2 mb-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            className="overflow-hidden"
                                        >
                                            <h1 className="text-xl font-bold tracking-tight text-foreground">Ambrane</h1>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Enterprise</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 space-y-6 px-1 overflow-y-auto">
                            {/* Main Menu */}
                            <div className="space-y-1.5">
                                {mainMenuItems.map((item) => {
                                    const isActive = pathname === item.path
                                    const Icon = item.icon
                                    return (
                                        <Link key={item.path} href={item.path}>
                                            <div className={cn(
                                                "relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group transition-all duration-300",
                                                isActive
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}>
                                                <Icon className={cn(
                                                    "w-5 h-5 shrink-0 transition-transform duration-300",
                                                    !isActive && "group-hover:scale-110"
                                                )} />
                                                {sidebarOpen && (
                                                    <span className="font-semibold text-sm tracking-wide">
                                                        {item.label}
                                                    </span>
                                                )}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="active-nav"
                                                        className="absolute left-[-16px] top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-lg shadow-primary/40"
                                                    />
                                                )}
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>

                            {/* Tenant Management Section */}
                            {filteredTenantItems.length > 0 && (
                                <>
                                    <div className="border-t border-border pt-6">
                                        {sidebarOpen && (
                                            <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                Tenant
                                            </p>
                                        )}
                                        <div className="space-y-1.5">
                                            {filteredTenantItems.map((item) => {
                                                const isActive = pathname === item.path
                                                const Icon = item.icon
                                                return (
                                                    <Link key={item.path} href={item.path}>
                                                        <div className={cn(
                                                            "relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group transition-all duration-300",
                                                            isActive
                                                                ? "bg-primary/10 text-primary"
                                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                        )}>
                                                            <Icon className={cn(
                                                                "w-5 h-5 shrink-0 transition-transform duration-300",
                                                                !isActive && "group-hover:scale-110"
                                                            )} />
                                                            {sidebarOpen && (
                                                                <span className="font-semibold text-sm tracking-wide">
                                                                    {item.label}
                                                                </span>
                                                            )}
                                                            {isActive && (
                                                                <motion.div
                                                                    layoutId="active-nav"
                                                                    className="absolute left-[-16px] top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-lg shadow-primary/40"
                                                                />
                                                            )}
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Analytics Section */}
                            <div className="border-t border-border pt-6">
                                {sidebarOpen && (
                                    <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        Reports
                                    </p>
                                )}
                                <div className="space-y-1.5">
                                    {analyticsMenuItems.map((item) => {
                                        const isActive = pathname === item.path
                                        const Icon = item.icon
                                        return (
                                            <Link key={item.path} href={item.path}>
                                                <div className={cn(
                                                    "relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group transition-all duration-300",
                                                    isActive
                                                        ? "bg-primary/10 text-primary"
                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                )}>
                                                    <Icon className={cn(
                                                        "w-5 h-5 shrink-0 transition-transform duration-300",
                                                        !isActive && "group-hover:scale-110"
                                                    )} />
                                                    {sidebarOpen && (
                                                        <span className="font-semibold text-sm tracking-wide">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="active-nav"
                                                            className="absolute left-[-16px] top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-lg shadow-primary/40"
                                                        />
                                                    )}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Admin Section */}
                            {filteredAdminItems.length > 0 && (
                                <div className="border-t border-border pt-6">
                                    {sidebarOpen && (
                                        <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            Administration
                                        </p>
                                    )}
                                    <div className="space-y-1.5">
                                        {filteredAdminItems.map((item) => {
                                            const isActive = pathname === item.path
                                            const Icon = item.icon
                                            return (
                                                <Link key={item.path} href={item.path}>
                                                    <div className={cn(
                                                        "relative flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer group transition-all duration-300",
                                                        isActive
                                                            ? "bg-primary/10 text-primary"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                                    )}>
                                                        <Icon className={cn(
                                                            "w-5 h-5 shrink-0 transition-transform duration-300",
                                                            !isActive && "group-hover:scale-110"
                                                        )} />
                                                        {sidebarOpen && (
                                                            <span className="font-semibold text-sm tracking-wide">
                                                                {item.label}
                                                            </span>
                                                        )}
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="active-nav"
                                                                className="absolute left-[-16px] top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-lg shadow-primary/40"
                                                            />
                                                        )}
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </nav>

                        {/* User & Logout */}
                        <div className="mt-auto pt-6 border-t border-border px-1">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300 group"
                            >
                                <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                {sidebarOpen && <span className="font-semibold text-sm">Sign Out</span>}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Toggle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute -right-3 top-12 w-6 h-6 rounded-full bg-background border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-50 shadow-xl"
                    >
                        {sidebarOpen ? <X className="w-3 h-3" /> : <MenuIcon className="w-3 h-3" />}
                    </button>
                </motion.aside>

                {/* Main Content Area */}
                <div
                    className="transition-all duration-500 ease-[0.16,1,0.3,1] relative z-10"
                    style={{ paddingLeft: sidebarOpen ? 280 : 88 }}
                >
                    {/* Header */}
                    <header className={cn(
                        "sticky top-0 z-40 transition-all duration-300 px-8 py-4",
                        scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border py-3" : "bg-transparent"
                    )}>
                        <div className="flex items-center justify-between max-w-[1600px] mx-auto px-4 md:px-8">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-[1px] bg-border hidden md:block" />
                                <div className="hidden lg:block">
                                    <h2 className="text-xl font-bold text-foreground">
                                        {[...mainMenuItems, ...tenantMenuItems, ...analyticsMenuItems, ...adminMenuItems].find(item => pathname === item.path)?.label || 'Overview'}
                                    </h2>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Search Bar (Compact/Modern) */}
                                <div className="hidden md:flex items-center bg-muted border border-border rounded-xl px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                    <Search className="w-4 h-4 text-muted-foreground mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Command + K to search..."
                                        className="bg-transparent border-none outline-none text-sm w-full text-foreground placeholder:text-muted-foreground/50"
                                    />
                                </div>

                                <div className="flex items-center gap-2 mr-2">
                                    <button className="p-2.5 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all relative">
                                        <Bell className="w-5 h-5" />
                                        <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                                    </button>
                                    <ThemeSwitcher />
                                </div>

                                {user?.isSuperAdmin && (
                                    <Link href="/super-admin">
                                        <Button variant="outline" size="sm" className="hidden sm:flex border-secondary-500/30 text-secondary-400 hover:bg-secondary-500/10">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Admin
                                        </Button>
                                    </Link>
                                )}

                                <Link href="/dashboard/pos">
                                    <Button
                                        variant="primary"
                                        leftIcon={<Plus className="w-5 h-5" />}
                                        className="hidden sm:flex shadow-xl shadow-primary/20 scale-110 ml-2"
                                    >
                                        New Bill
                                    </Button>
                                </Link>

                                {/* User Profile Mini */}
                                <div className="ml-2 pl-4 border-l border-border flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-border flex items-center justify-center font-bold text-xs text-white uppercase tracking-tighter shadow-inner">
                                        {user?.email?.charAt(0) || 'U'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content Container */}
                    <main className="min-h-[calc(100vh-80px)] p-4 md:p-8 max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                {/* New Order Modal */}
                <NewOrderModal isOpen={isNewOrderOpen} onClose={() => setIsNewOrderOpen(false)} />

                {/* Floating Action Button for Mobile & Quick Access */}
                <Link href="/dashboard/pos">
                    <button
                        className="fixed bottom-8 right-8 w-16 h-16 rounded-full gradient-primary text-white shadow-2xl shadow-primary/40 flex items-center justify-center z-50 hover:scale-110 active:scale-95 transition-all duration-300 md:hidden"
                    >
                        <Plus className="w-8 h-8" />
                    </button>
                </Link>
            </div>
        </AuthGuard>
    )
}
