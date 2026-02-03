'use client'

import { motion } from 'framer-motion'
import { User as UserIcon, Bell, Shield, Palette } from 'lucide-react'
import { User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import ThemeSwitcher from '@/components/ThemeSwitcher'

export default function SettingsPage() {
    const { user } = useAuthStore()

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <UserIcon className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Name</label>
                        <input
                            type="text"
                            value={user?.name || ''}
                            readOnly
                            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            readOnly
                            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
                        <input
                            type="text"
                            value={user?.roleName || ''}
                            readOnly
                            className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Theme Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Palette className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Appearance</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl border border-border">
                    <div>
                        <p className="font-semibold text-foreground">Theme</p>
                        <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
                    </div>
                    <ThemeSwitcher />
                </div>
            </motion.div>

            {/* Notifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-transparent hover:border-border transition-all">
                        <div>
                            <p className="font-semibold text-foreground">New Orders</p>
                            <p className="text-sm text-muted-foreground">Get notified when new orders arrive</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 rounded-lg text-primary bg-muted border-border focus:ring-primary" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-transparent hover:border-border transition-all">
                        <div>
                            <p className="font-semibold text-foreground">Order Updates</p>
                            <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
                        </div>
                        <input type="checkbox" className="w-6 h-6 rounded-lg text-primary bg-muted border-border focus:ring-primary" defaultChecked />
                    </div>
                </div>
            </motion.div>

            {/* Security Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl p-6 shadow-lg border border-border"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Security</h2>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                    Change Password
                </motion.button>
            </motion.div>
        </div>

    )
}
