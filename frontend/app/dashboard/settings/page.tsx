'use client'

import { motion } from 'framer-motion'
import {
    User as UserIcon,
    Bell,
    Shield,
    Palette,
    Building2,
    Globe,
    Mail,
    Phone,
    Camera,
    CreditCard,
    Languages,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Sparkles,
    Trash2,
    Smartphone,
    Monitor,
    Cloud,
    Save,
    Receipt
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
    const { user } = useAuthStore()
    const searchParams = useSearchParams()
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'business' | 'subscription' | 'billing'>('profile')

    useEffect(() => {
        const tab = searchParams.get('tab')
        if (tab && ['profile', 'appearance', 'security', 'business', 'subscription', 'billing'].includes(tab)) {
            setActiveTab(tab as any)
        }
    }, [searchParams])

    const tabs = [
        { id: 'profile', label: 'My Profile', icon: UserIcon },
        { id: 'business', label: 'Business Profile', icon: Building2 },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'security', label: 'Security', icon: Shield },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">System Settings</h1>
                    <p className="text-muted-foreground font-medium">Configure your personal profile and global business preferences.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-11">
                        Discard
                    </Button>
                    <Button className="h-11 shadow-lg shadow-primary-500/20">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <Card className="lg:w-72 h-fit p-2">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all transition-700",
                                    activeTab === tab.id
                                        ? "bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5"
                                        : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </Card>

                {/* Content Area */}
                <div className="flex-1 space-y-8">
                    {activeTab === 'profile' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <div className="flex items-center gap-6 mb-10">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-500/20">
                                            {user?.name.charAt(0)}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-card border border-border text-foreground shadow-xl opacity-0 hover:opacity-100 group-hover:opacity-100 transition-all">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-1">{user?.name}</h3>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user?.roleName} Account</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Identity</label>
                                        <Input value={user?.name || ''} readOnly className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Verified Email</label>
                                        <Input value={user?.email || ''} readOnly className="h-12" leftIcon={<Mail className="w-4 h-4" />} />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-primary" />
                                    Personal Notifications
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { title: 'System Alerts', desc: 'Critical infrastructure and security updates.', icon: Shield },
                                        { title: 'New Customer Signups', desc: 'Notify when a new profile is identified.', icon: UserIcon },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:border-border transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                                                    <item.icon className="w-5 h-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                            <input type="checkbox" className="w-5 h-5 rounded-lg bg-card border-border text-primary focus:ring-primary" defaultChecked />
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                                            <Palette className="w-4 h-4 text-purple-600" />
                                            Visual Interface
                                        </h3>
                                        <p className="text-xs text-muted-foreground font-medium">Personalize your dashboard aesthetic and interactions.</p>
                                    </div>
                                    <ThemeSwitcher />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button className="p-4 rounded-[2rem] bg-muted border-2 border-primary text-left group transition-all">
                                        <div className="w-full h-32 rounded-2xl bg-slate-900 mb-4 overflow-hidden border border-border p-2">
                                            <div className="w-full h-full rounded-lg bg-muted border border-border flex gap-2 p-2">
                                                <div className="w-8 h-full bg-border rounded" />
                                                <div className="flex-1 bg-border rounded" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-foreground mb-1">Deep Obsidian</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active Theme</p>
                                    </button>
                                    <button className="p-4 rounded-[2rem] bg-muted/30 border-2 border-transparent hover:border-border text-left group transition-all opacity-50">
                                        <div className="w-full h-32 rounded-2xl bg-white mb-4 overflow-hidden border border-border p-2">
                                            <div className="w-full h-full rounded-lg bg-slate-100 border border-slate-200 flex gap-2 p-2">
                                                <div className="w-8 h-full bg-slate-200 rounded" />
                                                <div className="flex-1 bg-slate-200 rounded" />
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground mb-1">Pure Quartz</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Unavailable</p>
                                    </button>
                                </div>
                            </Card>

                            <Card className="p-8">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-indigo-600" />
                                    Display Dynamics
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { title: 'Reduce Motion', desc: 'Disable heavy physics-based animations.', active: false },
                                        { title: 'Glass Surfaces', desc: 'Toggle high-fidelity translucent effects.', active: true },
                                        { title: 'Dense Interface', desc: 'Show more data with reduced spacing.', active: false },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                            <div className={cn(
                                                "w-11 h-6 rounded-full p-1 transition-colors cursor-pointer",
                                                item.active ? "bg-primary" : "bg-muted"
                                            )}>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white shadow-lg transition-transform",
                                                    item.active ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-error-600" />
                                    Authentication & Shield
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 text-primary-500 font-black text-5xl">
                                            <Button variant="outline" className="w-full h-12">
                                                Update Security Credentials
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            <Button variant="outline" className="w-full h-12">
                                                Configure 2FA
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-error-500/5 border border-error-500/20">
                                        <div className="flex gap-4">
                                            <Shield className="w-5 h-5 text-error-600 shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-error-600 mb-1">Session Protocol</p>
                                                <p className="text-[11px] text-error-600/70 font-medium">Your current session is cryptographically signed and will expire in 2 hours. Unauthorized access attempts are monitored.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'subscription' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-success-600" />
                                        Plan Details
                                    </h3>
                                    <div className="px-3 py-1 rounded-full bg-success-500/10 text-success-600 text-[10px] font-black uppercase tracking-widest border border-success-500/30">
                                        Active Plan
                                    </div>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-border relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <Sparkles className="w-16 h-16 text-indigo-600" />
                                    </div>
                                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Current Membership</p>
                                    <h4 className="text-2xl font-black text-foreground mb-4">Enterprise Scaling</h4>
                                    <p className="text-xs text-muted-foreground max-w-sm mb-6">You have unlimited scale with full access to analytics, multi-tenant directory, and specialized support.</p>
                                    <div className="flex gap-3">
                                        <Button size="sm" className="bg-primary text-white hover:bg-primary/80">Upgrade Plan</Button>
                                        <Button size="sm" variant="outline">View Benefits</Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'billing' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-amber-600" />
                                    Billing & Invoices
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { id: 'INV-001', date: 'Feb 1, 2024', amount: '₹14,999', status: 'PAID' },
                                        { id: 'INV-002', date: 'Jan 1, 2024', amount: '₹14,999', status: 'PAID' },
                                        { id: 'INV-003', date: 'Dec 1, 2023', amount: '₹14,999', status: 'PAID' },
                                    ].map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border">
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{inv.id}</p>
                                                <p className="text-xs text-muted-foreground">{inv.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-foreground">{inv.amount}</p>
                                                <span className="text-[10px] font-black text-success-600 uppercase">{inv.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full mt-6">
                                    Manage Payment Methods
                                </Button>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'business' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <Card className="p-8">
                                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-secondary-600" />
                                    Enterprise Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Legal Entity Name</label>
                                        <Input defaultValue="Ambrane Labs Pvt Ltd" className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Business Category</label>
                                        <Input defaultValue="Premium Dining" className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Support Contact</label>
                                        <Input defaultValue="+91 1800 200 100" className="h-12" leftIcon={<Phone className="w-4 h-4" />} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Global Region</label>
                                        <Input defaultValue="Mumbai, India" className="h-12" leftIcon={<Globe className="w-4 h-4" />} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}
