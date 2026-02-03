'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

const publicRoutes = ['/', '/login', '/register']

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { isAuthenticated } = useAuthStore()
    const [isHydrated, setIsHydrated] = useState(false)

    // Wait for hydration to complete
    useEffect(() => {
        setIsHydrated(true)
    }, [])

    useEffect(() => {
        if (!isHydrated) return

        // Check if current route is public
        const isPublicRoute = publicRoutes.includes(pathname)

        // If not authenticated and trying to access protected route
        if (!isAuthenticated && !isPublicRoute) {
            router.push('/login')
        }

        // If authenticated and trying to access login/register
        if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
            const { user } = useAuthStore.getState()

            // DEBUG: Log redirect decision
            console.log('🔄 ProtectedRoute Redirect Check')
            console.log('   User:', user)
            console.log('   isSuperAdmin:', user?.isSuperAdmin)
            console.log('   Redirecting to:', user?.isSuperAdmin ? '/super-admin' : '/dashboard')

            // Redirect based on user type
            if (user?.isSuperAdmin) {
                router.push('/super-admin')
            } else {
                router.push('/dashboard')
            }
        }
    }, [isAuthenticated, pathname, router, isHydrated])

    // While hydrating, we can return null or a loading state to prevent flickering
    if (!isHydrated) return null

    return <>{children}</>
}
