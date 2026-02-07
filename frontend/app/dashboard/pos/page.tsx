'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'
import {
    Search,
    ShoppingCart,
    Trash2,
    Calculator,
    Printer,
    Coins,
    QrCode,
    CreditCard as CardIcon,
    Utensils,
    X,
    CheckCircle2,
    Minus,
    Plus,
    LayoutGrid,
    Flame,
    Filter,
    ArrowRight
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Modal } from '@/components/ui/Modal'
import { useMenuStore } from '@/store/useMenuStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api'
import { orderService } from '@/services/orderService'
import { tableService } from '@/services/tableService'
import { Table } from '@/types'

interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

export default function POSPage() {
    const { items: menuItems, fetchMenu, loading } = useMenuStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('All')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN')
    const [tables, setTables] = useState<Table[]>([])
    const [selectedTableId, setSelectedTableId] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH')
    const [showQR, setShowQR] = useState(false)

    useEffect(() => {
        fetchMenu()
        loadTables()
    }, [])

    const loadTables = async () => {
        try {
            const res = await tableService.getAll()
            setTables(res.data?.items || [])
        } catch (error) {
            console.error('Failed to load tables')
        }
    }

    const categories = useMemo(() =>
        ['All', ...Array.from(new Set(menuItems.map(item => item.category)))],
        [menuItems]
    )

    const filteredItems = useMemo(() =>
        menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesCategory = activeCategory === 'All' || item.category === activeCategory
            return matchesSearch && matchesCategory
        }),
        [menuItems, searchQuery, activeCategory]
    )

    const toggleCartItem = (product: any, delta: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id)
            if (existing) {
                const newQty = existing.quantity + delta
                if (newQty <= 0) return prev.filter(item => item.id !== product.id)
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: newQty } : item
                )
            }
            if (delta <= 0) return prev
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }]
        })
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleCheckout = async () => {
        if (cart.length === 0) return
        if (orderType === 'DINE_IN' && !selectedTableId) {
            toast.error('Select a Table')
            return
        }

        setIsProcessing(true)
        try {
            const response = await api.post('/api/orders', {
                orderType,
                tableId: orderType === 'DINE_IN' ? selectedTableId : undefined,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                status: 'COMPLETED',
                paymentStatus: 'COMPLETED',
                paymentMethod: paymentMethod,
                taxRate: 5
            })

            const order = response.data.data
            // Trigger Thermal Receipt instead of A4 Invoice
            await orderService.downloadReceipt(order.id)

            // Clean up
            setCart([])
            setSelectedTableId('')
            setShowQR(false)
            toast.success('Bill Generated & Paid via ' + paymentMethod)
        } catch (error: any) {
            console.error('Checkout error:', error)
            toast.error(error.response?.data?.message || 'Checkout failed')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] overflow-hidden">
            {/* Catalog: High Density Grid */}
            <div className="flex-[3] flex flex-col gap-5 min-w-0">
                {/* Search & Categories Bar */}
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Fast search..."
                                className="w-full pl-12 pr-4 py-3 bg-card/60 border border-border/50 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border whitespace-nowrap",
                                        activeCategory === cat
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                            : "bg-card/40 text-muted-foreground border-border/50 hover:bg-card/60"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-40 rounded-3xl bg-card/20 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 pb-8">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map(item => {
                                    const qty = cart.find(c => c.id === item.id)?.quantity || 0
                                    return (
                                        <motion.div
                                            layout
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileTap={{ scale: 0.96 }}
                                            onClick={() => toggleCartItem(item)}
                                            className="relative cursor-pointer"
                                        >
                                            <Card className={cn(
                                                "h-44 p-4 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between overflow-hidden",
                                                qty > 0
                                                    ? "bg-primary border-primary shadow-lg shadow-primary/30"
                                                    : "bg-card/40 border-border/50 hover:border-primary/40 shadow-sm"
                                            )}>
                                                {/* Badge/Icon */}
                                                <div className="flex justify-between items-start">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                        qty > 0 ? "bg-white/20" : "bg-muted"
                                                    )}>
                                                        <Utensils className={cn("w-5 h-5", qty > 0 ? "text-white" : "text-muted-foreground")} />
                                                    </div>
                                                    {qty > 0 && (
                                                        <span className="bg-white text-primary px-3 py-1 rounded-xl font-black text-sm">
                                                            {qty}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Name & Title */}
                                                <div className="space-y-1">
                                                    <h3 className={cn(
                                                        "text-sm font-black uppercase tracking-tight leading-tight line-clamp-2",
                                                        qty > 0 ? "text-white" : "text-foreground"
                                                    )}>
                                                        {item.name}
                                                    </h3>
                                                    <p className={cn(
                                                        "text-lg font-black",
                                                        qty > 0 ? "text-white/80" : "text-primary"
                                                    )}>
                                                        ₹{item.price}
                                                    </p>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            {/* Billing Cart: Compact Side Panel */}
            <div className="flex-1 min-w-[360px] max-w-[420px] flex flex-col h-full">
                <Card className="flex-1 flex flex-col bg-card/60 backdrop-blur-3xl border-border/30 rounded-[2.5rem] shadow-2xl shadow-black/10 overflow-hidden relative">
                    {/* Cart Header */}
                    <div className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-[2rem] gradient-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                                    <ShoppingCart className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tighter">Your Bill</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{cart.length} Items Selected</p>
                                </div>
                            </div>
                            {cart.length > 0 && (
                                <button
                                    onClick={() => setCart([])}
                                    className="p-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all active:scale-90"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Order Options */}
                        <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl border border-border/30 mb-4">
                            <button
                                onClick={() => setOrderType('DINE_IN')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all",
                                    orderType === 'DINE_IN' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" /> DINE-IN
                            </button>
                            <button
                                onClick={() => setOrderType('TAKEAWAY')}
                                className={cn(
                                    "flex-1 py-3 rounded-xl font-black text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all",
                                    orderType === 'TAKEAWAY' ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
                                )}
                            >
                                <ShoppingCart className="w-3.5 h-3.5" /> TAKEAWAY
                            </button>
                        </div>

                        {orderType === 'DINE_IN' && (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
                                {tables.length > 0 ? (
                                    tables.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTableId(t.id)}
                                            className={cn(
                                                "min-w-[70px] h-14 rounded-xl font-black text-sm flex flex-col items-center justify-center border-2 transition-all",
                                                selectedTableId === t.id
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                    : "bg-muted/30 text-muted-foreground border-transparent hover:border-primary/20"
                                            )}
                                        >
                                            <span className="text-[10px] opacity-60">TBL</span>
                                            {t.number}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-[10px] font-bold text-muted-foreground italic px-2">No tables found. Go to Tables page to add.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Cart List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10">
                                    <ShoppingCart className="w-16 h-16 mb-2" />
                                    <p className="text-xs font-black uppercase tracking-widest">Cart Empty</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <motion.div
                                        layout
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onClick={() => toggleCartItem(item, 1)}
                                        className="group p-4 bg-muted/20 border border-transparent hover:border-primary/20 rounded-2xl flex items-center justify-between gap-4 cursor-pointer active:scale-[0.98] transition-all"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-foreground text-xs uppercase truncate leading-none mb-1">
                                                {item.name}
                                            </h4>
                                            <p className="text-base font-black text-primary leading-none">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleCartItem(item, -1); }}
                                                className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Cart Footer */}
                    <div className="p-6 border-t border-border/30 bg-muted/20">
                        <div className="flex justify-between items-center mb-6 px-2">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground leading-none mb-2">Total Amount</p>
                                <h3 className="text-5xl font-black text-primary tracking-tighter leading-none">₹{total.toLocaleString()}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary">
                                <Flame className="w-6 h-6 animate-pulse" />
                            </div>
                        </div>

                        {/* Payment Selection */}
                        <div className="flex gap-2 mb-6">
                            {[
                                { id: 'CASH', icon: <Coins className="w-4 h-4" />, label: 'Cash' },
                                { id: 'UPI', icon: <QrCode className="w-4 h-4" />, label: 'UPI' },
                                { id: 'CARD', icon: <CardIcon className="w-4 h-4" />, label: 'Card' }
                            ].map((pm) => (
                                <button
                                    key={pm.id}
                                    onClick={() => setPaymentMethod(pm.id as any)}
                                    className={cn(
                                        "flex-1 py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all",
                                        paymentMethod === pm.id
                                            ? "bg-primary/5 border-primary text-primary shadow-lg shadow-primary/5"
                                            : "bg-transparent border-border/30 text-muted-foreground hover:border-primary/20"
                                    )}
                                >
                                    {pm.icon}
                                    <span className="text-[10px] font-black uppercase tracking-widest">{pm.label}</span>
                                </button>
                            ))}
                        </div>

                        <Button
                            className="w-full py-10 text-lg font-black uppercase tracking-[0.2em] rounded-3xl shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-[1.02] active:scale-95"
                            isLoading={isProcessing}
                            onClick={() => paymentMethod === 'UPI' ? setShowQR(true) : handleCheckout()}
                            disabled={cart.length === 0}
                            rightIcon={paymentMethod === 'UPI' ? <QrCode className="w-5 h-5 ml-2" /> : <Printer className="w-5 h-5 ml-2" />}
                        >
                            {paymentMethod === 'UPI' ? 'Generate UPI QR' : 'Complete & Print'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* UPI QR Modal */}
            <Modal
                isOpen={showQR}
                onClose={() => setShowQR(false)}
                title="Scan to Pay (UPI)"
                size="sm"
            >
                <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
                    <div className="p-4 bg-white rounded-3xl shadow-2xl">
                        <QRCodeSVG
                            value={`upi://pay?pa=ambranelabs@okicici&pn=AmbraneLabs&am=${total}&cu=INR`}
                            size={200}
                        />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-foreground tracking-tighter mb-1">₹{total.toLocaleString()}</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Ambrane Labs POS</p>
                    </div>
                    <Button
                        className="w-full py-6 rounded-2xl"
                        onClick={handleCheckout}
                        isLoading={isProcessing}
                    >
                        Confirm Payment Recieved
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
