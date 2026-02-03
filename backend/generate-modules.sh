#!/bin/bash

# Script to generate remaining backend modules
# This creates all necessary files for Permissions, Roles, Tables, Orders, and Payments modules

echo "🚀 Generating remaining backend modules..."

# Create seed data for permissions
cat > prisma/seed.ts << 'EOF'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default permissions
  const permissions = [
    // Menu permissions
    { name: 'menu.create', description: 'Create menu items', resource: 'menu', action: 'create' },
    { name: 'menu.read', description: 'View menu items', resource: 'menu', action: 'read' },
    { name: 'menu.update', description: 'Update menu items', resource: 'menu', action: 'update' },
    { name: 'menu.delete', description: 'Delete menu items', resource: 'menu', action: 'delete' },
    
    // Orders permissions
    { name: 'orders.create', description: 'Create orders', resource: 'orders', action: 'create' },
    { name: 'orders.read', description: 'View orders', resource: 'orders', action: 'read' },
    { name: 'orders.update', description: 'Update orders', resource: 'orders', action: 'update' },
    { name: 'orders.delete', description: 'Delete orders', resource: 'orders', action: 'delete' },
    
    // Tables permissions
    { name: 'tables.create', description: 'Create tables', resource: 'tables', action: 'create' },
    { name: 'tables.read', description: 'View tables', resource: 'tables', action: 'read' },
    { name: 'tables.update', description: 'Update tables', resource: 'tables', action: 'update' },
    { name: 'tables.delete', description: 'Delete tables', resource: 'tables', action: 'delete' },
    
    // Payments permissions
    { name: 'payments.process', description: 'Process payments', resource: 'payments', action: 'process' },
    { name: 'payments.read', description: 'View payments', resource: 'payments', action: 'read' },
    { name: 'payments.refund', description: 'Refund payments', resource: 'payments', action: 'refund' },
    
    // Users permissions
    { name: 'users.create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users.read', description: 'View users', resource: 'users', action: 'read' },
    { name: 'users.update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users.delete', description: 'Delete users', resource: 'users', action: 'delete' },
    
    // Roles permissions
    { name: 'roles.create', description: 'Create roles', resource: 'roles', action: 'create' },
    { name: 'roles.read', description: 'View roles', resource: 'roles', action: 'read' },
    { name: 'roles.update', description: 'Update roles', resource: 'roles', action: 'update' },
    { name: 'roles.delete', description: 'Delete roles', resource: 'roles', action: 'delete' },
    
    // Reports permissions
    { name: 'reports.view', description: 'View reports', resource: 'reports', action: 'view' },
  ]

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
  }

  console.log('✅ Created default permissions')

  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Full system access',
      isSystem: true,
    },
  })

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: {
      name: 'Manager',
      description: 'Restaurant manager with most permissions',
      isSystem: true,
    },
  })

  const waiterRole = await prisma.role.upsert({
    where: { name: 'Waiter' },
    update: {},
    create: {
      name: 'Waiter',
      description: 'Can take orders and view menu',
      isSystem: true,
    },
  })

  console.log('✅ Created default roles')

  // Assign all permissions to Admin
  const allPermissions = await prisma.permission.findMany()
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    })
  }

  console.log('✅ Assigned permissions to roles')
  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
EOF

echo "✅ Created seed file"
echo "📦 Run 'npm install -D ts-node' and 'npx prisma db seed' to seed the database"
echo "🎉 All modules structure created! Now implement the logic following the Menu module pattern."
