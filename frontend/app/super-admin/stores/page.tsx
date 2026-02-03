'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Stores</h1>
                    <p className="text-muted-foreground mt-1">Manage all tenant stores</p>
                </div>
                <button
                    onClick={() => router.push('/super-admin/stores/create')}
                    className="px-4 py-2 gradient-primary text-white rounded-md hover:opacity-90 font-medium transition-opacity"
                >
                    + Create New Store
                </button>
            </div>

            {/* Search */}
            <div className="bg-card rounded-lg shadow-lg p-4 border border-border">
                <input
                    type="text"
                    placeholder="Search by business name, email, or phone..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* Stores Table */}
            <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
                {tenantsLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading stores...</div>
                ) : tenants.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No stores found</div>
                ) : (
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Business
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Subscription
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-muted transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-foreground">{tenant.businessName}</div>
                                        <div className="text-sm text-muted-foreground">{tenant.businessType}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-foreground">{tenant.email || '-'}</div>
                                        <div className="text-sm text-muted-foreground">{tenant.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tenant.subscription ? (
                                            <div>
                                                <div className="text-sm font-medium text-foreground">
                                                    {tenant.subscription.planName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{tenant.subscription.status}</div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">No subscription</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tenant.isActive
                                                    ? 'bg-accent text-white'
                                                    : 'bg-destructive text-white'
                                                }`}
                                        >
                                            {tenant.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                        {new Date(tenant.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => router.push(`/super-admin/stores/${tenant.id}`)}
                                            className="text-primary hover:text-primary-light mr-4 transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(tenant.id, tenant.isActive)}
                                            className={`transition-colors ${tenant.isActive
                                                    ? 'text-destructive hover:opacity-80'
                                                    : 'text-accent hover:opacity-80'
                                                }`}
                                        >
                                            {tenant.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {tenantsTotal > 20 && (
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, tenantsTotal)} of {tenantsTotal}{' '}
                        stores
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page * 20 >= tenantsTotal}
                            className="px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
