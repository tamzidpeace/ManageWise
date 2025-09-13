# Development Roadmap: Inventory & Sales Management System

This document outlines a week-by-week development plan for building the Inventory & Sales Management System. The roadmap is structured to deliver a Minimum Viable Product (MVP) in the first few weeks, followed by enhancements and advanced features.

## Instructions:
 - think that you are a senior react, nodejs, nextjs and mern stack developer.
 - you have a strong understanding of react, nodejs, nextjs and mern stack development.
 - you have a strong understanding of mongodb and mongoose.
 - you have a strong understanding of authentication and authorization.
 - you have a strong understanding of UI design and user experience.
 - you have a strong understanding of responsive design.

## Week 1: Project Setup & Authentication

### Goals:

- Set up the development environment
- Initialize the Next.js project
- Implement basic authentication system
- Create user database schema

### Tasks:

- [x] Initialize Next.js project with TypeScript
  - Run `npx create-next-app@latest` with TypeScript options
  - Configure tsconfig.json for strict mode
  - Set up ESLint and Prettier for code formatting
- [x] Set up project directory structure
  - Create directories for components, pages, lib, styles, etc.
  - Set up CSS framework (Tailwind CSS)
- [x] Set up MongoDB connection with Mongoose
  - connect with local mongodb community edition
  - Install mongoose package
  - Create database connection utility
  - Test database connectivity
- [x] Configure environment variables
  - Create .env.local file
  - Set up MongoDB connection string
  - Configure JWT secret (if using JWT)
  - Add environment variables to .gitignore
- [x] Create basic user database schema
  - Define user model with fields: name, email, passwordHash, role
  - Implement Mongoose schema validation
  - Create model export for use in API routes
- [x] Implement password hashing with bcrypt
  - Install bcryptjs and @types/bcryptjs
  - Create utility functions for hashing and comparing passwords
- [x] Implement user registration API endpoint
  - Create /api/auth/register route
  - Implement input validation
  - Check for existing users
  - Hash password and save user
  - Return success/error response
- [x] Implement user login API endpoint
  - Create /api/auth/login route
  - Validate user credentials
  - Generate JWT token or session (if using NextAuth.js)
- [x] Set up NextAuth.js or JWT-based authentication
  - Choose authentication method (NextAuth.js recommended for Next.js)
  - Configure authentication providers
  - Set up session management
  - Implement protected route middleware
- [x] Create authentication middleware
  - Create middleware to protect API routes
  - Implement role-based access control functions
- [x] Build login/register UI pages
  - Create login page with form
  - Create registration page with form
  - Implement form validation
  - Add client-side error handling
  - Connect forms to API endpoints
- [x] Test authentication flows
  - Test user registration flow
  - Test user login flow
  - Test protected route access
  - Verify role-based access control
- [x] Create two layout. for auth user and not auth user.
  - if user is logged in then he will redirect to authenticated layout. and cannot access non auth layout and vise versa.
  - in the authenticated layout, create a responsive sidebar for menus and sub-menus. and header also.
- [x] Improve sidebar
  - add toggle button to make sidebar make small and large. in small screens only show the icons of the menu. in large screen show icon and name of menu
  - add icon for each menu
  - add active state for selected menu
  - add sub-menus for each menu
  - add collapse/expand functionality for sub-menus
  - use shadcn for ui components
  - If user click on logout button, then a confirmation dialog will appear. After confirmation, the user will be logged out and redirected to the login page.
  - If user click on cancel button, then the confirmation dialog will be closed.
  - If user click on outside of the dialog, then the confirmation dialog will be closed.

### ✅ **Task: Test Environment Setup**  
*Goal: Establish a robust, isolated testing environment for API endpoints following Laravel/Pest style approach*

- [x] Install Testing Dependencies**  
- Install Jest as the primary test runner  
- Install TypeScript support for Jest (ts-jest) and type definitions  
- Verify all testing packages are in `devDependencies`  

- [x] Configure Jest Core Settings**  
- Create `jest.config.js` with Node.js test environment  
- Set up TypeScript preprocessor (ts-jest)  
- Configure test file pattern to target `/tests/**/*.test.ts`  
- Enable sequential test execution to prevent database conflicts (`maxConcurrency: 1`, `maxWorkers: 1`)  
- Define setup file for global test initialization  

- [x] Implement Test Database Isolation**  
- Create `test-db-setup.js` with database connection and cleanup utilities  
- Configure separate MongoDB test database (`inventory-pos-test`)  
- Establish automatic connection to test database before tests  
- Implement collection wipe between tests to prevent data leakage  
- Add graceful shutdown of test database after all tests complete  

- [x] Configure Test Execution Scripts**  
- Add `test:run` script for automated test execution with server management  
- Add `test:sequential` for running all tests sequentially to avoid conflicts  
- Include `test:watch` for continuous development testing  
- Set up `test:coverage` for detailed coverage reports  
- Ensure scripts work with TypeScript compilation  

- [x] Establish Test Directory Structure**  
- Create dedicated `tests/` root directory  
- Create `tests/api/` for API endpoint tests  
- Prepare test file templates matching Laravel/Pest style approach  
- Configure .gitignore to exclude test artifacts  

- [x] Implement Laravel/Pest Style Testing Approach**  
- Create real database testing without mocks  
- Implement actual HTTP requests to API endpoints  
- Set up database isolation with clean state between tests  
- Build reusable test utilities for common operations  

- [x] Validate Core Test Workflow**  
- Verify test database isolation with sample test  
- Confirm sequential test execution prevents conflicts  
- Test error handling in failed API scenarios  
- Validate environment variable isolation  

- [x] Document Testing Conventions**  
- Define naming standards for test files  
- Establish Laravel/Pest style patterns for test organization  
- Document database reset procedures  
- Create contribution guidelines for new tests  

- [x] Integrate with Development Workflow**  
- Configure ESLint rules for test files  
- Add Prettier support for test code formatting  
- Set up automated test script for easy execution  
- Verify compatibility with existing development workflow  

- [x] Create Baseline Test Suite**  
- Write tests for authentication endpoints (login, registration)  
- Implement user management API endpoint tests  
- Add validation for role-based access control  
- Create comprehensive test coverage for core authentication flows

- [x] Add Menu for ACL in sidebar
- it will have two sub menus Users, Roles
- create a starter page for Roles submenu



## Week 2: User Management & Role-Based Access

### Goals:

- Implement user management for administrators
- Create role-based access control system
- Enhance authentication with role support

### Tasks:

- [ ] Extend user schema with role field
  - Add role field with enum values (admin, cashier)
  - Set default role for new users
  - Add validation for role values
- [ ] Implement create user API endpoint (admin only)
  - Create /api/users POST route
  - Add admin authorization check
  - Implement password generation or temporary password
  - Send welcome/credentials to new user (optional)
- [ ] Implement update user API endpoint (admin only)
  - Create /api/users/[id] PUT route
  - Allow role, name, and active status updates
  - Add admin authorization check
- [ ] Implement deactivate user API endpoint (admin only)
  - Create /api/users/[id] DELETE route (soft delete)
  - Add admin authorization check
  - Update user active status instead of removing
- [ ] Create user management dashboard UI (admin only)
  - Design user listing table
  - Add create/edit user forms
  - Implement user search and filtering
  - Add activate/deactivate controls

### ✅ **Task: Implement Dynamic Role-Permission System**  
*Goal: Replace current static role-based system with dynamic permission-based system following Spatie Laravel approach*

- [x] **Design Permission-Based System Architecture**
  - Define dynamic permissions model (view, add, update, delete, etc. for each feature)
  - Create role model that can be assigned multiple permissions
  - Design user-role relationship where users are assigned roles
  - Plan permission-based route protection middleware
  - Design frontend menu rendering based on user permissions

- [x] **Create Database Models and Relationships**
  - Create Permission Mongoose model with fields: name, description, feature
  - Create Role Mongoose model with fields: name, description
  - Implement many-to-many relationship between Roles and Permissions
  - Add indexes for efficient permission lookups

- [x] **Implement Permission Management API**
  - Create /api/permissions CRUD endpoints (admin only)
  - Create /api/roles CRUD endpoints (admin only)
  - Implement assign permissions to roles endpoint
  - Create bulk permission assignment functionality
  - Add permission validation and duplication prevention
  - Add test cases for permissions and roles

- [x] **Implement Role Management API**
  - Implement many-to-many relationship between Users and Roles
  - Create assign roles to users endpoint
  - Implement role validation and duplication prevention
  - Add role-based user listing filter
  - Create role cloning functionality for easier setup
  - write tests

- [ ] **Replace Current Role-Based Middleware**
  - Remove static role checking middleware
  - Create permission-based middleware for route protection
  - Implement permission checking functions (hasPermission, hasAnyPermission, hasAllPermissions)
  - Add wildcard permission support for flexible permission checking
  - Create middleware for both API routes and frontend route protection

- [ ] **Update User Authentication Flow**
  - Modify login to fetch user permissions along with role
  - Update JWT token to include permissions
  - Implement permission caching for performance
  - Add permission refresh mechanism

- [ ] **Implement Permission-Based UI Rendering**
  - Update Sidebar component to render menus based on user permissions
  - Create permission-based component visibility helpers
  - Implement permission-based button/action visibility
  - Add permission-based form field visibility

- [ ] **Migrate Existing Functionality to Permission System**
  - Convert existing role-based checks to permission-based checks
  - Create default permissions for current features (user management, product management, etc.)
  - Assign appropriate permissions to existing admin and cashier roles
  - Migrate frontend menu visibility to permission-based system

- [ ] **Create Permission Management Dashboard UI**
  - Design permissions listing table with search/filter
  - Create role management interface with permission assignment
  - Implement visual permission assignment interface
  - Add permission/role creation and editing forms

- [ ] **Test Permission System**
  - Test permission assignment to roles
  - Test role assignment to users
  - Verify route protection works with permissions
  - Test frontend UI rendering based on permissions
  - Validate permission caching and refresh mechanisms
  - Test edge cases and unauthorized access attempts

- [ ] **Document Permission System**
  - Create permission naming conventions
  - Document permission-based development workflow
  - Add examples for common permission patterns
  - Create migration guide from role-based to permission-based system

## Week 3: Core Product Management

### Goals:

- Implement product CRUD operations
- Create product management UI
- Set up product database schema

### Tasks:

- [x] Design product database schema
  - Define product model with fields: name, category, brand, price, stock, description, image
  - Implement Mongoose schema validation
  - Add timestamps for createdAt/updatedAt
- [ ] Implement create product API endpoint
  - Create /api/products POST route
  - Add input validation and sanitization
  - Implement authorization check (admin only)
  - Save product to database
  - Return success/error response
- [ ] Implement read product API endpoint(s)
  - Create /api/products GET route (list all products)
  - Create /api/products/[id] GET route (single product)
  - Implement pagination for product listing
  - Add search and filter functionality
- [ ] Implement update product API endpoint
  - Create /api/products/[id] PUT route
  - Add input validation
  - Implement authorization check (admin only)
  - Update product in database
  - Return updated product data
- [ ] Implement delete product API endpoint (soft delete)
  - Create /api/products/[id] DELETE route
  - Implement authorization check (admin only)
  - Update product status instead of removing from database
- [ ] Create product management dashboard UI
  - Design admin dashboard layout
  - Create navigation menu for admin features
  - Implement responsive grid layout
- [ ] Build product listing page with search/filter capabilities
  - Create product grid/table view
  - Implement search by name
  - Add category filter
  - Add sorting capabilities
- [ ] Create product detail page
  - Design product detail view
  - Display all product information
  - Add edit/delete buttons (admin only)
- [ ] Implement product form for creation/editing
  - Create reusable product form component
  - Add form validation
  - Implement image upload functionality (optional for MVP)
- [ ] Add client-side validation for product forms
  - Validate required fields
  - Check price and stock number formats
  - Implement real-time validation feedback
- [ ] Test all product CRUD operations
  - Test product creation with valid/invalid data
  - Test product listing and filtering
  - Test product update functionality
  - Test soft delete functionality
  - Verify authorization restrictions

## Week 4: Stock Management & Order Processing

### Goals:

- Implement stock tracking functionality
- Create order processing system
- Build cart functionality

### Tasks:

- [ ] Add stock quantity field to product schema
  - Verify stock field exists in product model
  - Add validation for non-negative numbers
  - Add index for efficient stock queries
- [ ] Implement stock level update mechanisms
  - Create utility functions for stock adjustments
  - Implement stock validation before order processing
  - Add transaction support for stock updates
- [ ] Create low-stock alert system
  - Define low-stock threshold (configurable)
  - Add indicator on product listings
  - Create low-stock report (admin only)
- [ ] Design order database schema
  - Define order model with fields: products, totalAmount, taxAmount, discountAmount, paymentMethod, status, createdBy
  - Implement nested product schema for order items
  - Add timestamps and references to user collection
- [ ] Build shopping cart functionality
  - Create cart context or state management
  - Implement add/remove items from cart
  - Add quantity adjustment controls
  - Calculate subtotal, tax, and total
- [ ] Implement create order API endpoint
  - Create /api/orders POST route
  - Validate cart items and stock availability
  - Calculate order totals (with tax/discounts)
  - Save order to database
  - Return order confirmation
- [ ] Implement automatic stock deduction on order creation
  - Update product stock levels during order creation
  - Handle insufficient stock scenarios
  - Add stock update to database transaction
- [ ] Create order management dashboard UI
  - Design order listing page
  - Create order detail view
  - Add status filtering options
- [ ] Build order creation interface
  - Create point-of-sale interface for cashiers
  - Implement product search for quick adding
  - Add payment method selection
- [ ] Implement order status management
  - Define order statuses (pending, completed, cancelled, refunded)
  - Create API endpoints for status updates (admin only)
  - Add status change validation
- [ ] Test stock updates and order processing
  - Test stock deduction logic
  - Test low-stock alerts
  - Test order creation with various scenarios
  - Test insufficient stock handling
  - Verify order status transitions

## Week 5: Reporting & Analytics

### Goals:

- Implement sales reporting functionality
- Create dashboard with key metrics
- Add report export capabilities

### Tasks:

- [ ] Design reporting aggregation logic
  - Define report data structure
  - Create aggregation pipelines for MongoDB
  - Identify key metrics (revenue, items sold, etc.)
- [ ] Implement sales report API endpoints
  - Create /api/reports/sales GET route
  - Add query parameters for filtering
  - Implement data aggregation logic
- [ ] Create date range filtering for reports
  - Add date range parameters to API
  - Implement date validation
  - Create date picker UI component
- [ ] Implement cashier and product filtering
  - Add cashier filter to reports API
  - Add product filter to reports API
  - Create filter UI components
- [ ] Build reporting dashboard UI
  - Design report layout and structure
  - Create summary cards for key metrics
  - Implement filter controls
- [ ] Create data visualization components
  - Add charting library (Chart.js or similar)
  - Create sales trend charts
  - Implement top products visualization
- [ ] Implement CSV export functionality
  - Create /api/reports/sales/export CSV route
  - Format data for CSV export
  - Add export button to UI
- [ ] Implement PDF export functionality
  - Create /api/reports/sales/export PDF route
  - Design PDF report template
  - Add PDF export button to UI
- [ ] Add daily/weekly/monthly summary views
  - Implement time period presets
  - Create summary statistics for each period
  - Add quick-select buttons for time periods
- [ ] Test reporting features and exports
  - Test report generation with various filters
  - Verify CSV export format and data
  - Verify PDF export layout and data
  - Test performance with large datasets

## Week 6: UI/UX Enhancements & Testing

### Goals:

- Improve user interface and experience
- Conduct comprehensive testing
- Fix bugs and optimize performance

### Tasks:

- [ ] Implement responsive design for all pages
  - Test on various screen sizes (mobile, tablet, desktop)
  - Adjust layouts for different viewports
  - Optimize touch interactions for mobile
- [ ] Add loading states and error handling
  - Implement loading spinners for API calls
  - Add error messages for failed operations
  - Create global error handling mechanism
- [ ] Improve form validation and user feedback
  - Add real-time validation for forms
  - Implement success/error toasts or notifications
  - Add form submission states (loading, success, error)
- [ ] Optimize database queries
  - Add database indexes for frequently queried fields
  - Optimize aggregation pipelines
  - Implement query caching where appropriate
- [ ] Implement client-side caching where appropriate
  - Add caching for product listings
  - Cache user data to reduce API calls
- [ ] Conduct usability testing with sample users
  - Recruit test users for each role (admin, cashier)
  - Create test scenarios for key workflows
  - Gather feedback on UI/UX
- [ ] Perform security testing
  - Test authentication and authorization
  - Validate input sanitization
  - Check for common vulnerabilities (XSS, CSRF)
- [ ] Optimize page load times
  - Analyze performance with Lighthouse
  - Optimize image sizes and formats
  - Implement code splitting for large components
- [ ] Fix bugs identified during testing
  - Create bug tracking system
  - Prioritize and fix critical issues
  - Test fixes thoroughly
- [ ] Document known issues and limitations
  - Create known issues document
  - Document workarounds for users
  - Plan fixes for future releases

## Week 7: Deployment & Documentation

### Goals:

- Deploy the application to production
- Create user documentation
- Prepare for release

### Tasks:

- [ ] Set up production MongoDB Atlas database
  - Create production database cluster
  - Configure database security and network access
  - Set up database user with appropriate permissions
  - Migrate seed data if necessary
- [ ] Configure Vercel deployment
  - Connect GitHub repository to Vercel
  - Configure environment variables in Vercel
  - Set up custom domain (if applicable)
  - Configure build settings
- [ ] Set up environment variables for production
  - Add production database connection string
  - Configure authentication secrets
  - Set up any third-party API keys
- [ ] Implement logging and monitoring
  - Add logging to API routes
  - Set up error tracking (e.g., Sentry)
  - Implement performance monitoring
- [ ] Create user guide documentation
  - Write admin user guide
  - Write cashier user guide
  - Include screenshots and step-by-step instructions
- [ ] Create API documentation
  - Document all API endpoints
  - Include request/response examples
  - Add authentication requirements
- [ ] Prepare deployment checklist
  - Create pre-deployment checklist
  - Create post-deployment verification steps
  - Document rollback procedures
- [ ] Conduct final testing on production environment
  - Test all user flows in production
  - Verify database connections
  - Test backup and recovery procedures
- [ ] Create backup and recovery procedures
  - Set up automated database backups
  - Document recovery procedures
  - Test backup restoration process
- [ ] Prepare release notes
  - Document all features and fixes
  - Include known issues and limitations
  - Add upgrade instructions if applicable

## Week 8: Future Enhancements Planning

### Goals:

- Plan future feature enhancements
- Gather user feedback
- Prepare for next development cycle

### Tasks:

- [ ] Collect feedback from initial users
  - Create user feedback survey
  - Conduct interviews with key users
  - Analyze support requests and common issues
- [ ] Analyze system performance metrics
  - Review usage analytics
  - Analyze database performance
  - Identify bottlenecks and optimization opportunities
- [ ] Identify areas for improvement
  - Document feature requests
  - Identify usability issues
  - Note technical debt for future sprints
- [ ] Prioritize future enhancements
  - Categorize enhancements by impact and effort
  - Create priority ranking for features
  - Estimate development effort for each item
- [ ] Create roadmap for version 2.0
  - Define goals for next major release
  - Set timeline and milestones
  - Allocate resources for development
- [ ] Research barcode scanner integration
  - Investigate available libraries and APIs
  - Identify hardware requirements
  - Create proof of concept implementation
- [ ] Explore multi-branch support requirements
  - Define data model changes for multi-branch
  - Identify UI/UX changes needed
  - Plan for separate inventory tracking
- [ ] Investigate supplier management features
  - Define supplier data model
  - Plan purchase order workflow
  - Design supplier dashboard
- [ ] Plan customer relationship management features
  - Define customer data model
  - Plan customer history tracking
  - Design customer loyalty features
- [ ] Document lessons learned
  - Document technical challenges and solutions
  - Record best practices for future projects
  - Create team retrospective document

---

## Milestones

### MVP Release (End of Week 5):

- User authentication and authorization
- Product management (CRUD)
- Stock tracking
- Basic order processing
- Role-based access control

### Beta Release (End of Week 7):

- Complete feature set as defined in SRS
- Full reporting capabilities
- Production deployment
- User documentation

## Success Criteria

By following this roadmap, the Inventory & Sales Management System will:

1. Provide a complete MVP within 5 weeks
2. Deliver a production-ready application within 7 weeks
3. Include comprehensive documentation
4. Support both administrator and cashier roles
5. Implement all core functionality outlined in the SRS

## Risk Mitigation

Potential risks and mitigation strategies:

- **Scope creep**: Stick to MVP features in first 5 weeks, defer enhancements to future releases
- **Performance issues**: Implement database indexing and query optimization early
- **Security vulnerabilities**: Conduct regular security reviews and follow best practices
- **Deployment challenges**: Use staging environment for testing before production deployment
- **User adoption**: Include usability testing and gather feedback throughout development
