const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.log('No tenant found. Creating a test tenant...');
        const newTenant = await prisma.tenant.create({
            data: {
                businessName: 'Test Restaurant',
                businessType: 'RESTAURANT',
                email: 'test@example.com',
            },
        });
        console.log('Created tenant:', newTenant.id);
        await addMenuItem(newTenant.id);
    } else {
        console.log('Using existing tenant:', tenant.businessName, '(', tenant.id, ')');
        await addMenuItem(tenant.id);
    }
}

async function addMenuItem(tenantId) {
    const product = await prisma.product.create({
        data: {
            tenantId: tenantId,
            name: 'Paneer Butter Masala (Test)',
            description: 'Test menu item for billing verification',
            category: 'Main Course',
            sellingPrice: 250.00,
            isActive: true,
            isAvailable: true,
        },
    });
    console.log('Added menu item:', product.name, 'with ID:', product.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
