'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'

export default function StoreDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const { selectedTenant, tenantsLoading, fetchTenantById, activateTenant, deactivateTenant, deleteTenant } =
        useSuperAdminStore()

    const [activeTab, setActiveTab] = useState<'details' | 'staff' | 'products'>('details')
    const {
        tenantStaff, tenantProducts, tenantDetailsLoading,
        fetchTenantStaff, fetchTenantProducts, addTenantStaff, addTenantProduct
    } = useSuperAdminStore()

    useEffect(() => {
        if (id) {
            fetchTenantById(id)
        }
    }, [id, fetchTenantById])

    useEffect(() => {
        if (id && activeTab === 'staff') fetchTenantStaff(id)
        if (id && activeTab === 'products') fetchTenantProducts(id)
    }, [id, activeTab, fetchTenantStaff, fetchTenantProducts])

    // ... handleToggleStatus, handleDelete (already there)

    const handleToggleStatus = async () => {
        if (!selectedTenant) return
        try {
            if (selectedTenant.isActive) {
                await deactivateTenant(id)
            } else {
                await activateTenant(id)
            }
        } catch (error) {
            alert('Failed to update status')
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
            return
        }
        try {
            await deleteTenant(id)
            router.push('/super-admin/stores')
        } catch (error) {
            alert('Failed to delete store')
        }
    }

    if (tenantsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading store details...</div>
            </div>
        )
    }

    if (!selectedTenant) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Store not found</div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
                    >
                        ← Back to Stores
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedTenant.businessName}</h1>
                    <p className="text-gray-600 mt-1">{selectedTenant.businessType}</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={handleToggleStatus}
                        className={`px-4 py-2 rounded-md font-medium ${selectedTenant.isActive
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {selectedTenant.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Status Badge */}
            <div>
                <span
                    className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${selectedTenant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                >
                    {selectedTenant.isActive ? 'Active' : 'Inactive'}
                </span>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="text-sm font-medium text-gray-500">Business Name</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.businessName}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Business Type</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.businessType}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Email</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.email || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Phone</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.phone || '-'}</div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-gray-500">Address</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.address || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">GST Number</div>
                        <div className="mt-1 text-sm text-gray-900">{selectedTenant.gstNumber || '-'}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-500">Created At</div>
                        <div className="mt-1 text-sm text-gray-900">
                            {new Date(selectedTenant.createdAt).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Information */}
            {selectedTenant.subscription && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm font-medium text-gray-500">Plan</div>
                            <div className="mt-1 text-sm text-gray-900">{selectedTenant.subscription.planName}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">Status</div>
                            <div className="mt-1">
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedTenant.subscription.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800'
                                        : selectedTenant.subscription.status === 'TRIAL'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {selectedTenant.subscription.status}
                                </span>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">End Date</div>
                            <div className="mt-1 text-sm text-gray-900">
                                {new Date(selectedTenant.subscription.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Usage Statistics */}
            {selectedTenant._count && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedTenant._count.users}</div>
                            <div className="text-sm text-gray-600 mt-1">Users</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedTenant._count.products}</div>
                            <div className="text-sm text-gray-600 mt-1">Products</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{selectedTenant._count.orders}</div>
                            <div className="text-sm text-gray-600 mt-1">Orders</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
