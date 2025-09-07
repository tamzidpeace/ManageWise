# Project Context for Qwen Code

## Project Overview

This is a Next.js-based Point of Sale (POS) inventory management system with MongoDB as the database. The application features role-based authentication with admin and cashier roles, and uses modern web technologies for a responsive user experience.

### Key Technologies

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with role-based access control
- **State Management**: Zustand for client-side state
- **Styling**: Tailwind CSS
- **Frontend Libraries**: Shadcn UI
- **Testing**: Custom test scripts with Node.js

### Project Structure

```
src/
├── app/                 # Next.js app router pages and API routes
│   ├── api/            # API routes
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── page.tsx        # Root dashboard page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Library functions (DB connection, auth middleware)
├── models/             # Mongoose data models (Product, User, Category, Brand)
├── schemas/            # Validation schemas (likely Zod)
├── scripts/            # Utility scripts
├── stores/             # Zustand stores (auth store)
├── types/              # TypeScript type definitions
└── utils/              # Utility functions (auth helpers)
tests/                  # Test scripts
```

## Building and Running

### Development

```bash
npm run dev
# Starts the development server with Turbopack
```

### Production

```bash
npm run build
# Builds the application for production

npm run start
# Starts the production server
```

### Testing

```bash
npm run test:db
# Tests database connectivity

npm run test:api
# Tests API endpoints
```

### Code Quality

```bash
npm run lint
# Runs ESLint to check for code issues
```

## Development Conventions

### Code Style

- Uses TypeScript for type safety
- Strict mode enabled in tsconfig.json
- Uses ESLint with Next.js recommended rules
- Uses Prettier for code formatting
- Tailwind CSS for styling with automatic class sorting

### Authentication

- JWT tokens stored in HTTP-only cookies
- Role-based access control (admin/cashier)
- Client-side state managed with Zustand
- Server-side middleware for route protection

### Database

- MongoDB with Mongoose ODM
- Centralized database connection with caching for hot reloads
- Data models for Products, Users, Categories, and Brands
- Environment variable for database URI (MONGODB_URI)

### Routing

- App Router with dynamic routes
- Middleware for authentication and authorization
- Public routes (login, register) and protected routes (/admin, /cashier)
- Automatic redirects based on user role

## Environment Variables

The application requires the following environment variables:

- `MONGODB_URI`: Connection string for MongoDB
- `JWT_SECRET`: Secret key for JWT token signing

These should be defined in a `.env.local` file in the project root.

## Testing

The project includes basic database connectivity tests and API endpoint tests. Tests are written in JavaScript and can be run with the npm scripts defined in package.json.

## instruction

Check latest documentation from [nextjs docs](https://nextjs.org/docs). Don't provide any outdated info. Also we use latest version of all npm packages.
