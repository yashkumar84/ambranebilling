import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies
})

// Request interceptor (Optional logging)
api.interceptors.request.use(
    (config) => {
        // No need to manually attach token for cookies
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        // DEBUG: Log response for login endpoint
        if (response.config.url?.includes('/auth/login')) {
            console.log('🌐 RAW Response from server:', response)
            console.log('🌐 RAW response.data:', response.data)
            console.log('🌐 RAW response.data type:', typeof response.data)
            console.log('🌐 RAW response.data stringified:', JSON.stringify(response.data))
        }
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if this is a login or register request - don't redirect if it is
            const isAuthRequest = originalRequest.url?.includes('/api/auth/login') ||
                originalRequest.url?.includes('/api/auth/register')

            if (!isAuthRequest) {
                originalRequest._retry = true

                if (typeof window !== 'undefined') {
                    // Clear state in auth store
                    // useAuthStore.getState().clearAuth()
                    // window.location.href = '/login'
                    console.error('401 error detected, but auto-logout is disabled for debugging.')
                }
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred'

        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
        })
    }
)

export default api
