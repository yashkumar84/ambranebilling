import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // ============================================
    // 1. SEED SYSTEM PERMISSIONS
    // ============================================
    console.log('📝 Creating system permissions...')

    const permissions = [
        // Billing
        { resource: 'billing', action: 'create', description: 'Create new bills', isSystem: true },
        { resource: 'billing', action: 'view', description: 'View bills', isSystem: true },
        { resource: 'billing', action: 'void', description: 'Void/cancel bills', isSystem: true },
        { resource: 'billing', action: 'refund', description: 'Process refunds', isSystem: true },

        // Inventory
        { resource: 'inventory', action: 'create', description: 'Add new products', isSystem: true },
        { resource: 'inventory', action: 'view', description: 'View inventory', isSystem: true },
        { resource: 'inventory', action: 'update', description: 'Update product details', isSystem: true },
        { resource: 'inventory', action: 'delete', description: 'Delete products', isSystem: true },

        // Reports
        { resource: 'reports', action: 'view_sales', description: 'View sales reports', isSystem: true },
        { resource: 'reports', action: 'view_profit', description: 'View profit/loss reports', isSystem: true },
        { resource: 'reports', action: 'view_inventory', description: 'View inventory reports', isSystem: true },
        { resource: 'reports', action: 'export', description: 'Export reports', isSystem: true },

        // Settings
        { resource: 'settings', action: 'manage', description: 'Manage store settings', isSystem: true },
        { resource: 'settings', action: 'view', description: 'View store settings', isSystem: true },

        // Users
        { resource: 'users', action: 'create', description: 'Create new users', isSystem: true },
        { resource: 'users', action: 'view', description: 'View users', isSystem: true },
        { resource: 'users', action: 'update', description: 'Update user details', isSystem: true },
        { resource: 'users', action: 'delete', description: 'Delete users', isSystem: true },

        // Roles
        { resource: 'roles', action: 'create', description: 'Create custom roles', isSystem: true },
        { resource: 'roles', action: 'view', description: 'View roles', isSystem: true },
        { resource: 'roles', action: 'update', description: 'Update roles', isSystem: true },
        { resource: 'roles', action: 'delete', description: 'Delete roles', isSystem: true },
        { resource: 'roles', action: 'assign_permissions', description: 'Assign permissions to roles', isSystem: true },

        // Customers
        { resource: 'customers', action: 'create', description: 'Add new customers', isSystem: true },
        { resource: 'customers', action: 'view', description: 'View customers', isSystem: true },
        { resource: 'customers', action: 'update', description: 'Update customer details', isSystem: true },
        { resource: 'customers', action: 'delete', description: 'Delete customers', isSystem: true },

        // Tables
        { resource: 'tables', action: 'create', description: 'Create tables', isSystem: true },
        { resource: 'tables', action: 'view', description: 'View tables', isSystem: true },
        { resource: 'tables', action: 'update', description: 'Update table status', isSystem: true },
        { resource: 'tables', action: 'delete', description: 'Delete tables', isSystem: true },

        // KOT
        { resource: 'kot', action: 'view', description: 'View KOT', isSystem: true },
        { resource: 'kot', action: 'print', description: 'Print KOT', isSystem: true },

        // Khata (Credit)
        { resource: 'khata', action: 'view', description: 'View credit ledger', isSystem: true },
        { resource: 'khata', action: 'add_credit', description: 'Add credit to customer', isSystem: true },
        { resource: 'khata', action: 'collect_payment', description: 'Collect credit payments', isSystem: true },
    ]

    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { resource_action: { resource: permission.resource, action: permission.action } },
            update: {},
            create: permission,
        })
    }

    console.log(`✅ Created ${permissions.length} system permissions`)

    // ============================================
    // 2. SEED SUBSCRIPTION PLANS
    // ============================================
    console.log('💰 Creating subscription plans...')

    const plans = [
        {
            name: 'Starter',
            priceMonthly: 299,
            priceYearly: 2990, // ~2 months free
            maxUsers: 1,
            maxProducts: 50,
            maxBillsPerMonth: 1000,
            features: {
                billing: true,
                thermal_printer: true,
                customer_management: true,
                basic_reports: true,
                qr_ordering: false,
                inventory: false,
                kot: false,
                tables: false,
                khata: false,
                advanced_reports: false,
                multi_store: false,
                batch_tracking: false,
                variants: false,
                ai_pricing: false,
                whatsapp: false,
            },
            isActive: true,
        },
        {
            name: 'Professional',
            priceMonthly: 699,
            priceYearly: 6990,
            maxUsers: 5,
            maxProducts: 500,
            maxBillsPerMonth: null, // Unlimited
            features: {
                billing: true,
                thermal_printer: true,
                customer_management: true,
                basic_reports: true,
                qr_ordering: true,
                inventory: true,
                kot: true,
                tables: true,
                khata: true,
                advanced_reports: true,
                multi_store: false,
                batch_tracking: false,
                variants: false,
                ai_pricing: false,
                whatsapp: true,
            },
            isActive: true,
        },
        {
            name: 'Enterprise',
            priceMonthly: 1499,
            priceYearly: 14990,
            maxUsers: 999, // Unlimited (high number)
            maxProducts: 999999,
            maxBillsPerMonth: null,
            features: {
                billing: true,
                thermal_printer: true,
                customer_management: true,
                basic_reports: true,
                qr_ordering: true,
                inventory: true,
                kot: true,
                tables: true,
                khata: true,
                advanced_reports: true,
                multi_store: true,
                batch_tracking: true,
                variants: true,
                ai_pricing: true,
                whatsapp: true,
                predictive_inventory: true,
                supplier_marketplace: true,
                staff_analytics: true,
            },
            isActive: true,
        },
    ]

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: {},
            create: plan,
        })
    }

    console.log(`✅ Created ${plans.length} subscription plans`)

    // ============================================
    // 3. SEED DEFAULT ROLES
    // ============================================
    console.log('👥 Creating default system roles...')

    const defaultRoles = [
        {
            name: 'TENANT_OWNER',
            description: 'Full access to the store dashboard and settings',
            isSystemRole: true,
        },
        {
            name: 'MANAGER',
            description: 'Can manage inventory, orders, and reports',
            isSystemRole: true,
        },
        {
            name: 'CASHIER',
            description: 'Can create bills and view tables',
            isSystemRole: true,
        },
    ]

    const seededRoles: any = {}
    for (const role of defaultRoles) {
        let existingRole = await prisma.role.findFirst({
            where: { tenantId: null, name: role.name }
        })

        if (existingRole) {
            existingRole = await prisma.role.update({
                where: { id: existingRole.id },
                data: { description: role.description }
            })
        } else {
            existingRole = await prisma.role.create({
                data: { ...role, tenantId: null }
            })
        }
        seededRoles[role.name] = existingRole
    }

    // ============================================
    // 4. BIND PERMISSIONS TO ROLES
    // ============================================
    console.log('🔗 Binding permissions to roles...')
    const allPermissions = await prisma.permission.findMany()

    // Assign all permissions to TENANT_OWNER
    for (const perm of allPermissions) {
        await prisma.rolePermission.upsert({
            where: { roleId_permissionId: { roleId: seededRoles['TENANT_OWNER'].id, permissionId: perm.id } },
            update: {},
            create: { roleId: seededRoles['TENANT_OWNER'].id, permissionId: perm.id },
        })
    }

    console.log('✅ Default roles and bindings created')

    // ============================================
    // 5. CREATE SUPER ADMIN USER
    // ============================================
    console.log('👑 Creating Super Admin user...')

    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await prisma.user.upsert({
        where: { email: 'admin@ambrane.com' },
        update: {},
        create: {
            email: 'admin@ambrane.com',
            password: hashedPassword,
            name: 'Super Admin',
            phone: '9999999999',
            isSuperAdmin: true,
            isActive: true,
        },
    })

    console.log('✅ Super Admin created (email: admin@ambrane.com, password: admin123)')

    console.log('\n🎉 Seeding completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
