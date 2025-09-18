# WASCHBÄR Admin Panel - Comprehensive Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Business Domain & Purpose](#business-domain--purpose)
3. [Technical Architecture](#technical-architecture)
4. [Features & Functionality](#features--functionality)
5. [Data Models](#data-models)
6. [API Specifications](#api-specifications)
7. [Backend Requirements](#backend-requirements)
8. [Frontend Architecture](#frontend-architecture)
9. [Development Setup](#development-setup)
10. [Deployment Guide](#deployment-guide)

---

## 🎯 Project Overview

**WASCHBÄR** is a comprehensive multi-tenant SaaS laundry management system designed for student housing providers across the European Union. The platform serves multiple independent clients, each managing their own network of dormitories and laundry facilities. The system provides centralized administration, real-time machine monitoring, user management, and reservation handling through a modern web-based admin panel.

### Key Business Value
- **Multi-tenant SaaS**: Serves multiple independent clients across the EU
- **Scalable Architecture**: Each client manages their own locations and users independently
- **Operational Efficiency**: Streamlined laundry facility management across multiple locations
- **Real-time Monitoring**: Live machine status tracking and maintenance scheduling
- **User Experience**: Simplified booking and notification system for students
- **Analytics**: Comprehensive reporting and usage analytics per client

---

## 🏢 Business Domain & Purpose

### Target Market
- **Primary**: Student housing providers across the European Union
- **Secondary**: University accommodation services (multi-country)
- **Tertiary**: Commercial laundry facility operators
- **Business Model**: Multi-tenant SaaS serving independent clients

### Multi-tenant Architecture
- **Independent Clients**: Each client operates as a separate tenant
- **Data Isolation**: Complete data separation between clients
- **Custom Branding**: Client-specific branding and configuration
- **Scalable Infrastructure**: Support for unlimited clients and locations

### Coverage Areas
The system serves **multiple clients across the European Union**. Each client can operate in one or multiple countries with their own network of locations.

**Example Client (Germany-based)** - Current mock data structure:

| City | Dormitories | Typical Capacity |
|------|-------------|------------------|
| Berlin | 8 dorms | 40-99 students each |
| Munich | 8 dorms | 40-99 students each |
| Hamburg | 8 dorms | 40-99 students each |
| Cologne | 8 dorms | 40-99 students each |
| Frankfurt | 8 dorms | 40-99 students each |
| Stuttgart | 6 dorms | 40-99 students each |
| Düsseldorf | 6 dorms | 40-99 students each |
| Leipzig | 6 dorms | 40-99 students each |
| Dresden | 6 dorms | 40-99 students each |

**Potential EU Markets**:
- **Germany**: Universities and student housing providers
- **France**: CROUS and private student residences
- **Netherlands**: Student housing corporations
- **Austria**: ÖH and university accommodations
- **Belgium**: Student housing providers
- **Other EU Countries**: Expanding market opportunities

### Business Operations
- **Multi-tenant SaaS**: Each client operates independently with their own:
  - Machine inventory (15-34 machines per dormitory typical)
  - User base (varies per client, 40-99 students per dormitory typical)
  - Reservation system with client-specific rules
  - Maintenance schedules and procedures
- **Data Isolation**: Complete separation between clients
- **Client Management**: Onboarding, configuration, and support per client
- **Scalability**: Support for clients of all sizes across the EU

---

## 🏗️ Technical Architecture

### Tech Stack

#### Frontend (Current Project)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React hooks + local state
- **Charts**: Recharts
- **Notifications**: Sonner
- **Icons**: Lucide React

#### Backend Requirements (To Be Implemented)
- **API**: RESTful API with JSON responses
- **Authentication**: JWT-based admin authentication
- **Database**: Relational database (PostgreSQL/MySQL recommended)
- **Real-time**: WebSocket support for live machine status
- **File Storage**: Image upload for user profiles and machine documentation
- **Email/SMS**: Notification service integration

### Architecture Patterns
- **Multi-tenant SaaS**: Client-based data isolation with shared infrastructure
- **Tenant Isolation**: Complete data separation between clients
- **Component-based UI**: Modular, reusable React components
- **API-first Design**: Decoupled frontend/backend architecture
- **Scalable Infrastructure**: Horizontal scaling for multiple clients
- **Responsive Design**: Mobile-first approach
- **Progressive Enhancement**: Graceful degradation for older browsers

---

## ✨ Features & Functionality

### 1. Authentication & Security
- **Admin Login**: Secure JWT-based authentication
- **Role-based Access**: Admin privileges with location-specific permissions
- **Session Management**: Automatic logout and token refresh

### 2. Dashboard Overview
- **Real-time Statistics**: Live machine counts, user metrics, and system health
- **Quick Actions**: Rapid access to common administrative tasks
- **Notification Center**: System alerts, maintenance notices, and user issues
- **Multi-location Switching**: Easy navigation between different cities/dorms

### 3. Machine Management
- **Real-time Monitoring**: Live status of all washing machines and dryers
- **Status Tracking**: Available, In Use, Maintenance, Offline states
- **Machine Details**: Model information, cycle counts, last maintenance
- **Maintenance Scheduling**: Proactive maintenance alerts and scheduling
- **Remote Control**: Status updates and basic machine operations

### 4. User Management
- **Student Registration**: Profile approval and verification process
- **User Lifecycle**: Registration → Verification → Active → Suspended states
- **Bulk Operations**: Mass approve, suspend, or export user data
- **Profile Management**: Contact information and location changes
- **Search & Filtering**: Advanced user lookup and filtering options

### 5. Reservation System
- **Booking Management**: View, modify, and cancel user reservations
- **Conflict Resolution**: Handle overlapping bookings and machine unavailability
- **Historical Data**: Complete reservation history and analytics
- **Automated Scheduling**: Smart booking algorithms and queue management

### 6. Profile Requests Management
- **Change Requests**: Handle user requests for location/contact changes
- **Approval Workflow**: Structured approval process with reasoning
- **Audit Trail**: Complete history of profile modifications
- **Bulk Processing**: Efficient handling of multiple requests

### 7. User Queries & Support
- **Ticket System**: Structured support request handling
- **Priority Management**: Low/Medium/High priority categorization
- **Response Tracking**: Admin responses and resolution status
- **Communication Log**: Complete conversation history

### 8. Analytics & Reporting
- **Usage Statistics**: Machine utilization and peak hour analysis
- **User Analytics**: Registration trends and activity patterns
- **Operational Metrics**: Maintenance schedules and system performance
- **Location Comparison**: Cross-location performance analysis

### 9. System Administration
- **Client Management**: Onboard and configure new clients
- **Location Management**: Add/modify cities and dormitories per client
- **Configuration**: Client-specific settings and operational parameters
- **Backup Management**: Per-client data export and backup procedures
- **Audit Logs**: Complete system activity tracking per client
- **Multi-tenant Operations**: Cross-client analytics and system monitoring

---

## 📊 Data Models

### Core Entities

#### Client (Tenant)
```typescript
interface Client {
  id: string;                    // Unique client identifier
  name: string;                  // Client company/organization name
  slug: string;                  // URL-friendly identifier
  country: string;               // Primary operating country
  status: 'active' | 'suspended' | 'trial';
  subscriptionPlan: string;      // Subscription tier
  createdAt: string;             // Registration date (ISO)
  settings: {
    branding?: {
      logo?: string;
      primaryColor?: string;
      companyName?: string;
    };
    features?: {
      advancedAnalytics?: boolean;
      apiAccess?: boolean;
      customIntegrations?: boolean;
    };
  };
}
```

#### Machine
```typescript
interface Machine {
  id: string;                    // Unique identifier (e.g., "W-001", "D-002")
  clientId: string;              // Client tenant identifier
  name: string;                  // Display name
  type: 'washer' | 'dryer';      // Machine type
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  location: string;              // Dormitory name
  dorm: string;                  // Dormitory identifier
  city: string;                  // City name
  currentUser?: string;          // Current user ID if in use
  timeRemaining?: number;        // Minutes remaining in current cycle
  issue?: string;                // Current issue description
  lastMaintenance: string;       // Last maintenance date (ISO)
  totalCycles: number;           // Total completed cycles
  model: string;                 // Machine model/brand
}
```

#### User
```typescript
interface User {
  id: string;                    // Unique user identifier
  clientId: string;              // Client tenant identifier
  name: string;                  // Full name
  email: string;                 // Email address
  phone: string;                 // Phone number
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  city: string;                  // Assigned city
  dorm: string;                  // Assigned dormitory
  registrationDate: string;      // Registration date (ISO)
  lastActive: string;            // Last activity date (ISO)
  totalReservations: number;     // Total bookings made
  studentId: string;             // Student ID number
}
```

#### Reservation
```typescript
interface Reservation {
  id: string;                    // Unique reservation ID
  userId: string;                // User who made the reservation
  userName: string;              // User's display name
  machineId: string;             // Reserved machine ID
  machineName: string;           // Machine display name
  startTime: string;             // Reservation start (ISO)
  endTime: string;               // Reservation end (ISO)
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  city: string;                  // Location city
  dorm: string;                  // Location dormitory
}
```

#### ProfileRequest
```typescript
interface ProfileRequest {
  id: string;                    // Unique request ID
  userId: string;                // Requesting user ID
  userName: string;              // User's display name
  email: string;                 // User's email
  requestType: 'city_change' | 'dorm_change' | 'contact_update';
  currentValue: string;          // Current value
  newValue: string;              // Requested new value
  reason: string;                // User's reason for change
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;           // Submission date (ISO)
  city: string;                  // User's current city
  dorm: string;                  // User's current dormitory
}
```

#### UserQuery
```typescript
interface UserQuery {
  id: string;                    // Unique query ID
  userId: string;                // Querying user ID
  userName: string;              // User's display name
  email: string;                 // User's email
  subject: string;               // Query subject/title
  message: string;               // Query message content
  status: 'open' | 'resolved' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;           // Submission date (ISO)
  resolvedAt?: string;           // Resolution date (ISO)
  adminResponse?: string;        // Admin's response
  city: string;                  // User's city
  dorm: string;                  // User's dormitory
}
```

#### Notification
```typescript
interface Notification {
  id: string;                    // Unique notification ID
  type: 'user_verification' | 'machine_issue' | 'query_submitted' | 'system_alert';
  title: string;                 // Notification title
  message: string;               // Notification content
  timestamp: string;             // Creation time (ISO)
  read: boolean;                 // Read status
  priority: 'low' | 'medium' | 'high';
}
```

### Database Schema Considerations

#### Relationships
- **Clients** are the top-level tenant entities
- **Users** belong to a **Client**, **City** and **Dormitory**
- **Machines** belong to a **Client** and are located in a **Dormitory** within a **City**
- **Reservations** link **Users** and **Machines** within the same **Client**
- **ProfileRequests** and **UserQueries** belong to **Users** within a **Client**
- **Notifications** are client-specific or system-wide
- **All data access** is filtered by client context for complete tenant isolation

#### Indexes Recommended
- User email (unique)
- Machine location + status
- Reservation start/end times
- User city + dorm combination
- Query/Request status + submission date

#### Data Integrity
- Foreign key constraints between entities
- Enum constraints for status fields
- Date validation for reservations (end > start)
- Unique constraints on machine names per location

---

## 🔌 API Specifications

### Authentication Endpoints

#### POST /api/auth/login
**Purpose**: Authenticate admin user  
**Request**:
```json
{
  "email": "admin@waschbar.com",
  "password": "admin123"
}
```
**Response**:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "email": "admin@waschbar.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/logout
**Purpose**: Logout admin user  
**Headers**: `Authorization: Bearer {token}`  
**Response**: `204 No Content`

### Machine Management Endpoints

#### GET /api/machines
**Purpose**: Fetch machines with optional filtering  
**Query Parameters**:
- `city` (optional): Filter by city
- `dorm` (optional): Filter by dormitory
- `status` (optional): Filter by machine status
- `type` (optional): Filter by machine type

**Response**:
```json
[
  {
    "id": "W-001",
    "name": "Washer M-001",
    "type": "washer",
    "status": "available",
    "location": "Studentenwohnheim Adlershof",
    "dorm": "Studentenwohnheim Adlershof",
    "city": "Berlin",
    "lastMaintenance": "2024-01-15",
    "totalCycles": 1247,
    "model": "AquaClean Pro 2000"
  }
]
```

#### GET /api/machines/{id}
**Purpose**: Fetch specific machine details  
**Response**: Single machine object

#### PATCH /api/machines/{id}/status
**Purpose**: Update machine status  
**Request**:
```json
{
  "status": "maintenance",
  "issue": "Door sensor malfunction"
}
```

#### POST /api/machines
**Purpose**: Create new machine  
**Request**:
```json
{
  "name": "Washer M-025",
  "type": "washer",
  "location": "Campus Lodge",
  "dorm": "Campus Lodge",
  "city": "Munich",
  "model": "AquaClean Pro 2000"
}
```

### User Management Endpoints

#### GET /api/users
**Purpose**: Fetch users with filtering  
**Query Parameters**:
- `city`, `dorm`, `status` (optional)
- `page`, `limit` (pagination)
- `search` (name/email search)

#### GET /api/users/{id}
**Purpose**: Fetch specific user details

#### PATCH /api/users/{id}
**Purpose**: Update user information

#### POST /api/users/{id}/approve
**Purpose**: Approve pending user registration

#### POST /api/users/{id}/suspend
**Purpose**: Suspend user account

### Reservation Management Endpoints

#### GET /api/reservations
**Purpose**: Fetch reservations with filtering  
**Query Parameters**:
- `city`, `dorm`, `status` (optional)
- `startDate`, `endDate` (date range)
- `userId`, `machineId` (specific filters)

#### POST /api/reservations
**Purpose**: Create new reservation

#### PATCH /api/reservations/{id}
**Purpose**: Update reservation (cancel, modify times)

#### DELETE /api/reservations/{id}
**Purpose**: Cancel reservation

### Profile Requests Endpoints

#### GET /api/profile-requests
**Purpose**: Fetch profile change requests

#### POST /api/profile-requests/{id}/approve
**Purpose**: Approve profile change request

#### POST /api/profile-requests/{id}/reject
**Purpose**: Reject profile change request

### User Queries Endpoints

#### GET /api/queries
**Purpose**: Fetch user support queries

#### PATCH /api/queries/{id}
**Purpose**: Update query status and add admin response

### Notifications Endpoints

#### GET /api/notifications
**Purpose**: Fetch system notifications

#### PATCH /api/notifications/{id}/read
**Purpose**: Mark notification as read

### Analytics Endpoints

#### GET /api/analytics/dashboard
**Purpose**: Fetch dashboard statistics
**Query Parameters**: `city`, `dorm` (location filtering)

#### GET /api/analytics/usage
**Purpose**: Fetch usage analytics
**Query Parameters**: `period` (daily/weekly/monthly), `startDate`, `endDate`

---

## 🖥️ Backend Requirements

### Technical Requirements

#### Core Infrastructure
- **Runtime**: Node.js 18+ or Python 3.9+ or Java 11+
- **Database**: PostgreSQL 13+ (recommended) or MySQL 8+
- **Cache**: Redis for session management and real-time data
- **Message Queue**: For handling async operations (email, notifications)

#### API Requirements
- **RESTful API** with JSON responses
- **Authentication**: JWT-based with refresh tokens
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Standardized error responses
- **Logging**: Structured logging with request tracing
- **Documentation**: OpenAPI/Swagger specification

#### Real-time Features
- **WebSocket Support**: For live machine status updates
- **Server-Sent Events**: For notification delivery
- **Polling Fallback**: For clients without WebSocket support

#### Security Requirements
- **HTTPS Only**: SSL/TLS encryption
- **CORS Configuration**: Proper cross-origin setup
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based protection
- **Password Hashing**: Secure password storage (bcrypt/Argon2)

### Business Logic Implementation

#### Machine Management
- **Status Synchronization**: Real-time machine status updates
- **Maintenance Scheduling**: Automated maintenance reminders
- **Usage Tracking**: Cycle counting and performance metrics
- **Conflict Resolution**: Handle simultaneous status updates

#### Reservation System
- **Booking Validation**: Prevent double-bookings
- **Time Slot Management**: Handle reservation conflicts
- **Automated Cleanup**: Remove expired reservations
- **Notification Integration**: Send booking confirmations

#### User Management
- **Registration Workflow**: Email verification process
- **Profile Validation**: Ensure data integrity
- **Location Management**: Handle user transfers
- **Activity Tracking**: Log user actions

#### Multi-tenant Support
- **Client Isolation**: Complete data separation between clients
- **Tenant Context**: All queries filtered by client context
- **Shared Infrastructure**: Efficient resource utilization across tenants
- **Client Onboarding**: Automated client setup and configuration
- **Billing Integration**: Usage tracking and subscription management
- **Performance Optimization**: Efficient queries across multiple clients
- **Scaling Considerations**: Horizontal scaling for unlimited clients

### External Integrations

#### Notification Services
- **Email**: SMTP or service like SendGrid/Mailgun
- **SMS**: Service like Twilio for urgent notifications
- **Push Notifications**: Mobile app support

#### Monitoring & Analytics
- **Application Monitoring**: Performance tracking
- **Error Tracking**: Error reporting and alerting
- **Usage Analytics**: User behavior tracking
- **Health Checks**: System health monitoring

#### Machine Integration (Future)
- **IoT Connectivity**: Direct machine status integration
- **Remote Control**: Machine operation capabilities
- **Sensor Data**: Temperature, vibration, cycle completion

### Database Design

#### Tables Required
```sql
-- Multi-tenant core tables
CREATE TABLE clients (id, name, slug, country, status, subscription_plan, settings, created_at, updated_at);
CREATE TABLE cities (id, client_id, name, created_at, updated_at);
CREATE TABLE dormitories (id, client_id, name, city_id, created_at, updated_at);
CREATE TABLE machines (id, client_id, name, type, status, dorm_id, model, cycles, last_maintenance);
CREATE TABLE users (id, client_id, name, email, phone, status, dorm_id, student_id, registered_at);
CREATE TABLE reservations (id, client_id, user_id, machine_id, start_time, end_time, status);
CREATE TABLE profile_requests (id, client_id, user_id, request_type, current_value, new_value, status, submitted_at);
CREATE TABLE user_queries (id, client_id, user_id, subject, message, status, priority, submitted_at, resolved_at);
CREATE TABLE notifications (id, client_id, type, title, message, priority, created_at, read_at);
CREATE TABLE admin_users (id, client_id, email, password_hash, role, created_at, last_login);
```

#### Performance Considerations
- **Indexing Strategy**: Optimize common query patterns
- **Partitioning**: Consider date-based partitioning for large tables
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Regular performance reviews

---

## 🎨 Frontend Architecture

### Component Structure

#### Layout Components
- **RootLayout**: Application-wide layout with fonts and providers
- **AdminDashboard**: Main dashboard container with navigation
- **LocationSwitcher**: Multi-tenant location selection

#### Feature Components
- **MachineManagement**: Machine listing, status, and operations
- **UserManagement**: User CRUD operations and approval workflows
- **ReservationManagement**: Booking management and scheduling
- **ProfileRequestsManagement**: Profile change request handling
- **UserQueriesManagement**: Support ticket system
- **NotificationsPanel**: System notifications and alerts

#### UI Components (shadcn/ui)
- **Primitives**: Button, Input, Card, Badge, Avatar, etc.
- **Complex**: DataTable, Charts, Modals, Forms
- **Layout**: Tabs, Accordion, Sidebar, Navigation

### State Management

#### Local State (useState)
- Component-specific data
- Form inputs and validation
- UI state (modals, loading states)

#### Location State
- Selected city and dormitory
- Filters and search parameters
- Dashboard statistics

#### API Integration
- Mock data layer (current)
- Ready for REST API integration
- Error handling and loading states

### Styling Architecture

#### Tailwind CSS v4
- Utility-first approach
- Custom design system
- Responsive design patterns
- Dark mode support

#### Component Styling
- Consistent spacing and typography
- Color scheme management
- Animation and transitions
- Accessibility considerations

---

## 🚀 Development Setup

### Prerequisites
```bash
# Required
Node.js 18.17.0 or later
npm 9.0.0 or later

# Recommended
Git for version control
VS Code with TypeScript extension
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd wasch-baer-web-fe

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=WASCHBÄR Admin Panel
```

### Available Scripts
```bash
# Development
npm run dev              # Start dev server
npm run dev:staging      # Start with staging config
npm run dev:integration  # Start with integration config

# Building
npm run build           # Production build
npm run build:staging   # Staging build
npm run build:prod      # Production build

# Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint errors
npm run type-check     # TypeScript check

# Utilities
npm run clean          # Clean build files
npm run analyze        # Bundle analysis
```

### Development Guidelines

#### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Automatic code formatting
- **File Naming**: kebab-case for files, PascalCase for components

#### Component Guidelines
- **Single Responsibility**: One concern per component
- **Props Interface**: Explicit TypeScript interfaces
- **Error Boundaries**: Graceful error handling
- **Accessibility**: ARIA labels and semantic HTML

#### API Integration
- **Mock First**: Develop with mock data
- **Type Safety**: Full TypeScript coverage
- **Error Handling**: Comprehensive error states
- **Loading States**: User feedback for async operations

---

## 🚀 Deployment Guide

### Environment Setup

#### Staging Deployment
```bash
# Build for staging
npm run build:staging

# Deploy to staging server
./scripts/deploy.sh staging
```

#### Production Deployment
```bash
# Build for production
npm run build:prod

# Deploy to production
./scripts/deploy.sh production
```

### Docker Support
```dockerfile
# Dockerfile included for containerization
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.waschbaer.com
NEXT_PUBLIC_APP_NAME=WASCHBÄR Admin Panel

# Security
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Performance Optimization

#### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Remove unused code
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Google Fonts optimization

#### Runtime Performance
- **Caching Strategy**: Static and dynamic caching
- **CDN Integration**: Static asset delivery
- **Monitoring**: Performance tracking and alerts

### Security Considerations

#### HTTPS Configuration
- SSL certificate setup
- HSTS headers
- Secure cookie configuration

#### Content Security Policy
- XSS protection
- Script source restrictions
- Frame ancestors policy

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Development Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [TypeScript ESLint](https://typescript-eslint.io/)

### Backend Development
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) for token handling

---

**Generated**: September 2025  
**Version**: 1.0.0  
**Project**: WASCHBÄR Multi-tenant SaaS Platform  
**Framework**: Next.js 15 + TypeScript  
**Market**: European Union Student Housing Providers  
**Architecture**: Multi-tenant SaaS with Complete Client Isolation