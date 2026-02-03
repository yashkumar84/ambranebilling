import { create } from 'zustand'
import api from '../lib/api'
import { endpoints } from '../lib/endpoints'
import { ApiResponse } from '../types'

export interface Plan {
    id: string
    name: string
    priceMonthly: number
    priceYearly: number
    maxUsers: number
    maxProducts: number
    maxBillsPerMonth: number | null
    features: Record<string, boolean>
    isActive: boolean
}

interface PlanState {
    plans: Plan[]
    loading: boolean
    error: string | null
    fetchPlans: () => Promise<void>
    createPlan: (plan: Partial<Plan>) => Promise<void>
    updatePlan: (id: string, plan: Partial<Plan>) => Promise<void>
    deletePlan: (id: string) => Promise<void>
}

export const usePlanStore = create<PlanState>((set, get) => ({
    plans: [],
    loading: false,
    error: null,

    fetchPlans: async () => {
        set({ loading: true })
        try {
            const response = await api.get<ApiResponse<Plan[]>>(endpoints.superAdmin.plans)
            set({ plans: response.data.data, error: null })
        } catch (error: any) {
            set({ error: error.message })
        } finally {
            set({ loading: false })
        }
    },

    createPlan: async (planData) => {
        set({ loading: true })
        try {
            const response = await api.post<ApiResponse<Plan>>(endpoints.superAdmin.plans, planData)
            set({ plans: [...get().plans, response.data.data], error: null })
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    updatePlan: async (id, planData) => {
        set({ loading: true })
        try {
            const response = await api.put<ApiResponse<Plan>>(`${endpoints.superAdmin.plans}/${id}`, planData)
            set({
                plans: get().plans.map(p => p.id === id ? response.data.data : p),
                error: null
            })
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    },

    deletePlan: async (id) => {
        set({ loading: true })
        try {
            await api.delete(`${endpoints.superAdmin.plans}/${id}`)
            set({
                plans: get().plans.filter(p => p.id !== id),
                error: null
            })
        } catch (error: any) {
            set({ error: error.message })
            throw error
        } finally {
            set({ loading: false })
        }
    }
}))
