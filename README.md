# Finance Dashboard Backend

A RESTful backend API for a finance dashboard system supporting role-based access control, financial record management, and aggregated summary analytics.

## Tech Stack

| Layer | Choice |
|---|---|
| Language | Node.js (TypeScript) |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (JSON Web Tokens) |
| Validation | Zod |
| Testing | Jest + Supertest |
| Docs | Swagger (auto-generated) |

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)

### Option 1: Docker (Recommended)

```bash
docker-compose up -d
npx prisma migrate dev --name init
npm run seed
```

### Option 2: Local Setup

1. **Clone & install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection string
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`.
Swagger docs at `http://localhost:3000/api-docs`.

## Default Seed Users

| Name | Email | Role | Password |
|---|---|---|---|
| Admin User | admin@finance.dev | ADMIN | admin123 |
| Alice Analyst | alice@finance.dev | ANALYST | analyst123 |
| Victor Viewer | victor@finance.dev | VIEWER | viewer123 |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `JWT_EXPIRES_IN` | Token expiry duration | `24h` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current user info |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |

### Financial Records
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/records` | List records (filterable) | All roles |
| GET | `/api/records/:id` | Get single record | All roles |
| POST | `/api/records` | Create record | Admin |
| PATCH | `/api/records/:id` | Update record | Admin |
| DELETE | `/api/records/:id` | Soft delete record | Admin |

**Filters for GET /api/records:** `type`, `category`, `from`, `to`, `search`, `page`, `limit`

### Dashboard
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Income, expenses, net balance | All roles |
| GET | `/api/dashboard/by-category` | Category breakdown | Analyst, Admin |
| GET | `/api/dashboard/trends` | Monthly/weekly trends | Analyst, Admin |
| GET | `/api/dashboard/recent` | Last N records | All roles |

## Role Permissions

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| Login & view profile | ✅ | ✅ | ✅ |
| List/filter records | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View category/trend insights | ❌ | ✅ | ✅ |
| Create/update/delete records | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run seed` | Seed the database |
| `npm run migrate` | Run Prisma migrations |
| `npm test` | Run test suite |
| `npm run studio` | Open Prisma Studio |

## API Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You do not have permission to perform this action"
}
```

## Project Structure

```
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
├── src/
│   ├── config/                 # Environment & Prisma config
│   ├── middlewares/            # Auth, role, error, validation
│   ├── modules/
│   │   ├── auth/               # Register, login, /me
│   │   ├── users/              # User CRUD (admin)
│   │   ├── records/            # Financial records CRUD
│   │   └── dashboard/          # Analytics & summaries
│   ├── utils/                  # Response, pagination, date helpers
│   ├── types/                  # TypeScript declarations
│   └── app.ts                  # Express app setup
├── tests/                      # Integration tests
├── docker-compose.yml          # PostgreSQL + app
└── README.md
```

## License

ISC
# finance-dashboard
