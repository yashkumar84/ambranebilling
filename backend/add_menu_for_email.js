const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'hello@ambrane.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { tenantId: true, name: true }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    if (!user.tenantId) {
        console.error(`User ${user.name} does not have an associated tenant.`);
        return;
    }

    console.log(`Found user: ${user.name}, Tenant ID: ${user.tenantId}`);

    const product = await prisma.product.create({
        data: {
            tenantId: user.tenantId,
            name: 'Ambrane Special Platter',
            description: 'A premium platter for testing billing and navigation.',
            category: 'Main Course',
            sellingPrice: 499.00,
            isActive: true,
            isAvailable: true,
        },
    });

    console.log(`Successfully added menu item: ${product.name} (ID: ${product.id}) for tenant: ${user.tenantId}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
