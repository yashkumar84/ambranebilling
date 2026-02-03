'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, CheckCircle2, UtensilsCrossed, ArrowRight } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface MenuItem {
    id: string
    name: string
    price: number
    category: string
    description?: string
    image?: string
}

export default function CustomerOrderPage() {
    const params = useParams()
    const tenantId = params.tenantId as string
    const tableId = params.tableId as string

    const [menu, setMenu] = useState<MenuItem[]>([])
    const [restaurantName, setRestaurantName] = useState('Restaurant')
    const [loading, setLoading] = useState(true)
    const [cart, setCart] = useState<{ [key: string]: number }>({})
    const [orderPlaced, setOrderPlaced] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get(`/api/public/menu/${tenantId}`)
                if (response.data.success) {
                    setMenu(response.data.data)
                    setRestaurantName(response.data.restaurantName)
                }
            } catch (error) {
                console.error('Failed to fetch menu:', error)
                toast.error('Could not load menu. Please try again.')
            } finally {
                setLoading(false)
            }
        }
        fetchMenu()
    }, [tenantId])

    const addToCart = (id: string) => {
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
    }

    const removeFromCart = (id: string) => {
        setCart(prev => {
            const newCart = { ...prev }
            if (newCart[id] > 1) {
                newCart[id] -= 1
            } else {
                delete newCart[id]
            }
            return newCart
        })
    }

    const totalItems = Object.values(cart).reduce((sum, q) => sum + q, 0)
    const totalPrice = Object.entries(cart).reduce((sum, [id, q]) => {
        const item = menu.find(m => m.id === id)
        return sum + (item?.price || 0) * q
    }, 0)

    const handlePlaceOrder = async () => {
        if (totalItems === 0) return

        setSubmitting(true)
        try {
            const orderData = {
                tenantId,
                tableId,
                items: Object.entries(cart).map(([id, q]) => ({
                    productId: id,
                    quantity: q,
                    price: menu.find(m => m.id === id)?.price || 0
                }))
            }

            const response = await api.post('/api/public/orders', orderData)
            if (response.data.success) {
                setOrderPlaced(true)
                setCart({})
                toast.success('Order placed successfully!')
            }
        } catch (error) {
            toast.error('Failed to place order. Please ask staff for help.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <UtensilsCrossed className="w-12 h-12 text-primary" />
                </motion.div>
            </div>
        )
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6"
                >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
                <h1 className="text-3xl font-black mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-8">Your order has been sent to the kitchen. Please relax while we prepare your meal.</p>
                <button
                    onClick={() => setOrderPlaced(false)}
                    className="px-8 py-4 bg-white text-black rounded-2xl font-black"
                >
                    Order More Items
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32">
            {/* Header */}
            <div className="p-6 sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5">
                <h1 className="text-xl font-black tracking-tighter uppercase">{restaurantName}</h1>
                <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Table Ordering System</p>
            </div>

            {/* Menu Sections */}
            <div className="p-4 space-y-8">
                {Array.from(new Set(menu.map(m => m.category))).map(category => (
                    <div key={category}>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {menu.filter(m => m.category === category).map(item => (
                                <div key={item.id} className="p-4 bg-[#111] rounded-3xl border border-white/5 flex gap-4">
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                                        <p className="text-xl font-black text-primary">₹{item.price}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        {cart[item.id] ? (
                                            <div className="flex flex-col items-center gap-2 bg-primary/10 rounded-2xl p-1">
                                                <button onClick={() => addToCart(item.id)} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                                <span className="font-black text-lg">{cart[item.id]}</span>
                                                <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 bg-white/5 text-white rounded-xl flex items-center justify-center">
                                                    <Minus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item.id)}
                                                className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center shadow-lg"
                                            >
                                                <Plus className="w-6 h-6" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sticky Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50"
                    >
                        <button
                            onClick={handlePlaceOrder}
                            disabled={submitting}
                            className="w-full bg-primary text-white p-5 rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-between font-black group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase opacity-60">Review & Place Order</p>
                                    <p className="text-xl tracking-tighter">{totalItems} Items • ₹{totalPrice}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
