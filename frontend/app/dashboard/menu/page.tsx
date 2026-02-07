'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    UtensilsCrossed,
    Filter,
    MoreVertical,
    Star,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    List,
    Camera,
    Sparkles,
    Trash
} from 'lucide-react'
import { toast } from 'sonner'
import { useMenuStore } from '@/store/useMenuStore'
import AddMenuItemModal from '@/components/AddMenuItemModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function MenuPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('ALL')
    const [showAddModal, setShowAddModal] = useState(false)
    const [itemToEdit, setItemToEdit] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const { items: menuItems, loading, fetchMenu, removeMenuItem, updateMenuItem } = useMenuStore()

    useEffect(() => {
        fetchMenu()
    }, [])

    const handleDelete = async (id: string) => {
        try {
            await removeMenuItem(id)
            toast.success('Deleted', { description: 'Menu item has been successfully removed.' })
        } catch (error: any) {
            toast.error('Delete failed', { description: 'Could not remove menu item. Please try again.' })
        }
    }

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            await updateMenuItem(id, { isAvailable: !currentStatus })
            toast.success(currentStatus ? 'Deactivated' : 'Activated', {
                description: `Item is now ${currentStatus ? 'unavailable' : 'available'} for orders.`
            })
        } catch (error: any) {
            toast.error('Update failed')
        }
    }

    const categories = ['ALL', ...Array.from(new Set((menuItems || []).map(item => item.category)))]

    const filteredItems = (menuItems || []).filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Menu Management</h1>
                    <p className="text-muted-foreground font-medium">Create, edit, and organize your digital menu items.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-muted p-1 rounded-xl border border-border mr-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'grid' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                viewMode === 'list' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <Button
                        onClick={() => {
                            setItemToEdit(null)
                            setShowAddModal(true)
                        }}
                        className="h-11 shadow-lg shadow-primary-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Item
                    </Button>
                </div>
            </div>

            {/* Navigation & Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
                <Card className="flex-1 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Search by item name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border capitalize",
                                        selectedCategory === cat
                                            ? "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10"
                                            : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-border"
                                    )}
                                >
                                    {cat.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Menu Items Grid */}
            <div className={cn(
                "grid gap-6 transition-all duration-500",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
            )}>
                {loading && menuItems.length === 0 ? (
                    [...Array(6)].map((_, i) => (
                        <Card key={i} className="p-0 h-[340px]">
                            <div className="h-44 w-full bg-muted animate-pulse" />
                            <div className="p-6 space-y-4">
                                <div className="h-6 w-1/2 bg-muted animate-pulse rounded-lg" />
                                <div className="h-4 w-full bg-muted animate-pulse rounded-lg" />
                                <div className="h-8 w-1/3 bg-muted animate-pulse rounded-lg mt-auto" />
                            </div>
                        </Card>
                    ))
                ) : filteredItems.length === 0 ? (
                    <div className="col-span-full py-20 bg-muted/30 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6">
                            <UtensilsCrossed className="w-10 h-10 text-muted-foreground opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">No menu items found</h3>
                        <p className="text-muted-foreground text-sm max-w-xs text-center font-medium">
                            {searchQuery ? `We couldn't find anything matching "${searchQuery}"` : "Your digital menu is currently empty. Start by adding your first signature dish!"}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredItems.map((item, idx) => (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.4, delay: idx * 0.03 }}
                            >
                                <Card className={cn(
                                    "group overflow-hidden transition-all duration-500",
                                    !item.isAvailable && "opacity-75 grayscale-[0.5]"
                                )}>
                                    <div className={cn(
                                        "flex",
                                        viewMode === 'list' ? "flex-row items-center h-28" : "flex-col"
                                    )}>
                                        {/* Image Section */}
                                        <div className={cn(
                                            "relative overflow-hidden bg-muted",
                                            viewMode === 'list' ? "w-28 h-28 border-r border-border" : "h-48 w-full border-b border-border"
                                        )}>
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                                    <Camera className="w-12 h-12 text-muted-foreground opacity-20" />
                                                </div>
                                            )}

                                            {/* Labels overlay */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                                                <div className={cn(
                                                    "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md border",
                                                    item.isVeg ? "bg-success-500/20 text-success-400 border-success-500/30" : "bg-error-500/20 text-error-400 border-error-500/30"
                                                )}>
                                                    {item.isVeg ? 'Veg' : 'Non-Veg'}
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => toggleAvailability(item.id.toString(), item.isAvailable)}
                                                className={cn(
                                                    "absolute top-3 right-3 p-1.5 rounded-lg border backdrop-blur-md transition-all",
                                                    item.isAvailable
                                                        ? "bg-success-500/10 text-success-600 border-success-500/20 hover:bg-success-500/20"
                                                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                                                )}
                                            >
                                                {item.isAvailable ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors uppercase leading-tight truncate max-w-[200px]">
                                                        {item.name}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-foreground tracking-tighter">₹{(item.price || 0).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            {viewMode === 'grid' && (
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6 line-clamp-2">
                                                    {item.description || "Freshly prepared with authentic ingredients for a traditional taste experience."}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground">4.8</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setItemToEdit(item)
                                                            setShowAddModal(true)
                                                        }}
                                                        className="p-2 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all text-xs"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id.toString())}
                                                        className="p-2 rounded-xl bg-error-500/5 border border-error-500/10 text-error-600 hover:bg-error-500 hover:text-white transition-all"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Pagination / Footer Info */}
            {!loading && filteredItems.length > 0 && (
                <div className="flex items-center justify-between pt-8 border-t border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Showing {filteredItems.length} of {menuItems.length} Signature Items
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <AddMenuItemModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false)
                    setItemToEdit(null)
                }}
                itemToEdit={itemToEdit}
            />
        </div>
    )
}
