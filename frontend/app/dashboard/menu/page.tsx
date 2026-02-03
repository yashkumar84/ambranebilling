'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { useMenuStore } from '@/store/useMenuStore'
import AddMenuItemModal from '@/components/AddMenuItemModal'

export default function MenuPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [showAddModal, setShowAddModal] = useState(false)
    const { items: menuItems, loading, fetchMenu, removeMenuItem } = useMenuStore()

    useEffect(() => {
        fetchMenu()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await removeMenuItem(id)
            toast.success('Menu item deleted successfully')
        } catch (error: any) {
            toast.error('Failed to delete menu item')
        }
    }

    const categories = ['ALL', ...Array.from(new Set((menuItems || []).map(item => item.category)))]

    const filteredItems = (menuItems || []).filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Menu</h1>
                    <p className="text-muted-foreground mt-1">Manage your restaurant menu items</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 gradient-primary text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Item
                </motion.button>
            </div>

            {/* Search and Filter */}
            <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-2 p-1 bg-muted rounded-xl border border-border">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category
                                    ? 'gradient-primary text-white shadow-lg'
                                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && menuItems.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-card animate-pulse h-64 rounded-2xl border border-border" />
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full bg-card rounded-2xl p-12 text-center border border-border">
                        <UtensilsCrossed className="w-16 h-16 text-muted mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">No menu items found</p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden hover:shadow-xl transition-all group"
                        >
                            {/* Item Image */}
                            <div className="h-48 bg-muted flex items-center justify-center relative overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full gradient-primary/5 flex items-center justify-center">
                                        <UtensilsCrossed className="w-16 h-16 text-muted-foreground opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${item.isAvailable
                                        ? 'bg-green-500 text-white'
                                        : 'bg-red-500 text-white'
                                        }`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>

                            {/* Item Details */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                                            {item.description || 'No description provided for this item.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{item.category}</span>
                                        <span className="text-2xl font-black text-foreground">
                                            ₹{item.price.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="p-3 bg-muted text-foreground rounded-xl hover:bg-primary hover:text-white transition-all border border-border"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleDelete(item.id.toString())}
                                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Menu Item Modal */}
            <AddMenuItemModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
        </div>
    )
}
