'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'
import {
    Search,
    Plus,
    Building2,
    Mail,
    Phone,
    Calendar,
    ExternalLink,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Store
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function StoresPage() {
    const router = useRouter()
    const { tenants, tenantsTotal, tenantsLoading, fetchTenants, activateTenant, deactivateTenant } =
        useSuperAdminStore()
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    useEffect(() => {
        fetchTenants(page, 20, search)
    }, [page, search, fetchTenants])

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            if (isActive) {
                await deactivateTenant(id)
            } else {
                await activateTenant(id)
            }
        } catch (error) {
            alert('Failed to update tenant status')
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1 flex items-center gap-2">
                        <Store className="w-8 h-8 text-primary" />
                        Stores
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage and monitor all tenant stores on your platform</p>
                </div>
                <Button onClick={() => router.push('/super-admin/stores/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Store
                </Button>
            </div>

            {/* Search & Filters */}
            <Card className="p-4">
                <Input
                    placeholder="Search by business name, email, or phone..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                />
            </Card>

            {/* Stores Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    {tenantsLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-sm font-bold text-muted-foreground">Loading stores...</p>
                        </div>
                    ) : tenants.length === 0 ? (
                        <div className="p-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                                <Building2 className="w-8 h-8 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">No stores found</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">We couldn't find any stores matching your search criteria.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Business</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Info</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subscription</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registered</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <AnimatePresence mode="popLayout">
                                    {tenants.map((tenant, idx) => (
                                        <motion.tr
                                            key={tenant.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-muted/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase group-hover:bg-primary/10 transition-colors">
                                                        {tenant.businessName.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{tenant.businessName}</div>
                                                        <div className="text-[10px] font-medium text-muted-foreground capitalize">{tenant.businessType || 'General Store'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                        <Mail className="w-3 h-3" /> {tenant.email || '-'}
                                                    </div>
                                                    {tenant.phone && (
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                            <Phone className="w-3 h-3" /> {tenant.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground">{tenant.subscription?.planName || 'Free Trial'}</span>
                                                    <span className={cn(
                                                        "text-[10px] font-black uppercase",
                                                        tenant.subscription?.status === 'ACTIVE' ? "text-success-500" : "text-muted-foreground"
                                                    )}>
                                                        {tenant.subscription?.status || 'No Plan'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                                                    tenant.isActive
                                                        ? "bg-success-500/10 border-success-500/20 text-success-500"
                                                        : "bg-error-500/10 border-error-500/20 text-error-500"
                                                )}>
                                                    {tenant.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {tenant.isActive ? 'Active' : 'Inactive'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(tenant.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/super-admin/stores/${tenant.id}`)}
                                                        className="h-8 px-3 text-xs"
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}
                                                        className={cn(
                                                            "h-8 px-3 text-xs",
                                                            tenant.isActive ? "text-error-500 hover:text-error-600" : "text-primary hover:text-primary-light"
                                                        )}
                                                    >
                                                        {tenant.isActive ? 'Suspend' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Pagination */}
            {tenantsTotal > 20 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Showing <span className="text-foreground">{(page - 1) * 20 + 1}</span> to <span className="text-foreground">{Math.min(page * 20, tenantsTotal)}</span> of <span className="text-foreground">{tenantsTotal}</span> stores
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="h-9 px-3"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </Button>
                        <div className="bg-card border border-border px-3 py-1.5 rounded-lg text-sm font-black">
                            {page}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page * 20 >= tenantsTotal}
                            className="h-9 px-3"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
