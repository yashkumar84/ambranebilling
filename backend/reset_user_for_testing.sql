-- Reset User for Onboarding Testing
-- Run this in Prisma Studio's SQL query or in PostgreSQL directly

-- 1. Find your user's email (replace with actual email)
-- SELECT * FROM users WHERE email = 'test@example.com';

-- 2. Reset the user's tenant (replace with your email)
UPDATE users 
SET tenant_id = NULL, role_id = NULL 
WHERE email = 'tyash3397@gmail.com';

-- 3. Optionally, delete the old tenant and subscription
-- DELETE FROM tenant_subscriptions WHERE tenant_id = 'TENANT_ID_HERE';
-- DELETE FROM tenants WHERE id = 'TENANT_ID_HERE';

-- 4. Verify the reset
-- SELECT id, email, name, tenant_id, role_id FROM users WHERE email = 'YOUR_EMAIL_HERE';
