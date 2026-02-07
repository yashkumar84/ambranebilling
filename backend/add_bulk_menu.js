const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'hello@ambrane.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { tenantId: true, name: true }
    });

    if (!user || !user.tenantId) {
        console.error(`User with email ${email} not found or has no tenant.`);
        return;
    }

    const items = [
        { name: 'Fresh Lime Soda', category: 'Beverages', price: 80 },
        { name: 'Cold Coffee', category: 'Beverages', price: 120 },
        { name: 'Spring Rolls', category: 'Starters', price: 180 },
        { name: 'Paneer Tikka', category: 'Starters', price: 230 },
        { name: 'Dal Makhani', category: 'Main Course', price: 280 },
        { name: 'Butter Naan', category: 'Main Course', price: 45 },
        { name: 'Mixed Veg Curry', category: 'Main Course', price: 260 },
        { name: 'Gulab Jamun (2pcs)', category: 'Desserts', price: 90 },
        { name: 'Vanilla Ice Cream', category: 'Desserts', price: 70 },
        { name: 'French Fries', category: 'Snacks', price: 110 },
        { name: 'Veg Grilled Sandwich', category: 'Snacks', price: 140 },
    ];

    console.log(`Adding ${items.length} items for tenant: ${user.tenantId}`);

    const createdItems = await Promise.all(
        items.map(item =>
            prisma.product.create({
                data: {
                    tenantId: user.tenantId,
                    name: item.name,
                    category: item.category,
                    sellingPrice: item.price,
                    isActive: true,
                    isAvailable: true,
                    description: `Delicious ${item.name} from our ${item.category} selection.`
                }
            })
        )
    );

    console.log(`Successfully added ${createdItems.length} items.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
