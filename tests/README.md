# Testing Guide

This document outlines the testing conventions and setup for the Inventory POS system.

## Test Environment Setup

The testing environment uses:
- **Jest** as the test runner
- **ts-jest** for TypeScript support
- **MongoDB Memory Server** for isolated database instances
- **Supertest** for HTTP assertions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in the `tests/` directory following the API route structure:
- `tests/user.test.ts` - User model tests
- `tests/api/auth.test.ts` - Authentication API tests
- `tests/api/products.test.ts` - Product API tests (when implemented)

## Test Utilities

Helper functions are available in `tests/test-utils.ts`:
- `generateTestToken()` - Creates JWT tokens for authenticated requests
- `createMockUser()` - Creates mock user objects
- `createAuthHeaders()` - Creates authorization headers for API requests

## Database Isolation

Each test run uses a fresh MongoDB instance via MongoDB Memory Server:
- Database is automatically connected before all tests
- Collections are cleared between each test
- Database is disconnected after all tests
- No impact on development or production data

## Environment Variables

Tests use isolated environment variables:
- `JWT_SECRET` is set to a test value
- `NODE_ENV` is set to 'test'
- Database URI points to the in-memory MongoDB instance

## Writing Tests

1. Place test files in the appropriate directory under `tests/`
2. Name test files with `.test.ts` extension
3. Use `beforeAll`, `afterAll`, `beforeEach`, `afterEach` for setup/teardown
4. Use the provided test utilities when possible
5. Follow the existing patterns for consistency