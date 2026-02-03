'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSuperAdminStore } from '@/store/useSuperAdminStore'
import superAdminService, { SubscriptionPlan } from '@/services/superAdminService'

export default function CreateStorePage() {
    const router = useRouter()
    const { createTenant } = useSuperAdminStore()
    const [loading, setLoading] = useState(false)
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'RESTAURANT',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        gstNumber: '',
        planId: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
    })

    useEffect(() => {
        // Fetch subscription plans
        const fetchPlans = async () => {
            try {
                const data = await superAdminService.getPlans()
                setPlans(data)
                if (data.length > 0) {
                    setFormData((prev) => ({ ...prev, planId: data[0].id }))
                }
            } catch (error) {
                console.error('Failed to fetch plans:', error)
            }
        }
        fetchPlans()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createTenant(formData)
            alert('Store created successfully!')
            router.push('/super-admin/stores')
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create store')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-primary hover:text-primary-light flex items-center transition-colors"
                >
                    ← Back to Stores
                </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                <h1 className="text-2xl font-bold text-foreground mb-6">Create New Store</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Business Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Business Name *
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Business Type *
                                </label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                >
                                    <option value="RESTAURANT">Restaurant</option>
                                    <option value="CAFE">Cafe</option>
                                    <option value="RETAIL">Retail</option>
                                    <option value="GROCERY">Grocery</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Subdomain *
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        name="subdomain"
                                        value={formData.subdomain}
                                        onChange={handleChange}
                                        required
                                        pattern="[a-z0-9-]+"
                                        placeholder="mystore"
                                        className="w-full px-3 py-2 bg-background border border-border rounded-l-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                    />
                                    <span className="px-3 py-2 bg-muted border border-l-0 border-border rounded-r-md text-muted-foreground text-sm">
                                        .ambrane.app
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Only lowercase letters, numbers, and hyphens
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">GST Number</label>
                                <input
                                    type="text"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Owner Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Owner Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Owner Name *
                                </label>
                                <input
                                    type="text"
                                    name="ownerName"
                                    value={formData.ownerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Owner Email *
                                </label>
                                <input
                                    type="email"
                                    name="ownerEmail"
                                    value={formData.ownerEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">
                                    Owner Password *
                                </label>
                                <input
                                    type="password"
                                    name="ownerPassword"
                                    value={formData.ownerPassword}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Subscription Plan */}
                    <div>
                        <h2 className="text-lg font-semibold text-foreground mb-4">Subscription Plan *</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.planId === plan.id
                                        ? 'border-primary bg-accent bg-opacity-10'
                                        : 'border-border hover:border-muted-foreground'
                                        }`}
                                    onClick={() => setFormData((prev) => ({ ...prev, planId: plan.id }))}
                                >
                                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                                    <p className="text-2xl font-bold text-foreground mt-2">
                                        ₹{plan.priceMonthly}
                                        <span className="text-sm font-normal text-muted-foreground">/month</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2 border border-border rounded-md text-foreground hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 gradient-primary text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            {loading ? 'Creating...' : 'Create Store'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
