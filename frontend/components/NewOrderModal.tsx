'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, CreditCard } from 'lucide-react'
import api from '@/lib/api'
import endpoints from '@/lib/endpoints'
import { toast } from 'sonner'

interface MenuItem {
    id: string
    name: string
    price: number
    category: string
    isAvailable: boolean
}

interface Table {
    id: string
    tableNumber: number
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
    const [orderItems, setOrderItems] = useState<OrderItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const queryClient = useQueryClient()

    // Fetch available tables
    const { data: tablesData } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const response = await api.get(endpoints.tables.list('1'))
            return response.data.data.items as Table[]
        },
        enabled: isOpen,
    })

    // Fetch menu items
    const { data: menuData } = useQuery({
        queryKey: ['menu'],
        queryFn: async () => {
            const response = await api.get(endpoints.menu.list('1'))
            return response.data.data.items as MenuItem[]
        },
        enabled: isOpen,
    })

    // Create order mutation
    const createOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post(endpoints.orders.create, {
                tableId: selectedTable,
                items: orderItems.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                })),
            })
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['tables'] })
            toast.success('Order and bill generated successfully!')
            handleClose()
        },
        onError: () => {
            toast.error('Failed to generate bill')
        },
    })

    const availableTables = tablesData?.filter(t => t.status === 'AVAILABLE') || []
    const menuItems = menuData?.filter(m => m.isAvailable) || []
    const categories = Array.from(new Set(menuItems.map(item => item.category)))

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
        setSelectedTable('')
        setOrderItems([])
        setStep(1)
        onClose()
    }

    const handleSubmit = () => {
        if (!selectedTable) {
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
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-foreground">Step 1: Select a Table</h3>
                            <p className="text-muted-foreground">Tap on an available table to start billing</p>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {availableTables.map(table => (
                                <motion.button
                                    key={table.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedTable(table.id)
                                        setStep(2)
                                    }}
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all shadow-lg border-2 ${selectedTable === table.id
                                        ? 'gradient-primary text-white border-transparent'
                                        : 'bg-card border-border hover:border-primary/50 text-foreground'
                                        }`}
                                >
                                    <span className="text-3xl font-black">{table.tableNumber}</span>
                                    <span className="text-xs font-bold uppercase opacity-80">Table</span>
                                </motion.button>
                            ))}
                            {availableTables.length === 0 && (
                                <div className="col-span-full text-center py-10 text-muted-foreground">
                                    No available tables found.
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground">Step 2: Add Items</h3>
                                <p className="text-muted-foreground">Select products and adjust quantities</p>
                            </div>
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                ← Change Table ({availableTables.find(t => t.id === selectedTable)?.tableNumber})
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 mb-6">
                            <div className="relative">
                                <ShoppingCart className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search products (e.g. Burger)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold placeholder:font-medium transition-all"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setActiveCategory('All')}
                                    className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all border ${activeCategory === 'All'
                                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                                        }`}
                                >
                                    All
                                </button>
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
                                                className={`group p-4 rounded-[1.5rem] border-2 transition-all flex flex-col gap-4 ${quantity > 0
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
                                                        {quantity > 0 ? (
                                                            <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-black">
                                                                {quantity} IN CART
                                                            </div>
                                                        ) : (
                                                            <div className="text-[10px] font-bold text-muted-foreground uppercase">
                                                                Not selected
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {quantity > 0 && (
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => removeItem(item.id)}
                                                                className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </motion.button>
                                                        )}
                                                        <motion.button
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => addItem(item)}
                                                            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg hover:shadow-primary/40 transition-all font-black text-xl"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                            </div>
                            {menuItems.filter(item => {
                                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
                                const matchesCategory = activeCategory === 'All' || item.category === activeCategory
                                return matchesSearch && matchesCategory
                            }).length === 0 && (
                                    <div className="text-center py-20 opacity-50">
                                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="w-10 h-10" />
                                        </div>
                                        <p className="font-bold">No products found for "{searchQuery}"</p>
                                    </div>
                                )}
                        </div>

                        {orderItems.length > 0 && (
                            <div className="pt-4 border-t border-border mt-auto">
                                <motion.button
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    onClick={() => setStep(3)}
                                    className="w-full py-4 gradient-primary text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3"
                                >
                                    Proceed to Bill (₹{total.toLocaleString()})
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </div>
                        )}
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-lg mx-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-foreground underline decoration-primary decoration-4 underline-offset-8">Step 3: Generate Bill</h3>
                            <p className="text-muted-foreground mt-4">Review final items and confirm bill</p>
                        </div>

                        <div className="bg-muted/50 rounded-3xl p-8 border-2 border-dashed border-border relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm font-black uppercase tracking-tighter text-muted-foreground">Order Details</span>
                                    <span className="text-sm font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                        Table {availableTables.find(t => t.id === selectedTable)?.tableNumber}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    {orderItems.map(item => (
                                        <div key={item.menuItemId} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                    {item.quantity}x
                                                </div>
                                                <span className="font-bold text-foreground">{item.name}</span>
                                            </div>
                                            <span className="font-black text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-border border-dashed pt-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs font-black uppercase text-muted-foreground mb-1">Total Amount Payable</p>
                                            <h4 className="text-4xl font-black text-primary tracking-tighter">₹{total.toLocaleString()}</h4>
                                        </div>
                                        <div className="text-right text-[10px] text-muted-foreground uppercase font-bold">
                                            Inclusive of all taxes
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep(2)}
                                className="flex-1 py-4 bg-muted text-foreground rounded-2xl font-bold hover:bg-muted/80 transition-all border border-border"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={createOrderMutation.isPending}
                                className="flex-[2] py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {createOrderMutation.isPending ? 'Generating...' : 'Confirm & Generate Bill'}
                                <CheckCircle2 className="w-5 h-5" />
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
                        className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl h-[85vh] md:h-[80vh] bg-card rounded-[2.5rem] shadow-2xl z-[10001] overflow-hidden flex flex-col border border-border/50"
                    >
                        {/* Header with Step Indicator */}
                        <div className="p-8 border-b border-border bg-muted/20 relative">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-foreground tracking-tighter">QUICK BILLING</h2>
                                <button
                                    onClick={handleClose}
                                    className="w-10 h-10 bg-muted hover:bg-destructive/10 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between relative">
                                <div className="absolute left-0 top-1/2 w-full h-1 bg-border -translate-y-1/2 z-0" />
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black z-10 border-4 transition-all duration-500 ${step >= i
                                            ? 'bg-primary text-white border-primary-light scale-110 shadow-lg'
                                            : 'bg-card text-muted-foreground border-border'
                                            }`}
                                    >
                                        {i === 3 ? <CreditCard className="w-5 h-5" /> : i}
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
