'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useUserStore'
import AddUserModal from '@/components/AddUserModal'

export default function UsersPage() {
    const router = useRouter()
    const { users, loading, fetchUsers, deleteUser } = useUserStore()
    const [showAddModal, setShowAddModal] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-foreground">Users</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 gradient-primary text-white rounded-md hover:opacity-90"
                >
                    + Add User
                </button>
            </div>

            <div className="bg-card rounded-lg shadow border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 text-sm text-foreground">{user.name}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">{user.email}</td>
                                    <td className="px-6 py-4 text-sm text-foreground">
                                        {user.roleName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => router.push(`/dashboard/users/${user.id}`)}
                                            className="text-primary hover:text-primary-light mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id.toString())}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    )
}
