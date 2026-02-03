'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomerStore } from '@/store/useCustomerStore'

export default function CreateCustomerPage() {
    const router = useRouter()
    const { createCustomer } = useCustomerStore()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        creditLimit: 0,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createCustomer(formData)
            alert('Customer created successfully!')
            router.push('/dashboard/customers')
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create customer')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: value,
        }))
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-primary hover:text-primary-light flex items-center transition-colors"
                >
                    ← Back to Customers
                </button>
            </div>

            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
                <h1 className="text-2xl font-bold text-foreground mb-6">Add New Customer</h1>

                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Note:</strong> Customers are people who buy from your restaurant.
                        You can track their purchases, manage credit/khata, and view their order history.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Customer Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            placeholder="Ramesh Kumar"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Phone Number *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            placeholder="9876543210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            placeholder="customer@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            placeholder="123 Main Street, City"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">
                            Credit Limit (₹)
                        </label>
                        <input
                            type="number"
                            name="creditLimit"
                            value={formData.creditLimit}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                            placeholder="0.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Maximum amount this customer can owe (for khata/credit)
                        </p>
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
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
                            {loading ? 'Creating...' : 'Create Customer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
