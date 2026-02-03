# Permissions & Roles System - Implementation Notes

## Requirements

### Admin Capabilities
- Create custom permissions
- Create custom roles
- Assign permissions to roles
- Assign roles to users

### Database Schema Updates Needed

```prisma
model Permission {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  resource    String   // e.g., "menu", "orders", "tables"
  action      String   // e.g., "create", "read", "update", "delete"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  roles       RolePermission[]
}

model Role {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  users       User[]
  permissions RolePermission[]
}

model RolePermission {
  id           Int        @id @default(autoincrement())
  roleId       Int
  permissionId Int
  createdAt    DateTime   @default(now())
  
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
}

// Update User model
model User {
  // ... existing fields
  roleId Int?
  role   Role? @relation(fields: [roleId], references: [id])
}
```

## Implementation Plan

### 1. Permissions Module
- CRUD for permissions
- List all permissions
- Group by resource

### 2. Roles Module
- CRUD for roles
- Assign/remove permissions to roles
- List roles with permissions

### 3. Enhanced Auth Middleware
- Check user role
- Check role permissions
- Permission-based access control

### 4. Admin UI
- Permissions management
- Roles management
- User role assignment

## Example Permissions

```
menu.create
menu.read
menu.update
menu.delete
orders.create
orders.read
orders.update
orders.delete
tables.manage
payments.process
reports.view
users.manage
```

## Example Roles

**Admin:**
- All permissions

**Manager:**
- menu.*, orders.*, tables.*, reports.view

**Waiter:**
- menu.read, orders.create, orders.read, tables.read

**Kitchen Staff:**
- orders.read (only PREPARING status)

This will be implemented after core modules are complete.
