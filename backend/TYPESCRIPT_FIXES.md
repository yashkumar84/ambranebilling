# TypeScript Error Fixes

If you're seeing red TypeScript errors in VS Code, try these steps:

## 1. Reload VS Code TypeScript Server

**Press:** `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
**Type:** `TypeScript: Restart TS Server`
**Press:** Enter

## 2. Regenerate Prisma Client

```bash
cd backend
npx prisma generate
```

## 3. Restart VS Code

Close and reopen VS Code completely.

## 4. Check Node Modules

Make sure all dependencies are installed:

```bash
cd backend
npm install
```

## Common Errors & Solutions

### Error: `Module '@prisma/client' has no exported member 'User'`

**Solution:**
1. Run `npx prisma generate` in the backend folder
2. Restart TypeScript server in VS Code
3. The types should now be available

### Error: `Type instantiation is excessively deep`

**Solution:**
- Already fixed by removing `zodToJsonSchema` and using manual schemas
- If still seeing this, restart TS server

### Error: JWT sign method type errors

**Solution:**
- Already fixed by casting `config.JWT_SECRET as jwt.Secret`
- Restart TS server to clear the error

## Quick Fix (All-in-One)

```bash
cd backend
npx prisma generate
# Then in VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## Why These Errors Happen

- **Prisma types**: Generated dynamically, IDE needs to reload
- **Type depth**: Complex nested types from zod-to-json-schema
- **JWT types**: String vs Secret type mismatch

All these have been fixed in the code. The red squiggles are just the IDE cache - restarting the TS server will clear them!
