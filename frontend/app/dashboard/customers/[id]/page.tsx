'use client'

import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    History,
    CreditCard,
    TrendingUp,
    Calendar,
    Star,
    ChevronRight,
    Clock,
    DollarSign,
    ShoppingBag,
    Award,
    MessageSquare,
    Printer,
    MoreVertical
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { customerService } from '@/services/customerService'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export default function CustomerDetailsPage() {
    const { id } = useParams()
    const router = useRouter()

    const { data: customerData, isLoading } = useQuery({
        queryKey: ['customer', id],
        queryFn: () => customerService.getById(id as string)
    })

    const customer = customerData?.data

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse pb-10">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <Card className="h-64" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Card key={i} className="h-32" />)}
                </div>
                <Card className="h-96" />
            </div>
        )
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <h3 className="text-xl font-bold text-foreground mb-4">Customer not found</h3>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        )
    }

    const stats = [
        {
            label: 'Lifetime Value',
            value: `₹${(customer.orders?.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-success-400'
        },
        {
            label: 'Total Orders',
            value: (customer.orders?.length || 0).toString(),
            icon: ShoppingBag,
            color: 'text-primary-400'
        },
        {
            label: 'Avg Ticket',
            value: customer.orders && customer.orders.length > 0
                ? `₹${Math.round((customer.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) || 0) / customer.orders.length)}`
                : '₹0',
            icon: TrendingUp,
            color: 'text-indigo-400'
        },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Back */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="h-10 w-10"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground uppercase tracking-tight">{customer.name}</h1>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">Customer Profile • ID: #{customer.id.slice(-6)}</p>
                </div>
            </div>

            {/* Profile Hero */}
            <Card className="overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/5 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20">
                            {customer.name.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <h2 className="text-3xl font-black text-foreground">{customer.name}</h2>
                                        <Award className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                            <Phone className="w-4 h-4 text-indigo-600" /> {customer.phone}
                                        </div>
                                        {customer.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                                <Mail className="w-4 h-4 text-primary" /> {customer.email}
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                                <MapPin className="w-4 h-4 text-muted-foreground" /> {customer.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="h-10">
                                        Edit Profile
                                    </Button>
                                    <Button className="h-10">
                                        <Star className="w-4 h-4 mr-2" /> Mark VIP
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                                {stats.map((stat, i) => (
                                    <div key={i}>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                                        <div className="flex items-center gap-2">
                                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                                            <span className="text-xl font-black text-foreground tracking-tight">{stat.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order History */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-0">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <History className="w-4 h-4 text-indigo-600" />
                                Latest Orders
                            </h3>
                            <Button variant="ghost" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                View Full Log
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-muted text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        <th className="px-6 py-4">Reference</th>
                                        <th className="px-6 py-4">Timeline</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Value</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {customer.orders?.map((order: any, i: number) => (
                                        <tr key={order.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-foreground">#{order.orderNumber.slice(-6)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), 'hh:mm a')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                    order.status === 'COMPLETED' ? "bg-success-400/10 text-success-600 border border-success-400/20" :
                                                        order.status === 'CANCELLED' ? "bg-error-400/10 text-error-600 border border-error-400/20" :
                                                            "bg-indigo-400/10 text-indigo-600 border border-indigo-400/20"
                                                )}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-black text-foreground">₹{Number(order.totalAmount).toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!customer.orders || customer.orders.length === 0) && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium italic">
                                                No historical data found for this customer.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <Award className="w-4 h-4 text-yellow-600" />
                            Loyalty Program
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-muted border border-border rounded-2xl p-4">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Current Balance</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-foreground">842</span>
                                    <span className="text-[10px] font-bold text-indigo-600">PTS</span>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '84.2%' }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                />
                            </div>
                            <p className="text-[11px] text-muted-foreground font-medium">158 points required for <span className="text-foreground font-bold">Gold Tier</span> upgrade.</p>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-widest">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Staff Notes
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border italic text-muted-foreground text-xs">
                                "Prefer window seating and mild spice configuration. Highly frequent visitor during weekend cycles."
                            </div>
                            <Button variant="outline" className="w-full text-muted-foreground hover:text-foreground h-10 border-dashed">
                                Append Note
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
