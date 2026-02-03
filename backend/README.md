# Ambrane Billing System - Backend

Production-ready restaurant billing system backend built with Fastify, TypeScript, PostgreSQL, and Redis.

## 🚀 Features

- ✅ **Fastify** - High-performance Node.js framework
- ✅ **TypeScript** - Type-safe development
- ✅ **PostgreSQL + Prisma** - Robust database with type-safe ORM
- ✅ **Redis** - Caching and session management
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Repository Pattern** - Clean architecture with DTOs, Mappers, Services
- ✅ **Zod Validation** - Runtime type validation
- ✅ **Swagger Documentation** - Auto-generated API docs
- ✅ **Docker Support** - Easy local development

## 📁 Project Structure

```
src/
├── config/          # Configuration files
├── modules/         # Feature modules (Auth, Orders, etc.)
│   └── auth/
│       ├── dtos/           # Data Transfer Objects
│       ├── entities/       # Database entities
│       ├── mappers/        # Entity ↔ DTO conversion
│       ├── repositories/   # Data access layer
│       ├── services/       # Business logic
│       ├── controllers/    # Request handlers
│       └── routes/         # Route definitions
├── common/          # Shared utilities
├── database/        # Prisma schema and migrations
├── app.ts          # Fastify app setup
└── server.ts       # Server entry point
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose (for local development)
- PostgreSQL 14+ (if not using Docker)
- Redis 7+ (if not using Docker)

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start databases with Docker:**
   ```bash
   docker-compose up -d
   ```

5. **Run Prisma migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

7. **Start development server:**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3001`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:3001/docs
- **Health Check:** http://localhost:3001/health

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT secret key (min 32 chars) | - |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

## 🧪 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:migrate    # Run database migrations
npm run prisma:generate   # Generate Prisma client
npm run prisma:studio     # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🏗️ Architecture

### Layered Architecture

```
Routes → Controllers → Services → Repositories → Database
```

### Key Patterns

1. **Repository Pattern** - Separates data access logic
2. **DTO Pattern** - Clear API contracts
3. **Mapper Pattern** - Entity ↔ DTO conversion
4. **Service Layer** - Business logic isolation

### Example Flow

```typescript
// 1. Route receives request
POST /api/auth/login

// 2. Controller validates and calls service
AuthController.login() 
  → validates LoginRequestDTO

// 3. Service contains business logic
AuthService.login()
  → checks credentials
  → generates tokens

// 4. Repository handles data access
UserRepository.findByEmail()
  → queries database

// 5. Mapper converts to DTO
UserMapper.toResponseDTO()
  → returns UserResponseDTO

// 6. Controller sends response
AuthResponseDTO with tokens
```

## 🔐 Authentication

The API uses JWT-based authentication:

1. **Register/Login** - Get access & refresh tokens
2. **Protected Routes** - Send token in `Authorization: Bearer <token>`
3. **Token Refresh** - Use refresh token to get new access token

## 📊 Database Schema

Key models:
- **User** - System users (admin, staff, waiters)
- **Restaurant** - Restaurant/outlet information
- **Table** - Table management
- **MenuItem** - Menu items
- **Order** - Customer orders
- **Customer** - Customer information & loyalty
- **Payment** - Payment transactions
- **Inventory** - Stock management

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Deployment

```bash
docker-compose up -d
```

## 📝 Adding New Modules

To add a new feature module (e.g., `inventory`):

1. Create module structure:
   ```bash
   mkdir -p src/modules/inventory/{dtos/request,dtos/response,entities,mappers,repositories,services,controllers,routes}
   ```

2. Create files following the auth module pattern:
   - DTOs for request/response
   - Repository for data access
   - Mapper for entity ↔ DTO
   - Service for business logic
   - Controller for request handling
   - Routes for API endpoints

3. Register routes in `src/app.ts`

## 🤝 Contributing

1. Follow the existing code structure
2. Use TypeScript strictly
3. Add Zod validation for all inputs
4. Write clean, documented code
5. Test your changes

## 📄 License

MIT
