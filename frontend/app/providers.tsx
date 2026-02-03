'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ProtectedRoute>
                {children}
            </ProtectedRoute>
            <Toaster position="top-right" richColors />
        </QueryClientProvider>
    )
}
