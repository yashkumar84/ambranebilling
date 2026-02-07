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
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' })

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)

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

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
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

    const handleCheckoutPress = () => {
        if (totalItems === 0) return
        setShowDetailsModal(true)
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (totalItems === 0) return

        setSubmitting(true)
        try {
            // 1. Create Public Order & Get Razorpay Order
            const orderData = {
                tenantId,
                tableId,
                customerName: customerInfo.name,
                customerPhone: customerInfo.phone,
                items: Object.entries(cart).map(([id, q]) => ({
                    productId: id,
                    quantity: q,
                    price: menu.find(m => m.id === id)?.price || 0
                }))
            }

            const response = await api.post('/api/public/orders', orderData)
            const { razorpayOrder, order } = response.data

            // 2. Open Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: restaurantName,
                description: `Order #${order.orderNumber}`,
                order_id: razorpayOrder.id,
                handler: async function (paymentResponse: any) {
                    await verifyPayment(paymentResponse)
                },
                prefill: {
                    name: customerInfo.name,
                    contact: customerInfo.phone
                },
                theme: {
                    color: '#8B5CF6'
                }
            }

            const rzp = (window as any).Razorpay ? new (window as any).Razorpay(options) : null
            if (rzp) {
                rzp.open()
            } else {
                toast.error('Payment gateway could not be loaded. Please refresh.')
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to initiate order. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const verifyPayment = async (paymentData: any) => {
        try {
            setSubmitting(true)
            await api.post('/api/public/verify', {
                orderId: paymentData.razorpay_order_id,
                paymentId: paymentData.razorpay_payment_id,
                signature: paymentData.razorpay_signature
            })

            setOrderPlaced(true)
            setCart({})
            setShowDetailsModal(false)
            toast.success('Payment successful! Order sent to kitchen.')
        } catch (error: any) {
            toast.error(error.message || 'Payment verification failed. Please contact staff.')
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
                <h1 className="text-3xl font-black mb-2 uppercase tracking-tighter">Order Confirmed!</h1>
                <p className="text-gray-400 mb-8">Payment successful! Your order has been sent to the kitchen. Please relax while we prepare your meal.</p>
                <button
                    onClick={() => setOrderPlaced(false)}
                    className="px-8 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                    Order More Items
                </button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-32">
            {/* Header */}
            <div className="p-6 sticky top-0 bg-black/80 backdrop-blur-xl z-50 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-black tracking-tighter uppercase">{restaurantName}</h1>
                    <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Table #{tableId?.slice(-4) || 'N/A'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />
                </div>
            </div>

            {/* Menu Sections */}
            <div className="p-4 space-y-8">
                {Array.from(new Set(menu.map(m => m.category))).map(category => (
                    <div key={category}>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {category}
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            {menu.filter(m => m.category === category).map(item => (
                                <div key={item.id} className="p-4 bg-white/[0.03] rounded-3xl border border-white/5 flex gap-4 transition-all active:scale-[0.98]">
                                    {item.image && (
                                        <img src={item.image} alt={item.name} className="w-24 h-24 rounded-2xl object-cover" />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                                        <p className="text-xl font-black text-white tracking-tight">₹{item.price}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center">
                                        {cart[item.id] ? (
                                            <div className="flex flex-col items-center gap-2 bg-white/5 rounded-2xl p-1 border border-white/10">
                                                <button onClick={() => addToCart(item.id)} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <span className="font-black text-lg w-8 text-center">{cart[item.id]}</span>
                                                <button onClick={() => removeFromCart(item.id)} className="w-10 h-10 bg-black/40 text-white rounded-xl flex items-center justify-center">
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item.id)}
                                                className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-gray-200 transition-colors"
                                            >
                                                <Plus className="w-7 h-7" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="bg-card w-full max-w-md rounded-[2.5rem] border border-white/10 p-8"
                        >
                            <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">Your Details</h2>
                            <p className="text-gray-400 text-sm mb-8">Almost there! Please tell us who you are for your bill.</p>

                            <form onSubmit={handlePlaceOrder} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Full Name"
                                        value={customerInfo.name}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-500">Phone Number</label>
                                    <input
                                        required
                                        type="tel"
                                        placeholder="+91 ..."
                                        value={customerInfo.phone}
                                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowDetailsModal(false)}
                                        className="flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest bg-white/5 text-gray-400"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-[2] py-5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay & Place Order ₹{totalPrice}</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Cart Button */}
            <AnimatePresence>
                {totalItems > 0 && !showDetailsModal && !orderPlaced && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-6 left-6 right-6 z-50"
                    >
                        <button
                            onClick={handleCheckoutPress}
                            className="w-full bg-primary text-white p-5 rounded-[2rem] shadow-2xl shadow-primary/40 flex items-center justify-between font-black group overflow-hidden"
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase opacity-60 font-black tracking-widest">Review Order</p>
                                    <p className="text-xl tracking-tighter">{totalItems} Items • ₹{totalPrice}</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform relative z-10">
                                <ArrowRight className="w-6 h-6" />
                            </div>
                            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const Loader2 = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
)
