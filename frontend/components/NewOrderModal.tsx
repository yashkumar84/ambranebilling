'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, CreditCard, Search, Printer, User, Utensils } from 'lucide-react'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { toast } from 'sonner'
import { orderService } from '@/services/orderService'

interface MenuItem {
    id: string
    name: string
    price: number
    category: string
    isAvailable: boolean
}

interface Table {
    id: string
    number: string
    status: string
}

interface OrderItem {
    menuItemId: string
    name: string
    price: number
    quantity: number
}

interface NewOrderModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
    const [step, setStep] = useState(1)
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [customerName, setCustomerName] = useState('')
    const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN')
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH')
    const queryClient = useQueryClient()

    // Fetch available tables
    const { data: tablesData } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await api.get('/api/tables')
            return response.data.data as Table[]
        },
        enabled: isOpen,
    })

    // Fetch menu items
    const { data: menuData } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const response = await api.get('/api/menu')
            const result = response.data.data as any
            const products = result.products || result.items || (Array.isArray(result) ? result : [])
            return products.map((p: any) => ({
                id: p.id,
                name: p.name,
                category: p.category,
                price: p.price || Number(p.sellingPrice) || 0,
                isAvailable: p.isAvailable ?? true
            })) as MenuItem[]
        },
        enabled: isOpen,
    })

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/api/orders', {
                tableId: orderType === 'DINE_IN' ? selectedTable : undefined,
                orderType,
                customerName: orderType === 'TAKEAWAY' ? customerName : undefined,
                items: orderItems.map(item => ({
                    productId: item.menuItemId,
                    productName: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                status: 'COMPLETED', // Staff billing usually means immediate completion
                paymentStatus: 'COMPLETED',
                paymentMethod: paymentMethod,
                taxRate: 5
            })
            return response.data.data
        },
        onSuccess: async (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            toast.success('Bill generated successfully!')

            // Auto-trigger thermal print
            try {
                await orderService.downloadReceipt(data.id)
            } catch (printError) {
                console.error('Print failed:', printError)
            }

            handleClose()
        },
        onError: () => {
            toast.error('Failed to generate bill')
        },
    })

    const menuItems = menuData?.filter(m => m.isAvailable) || []
    const categories = useMemo(() => ['All', ...Array.from(new Set(menuItems.map(item => item.category)))], [menuItems])

    const addItem = (menuItem: MenuItem) => {
        const existing = orderItems.find(item => item.menuItemId === menuItem.id)
        if (existing) {
            setOrderItems(orderItems.map(item =>
                item.menuItemId === menuItem.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setOrderItems([...orderItems, {
                menuItemId: menuItem.id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: 1,
            }])
        }
    }

    const removeItem = (menuItemId: string) => {
        const existing = orderItems.find(item => item.menuItemId === menuItemId)
        if (existing && existing.quantity > 1) {
            setOrderItems(orderItems.map(item =>
                item.menuItemId === menuItemId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ))
        } else {
            setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId))
        }
    }

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleClose = () => {
        setSelectedTable(null)
        setOrderItems([])
        setCustomerName('')
        setOrderType('DINE_IN')
        setStep(1)
        onClose()
    }

    const handleSubmit = () => {
        if (orderType === 'DINE_IN' && !selectedTable) {
            toast.error('Please select a table')
            return
        }
        if (orderItems.length === 0) {
            toast.error('Please add at least one item')
            return
        }
        createOrderMutation.mutate()
    }

    const renderStep = () => {
        switch (step) {
            case 1: // SELECT ITEMS
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="flex flex-col gap-4 mb-2">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none font-bold"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all border ${activeCategory === cat
                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {menuItems
                                    .filter(item => {
                                        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
                                        const matchesCategory = activeCategory === 'All' || item.category === activeCategory
                                        return matchesSearch && matchesCategory
                                    })
                                    .map(item => {
                                        const quantity = orderItems.find(oi => oi.menuItemId === item.id)?.quantity || 0
                                        return (
                                            <motion.div
                                                layout
                                                key={item.id}
                                                className={`p-4 rounded-[1.5rem] border-2 transition-all flex flex-col gap-4 ${quantity > 0
                                                    ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5'
                                                    : 'bg-card border-border hover:border-primary/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-black text-lg text-foreground tracking-tight">{item.name}</h4>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.category}</span>
                                                    </div>
                                                    <p className="text-xl font-black text-primary">₹{item.price}</p>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-2">
                                                        {quantity > 0 && (
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => addItem(item)}
                                                            className="px-4 py-2 rounded-xl bg-primary text-white font-black text-xs uppercase"
                                                        >
                                                            {quantity > 0 ? quantity : 'Add Item'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                            </div>
                        </div>

                        {orderItems.length > 0 && (
                            <div className="pt-4 border-t border-border mt-auto">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep(2)}
                                    className="w-full py-5 gradient-primary text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3"
                                >
                                    Select Table/Customer (₹{(total || 0).toLocaleString()})
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                )

            case 2: // SELECT TABLE/CUSTOMER
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="flex gap-4 p-2 bg-muted/30 rounded-2xl">
                            <button
                                onClick={() => setOrderType('DINE_IN')}
                                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${orderType === 'DINE_IN' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
                            >
                                <Utensils className="w-4 h-4" /> Dine-in
                            </button>
                            <button
                                onClick={() => setOrderType('TAKEAWAY')}
                                className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${orderType === 'TAKEAWAY' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground'}`}
                            >
                                <User className="w-4 h-4" /> Takeaway
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {orderType === 'DINE_IN' ? (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {(tablesData || []).map(table => (
                                        <motion.button
                                            key={table.id}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedTable(table.id)}
                                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg border-2 ${selectedTable === table.id
                                                ? 'gradient-primary text-white border-transparent'
                                                : 'bg-card border-border hover:border-primary/50 text-foreground'
                                                }`}
                                        >
                                            <span className="text-3xl font-black">{table.number}</span>
                                            <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">{table.status}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="max-w-md mx-auto space-y-4 pt-10">
                                    <div className="text-center mb-10">
                                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                            <User className="w-10 h-10" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">Customer Info</h3>
                                        <p className="text-sm text-muted-foreground font-medium">Record name for takeaway tracking</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Customer Name (Optional)"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full p-5 bg-card border-2 border-border focus:border-primary rounded-[1.5rem] outline-none font-black text-lg transition-all"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-border mt-auto">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold border border-border"
                            >
                                Back to Items
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-[2] py-4 gradient-primary text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3"
                            >
                                Review & Pay (₹{(total || 0).toLocaleString()})
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )

            case 3: // PAY & PRINT
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-lg mx-auto h-full flex flex-col">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-foreground underline decoration-primary decoration-4 underline-offset-8">Final Step: Pay & Print</h3>
                            <p className="text-muted-foreground mt-4">Review summary and settle balance</p>
                        </div>

                        <div className="bg-muted/50 rounded-3xl p-8 border-2 border-dashed border-border flex-1 overflow-y-auto no-scrollbar flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Order Type</span>
                                <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                    {orderType === 'DINE_IN' ? `Table ${tablesData?.find(t => t.id === selectedTable)?.number}` : `Takeaway: ${customerName || 'Walk-in'}`}
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                {orderItems.map(item => (
                                    <div key={item.menuItemId} className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                {item.quantity}x
                                            </div>
                                            <span className="font-bold text-foreground">{item.name}</span>
                                        </div>
                                        <span className="font-black text-foreground">₹{((item.price || 0) * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-6 mt-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total Payable</p>
                                        <h4 className="text-4xl font-black text-primary tracking-tighter">₹{(total || 0).toLocaleString()}</h4>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Select Payment Mode</p>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'CASH', label: 'Cash' },
                                            { id: 'UPI', label: 'UPI' },
                                            { id: 'CARD', label: 'Card' }
                                        ].map(pm => (
                                            <button
                                                key={pm.id}
                                                onClick={() => setPaymentMethod(pm.id as any)}
                                                className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border-2 transition-all ${paymentMethod === pm.id
                                                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                                                    : 'bg-card border-border text-muted-foreground'}`}
                                            >
                                                {pm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 mt-auto">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold border border-border"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createOrderMutation.isPending}
                                className="flex-[2] py-4 bg-foreground text-background rounded-2xl font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                {createOrderMutation.isPending ? 'Processing...' : (
                                    <>
                                        <Printer className="w-5 h-5" />
                                        Pay & Print Invoice
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[10000]"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 100 }}
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl h-[90vh] md:h-[85vh] bg-card rounded-[3rem] shadow-2xl z-[10001] overflow-hidden flex flex-col border border-border/50"
                    >
                        {/* Header with Step Indicator */}
                        <div className="p-8 pb-4 border-b border-border bg-muted/10 relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                                        <ShoppingCart className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">Instant Billing</h2>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">3-Step Velocity Flow</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 bg-muted hover:bg-destructive/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between relative max-w-md mx-auto mb-4">
                                <div className="absolute left-0 top-1/2 w-full h-1 bg-border -translate-y-1/2 z-0" />
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black z-10 border-4 transition-all duration-500 ${step >= i
                                            ? 'bg-primary text-white border-primary-light scale-110 shadow-lg'
                                            : 'bg-card text-muted-foreground border-border'
                                            }`}
                                    >
                                        {i === 1 ? <ShoppingCart className="w-5 h-5" /> : i === 2 ? <Utensils className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden p-8">
                            {renderStep()}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
