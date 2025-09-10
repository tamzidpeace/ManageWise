# Inventory & Sales Management System

A comprehensive Point of Sale (POS) and inventory management system built with Next.js 15+, MongoDB, and TypeScript.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (admin/cashier)
- **Product Management**: CRUD operations for products with categories and brands
- **Order Processing**: Create and manage sales orders
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Reporting**: Sales and inventory reports with export capabilities
- **Responsive UI**: Mobile-friendly interface with collapsible sidebar

## Tech Stack

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with HTTP-only cookies
- **State Management**: Zustand for client-side state
- **UI Components**: shadcn/ui components with Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Community Edition
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd inventory-pos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/inventory-pos
   JWT_SECRET=your-secret-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js app router pages and API routes
│   ├── api/            # API routes
│   ├── authenticated/  # Authenticated pages
│   ├── login/          # Login page
│   └── register/       # Registration page
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Library functions (DB connection, auth middleware)
├── models/             # Mongoose data models (Product, User, Category, Brand)
├── schemas/            # Validation schemas
├── stores/             # Zustand stores (auth store)
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions (auth helpers)
```

## Development Roadmap

See [DEVELOPMENT_ROADMAP.md](docs/DEVELOPMENT_ROADMAP.md) for the complete development plan.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run test:db` - Test database connectivity
- `npm run test:api` - Test API endpoints
- `npm run test:run` - Run integration tests with proper database setup

## Testing

This project uses integration tests that follow a Laravel/Pest style approach:

- Tests use a real MongoDB instance (not mocks)
- Tests make actual HTTP requests to API endpoints
- Each test runs with a clean database state
- Tests require the test database to be set up

### Running Tests

To run tests, use the provided script which automatically:
1. Starts the Next.js server with the test database
2. Runs the tests
3. Stops the server when done

```bash
npm run test:run
```

You can also run specific test files:
```bash
npm run test:run auth
npm run test:run users
```

Note: Tests should be run individually or sequentially to avoid database conflicts when multiple test suites access the same database concurrently.

## Authentication

The system supports two user roles:
- **Admin**: Full access to all features
- **Cashier**: Limited access for order processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.