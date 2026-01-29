# Frontend
### url-shortner'frontend will be built using ReactJS Soon...!


# Backend - Overview

This is a **URL Shortener Backend API** built with **Express.js**, **TypeScript**, **PostgreSQL**, and **Drizzle ORM**. The server provides functionality for users to create, manage, and retrieve shortened URLs with authentication and authorization.

**Author:** Kirtan Nahar  
**License:** ISC

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture Overview](#architecture-overview)
3. [Database Models](#database-models)
4. [API Routes](#api-routes)
5. [Authentication](#authentication)
6. [Services & Controllers](#services--controllers)
7. [Validation](#validation)
8. [Utilities](#utilities)

---

## Project Setup

### Installation

```bash
npm install
```

### Environment Configuration

Create a `.env` file with the following variables:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
```

### Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm run start        # Run production build
npm run build        # Compile TypeScript to JavaScript
npm run doc.up       # Start Docker containers (PostgreSQL)
npm run doc.dwn      # Stop Docker containers
npm run drz.push     # Push schema changes to database
npm run drz.std      # Open Drizzle Studio (UI for database)
```

### Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js v5.2.1
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod schema validation
- **Hashing:** HMAC SHA-256 with salt
- **ID Generation:** nanoid

---

## Architecture Overview

### Project Structure

```
src/
├── server.ts                 # Main server entry point
├── routes/                   # Route definitions
│   ├── routes.ts            # Route aggregator
│   ├── user.routes.ts       # User authentication routes
│   └── url.routes.ts        # URL shortening routes
├── controllers/              # Business logic handlers
│   ├── user.controller.ts   # User auth controllers
│   └── url.controller.ts    # URL shortening controllers
├── services/                 # Data access layer
│   └── user.service.ts      # User database operations
├── models/                   # Drizzle ORM schemas
│   ├── user.model.ts        # User table schema
│   └── url.model.ts         # URL table schema
├── middleware/               # Express middleware
│   └── auth.middleware.ts   # JWT authentication middleware
├── utils/                    # Utility functions
│   ├── hash.ts              # Password hashing utilities
│   └── token.ts             # JWT token management
├── validation/               # Request validation schemas
│   ├── request.validation.ts # Request body schemas (Zod)
│   └── token.validation.ts  # Token validation schemas
├── types/                    # TypeScript type definitions
│   └── express.d.ts         # Express type augmentations
└── db/                       # Database connection
    └── index.ts             # Database initialization
```

---

## Database Models

### User Table (`users`)

Stores user account information with password security features.

```typescript
{
  id: UUID (Primary Key, Auto-generated)
  firstName: VARCHAR(55) (Required)
  lastName: VARCHAR(55) (Optional)
  email: VARCHAR(100) (Required, Unique)
  password: TEXT (Required, Hashed)
  salt: TEXT (Required, For hashing)
  createdAt: TIMESTAMP (Auto-set)
  updatedAt: TIMESTAMP (Auto-updated)
}
```

**Key Features:**
- Unique email constraint prevents duplicate accounts
- Salt-based password hashing for security
- Automatic timestamps for audit trail

### URL Table (`urls`)

Stores shortened URL mappings linked to users.

```typescript
{
  id: UUID (Primary Key, Auto-generated)
  shortCode: VARCHAR(30) (Required, Unique)
  targetURL: TEXT (Required, Original URL)
  userId: UUID (Foreign Key → users.id, Required)
  createdAt: TIMESTAMP (Auto-set)
  updatedAt: TIMESTAMP (Auto-updated)
}
```

**Key Features:**
- Foreign key relationship ensures URLs belong to authenticated users
- Unique short codes prevent duplicates
- Automatic tracking of creation and modification times

---

## API Routes

### Base URL

```
http://localhost:3000
```

### Health Check Routes

#### 1. **Health Check Endpoint**

```
GET /
```

**Description:** Verify that the server is running and routes are operational.

**Response:**
```json
[
  "All route are working fine",
  { "routeInfo": "/info" }
]
```

#### 2. **API Information Endpoint**

```
GET /info
```

**Description:** Get list of all available routes and their endpoints.

**Response:**
```json
[
  {
    "main-route": [
      "/user/login",
      "/user/signup",
      "/user/update",
      "/user/delete"
    ]
  },
  {
    "url-route": [
      "/shorten",
      "/codes",
      "/:shortCode",
      "/:id"
    ]
  },
  [
    { "NOTE": "without login you cant use below listed task" },
    {
      "Authenticated-url-Route": [
        "/shorten",
        "/:id",
        "/codes"
      ]
    }
  ]
]
```

---

## User Authentication Routes

### Base Path: `/user`

#### 1. **Sign Up (Create User)**

```
POST /user/signup
```

**Description:** Create a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `firstName`: Required, non-empty string
- `lastName`: Optional
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Success Response (201):**
```json
{
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `400` - Validation error (invalid data format)
- `200` - User already exists with that email

---

#### 2. **Login (Authenticate User)**

```
POST /user/login
```

**Description:** Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, non-empty

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400` - Validation error or incorrect password
- `200` - User with email doesn't exist

---

#### 3. **Update User Profile**

```
PATCH /user/update
```

**Description:** Update user profile information or password. Requires authentication.

**Authorization:** Required (Bearer token)

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

**Validation Rules:**
- `firstName`: Optional, minimum 1 character
- `lastName`: Optional
- `currentPassword`: Optional, but required if `newPassword` is provided, minimum 6 characters
- `newPassword`: Optional, minimum 6 characters

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation error or no fields to update
- `401` - Unauthorized (no token) or incorrect current password
- `404` - User not found

---

#### 4. **Delete User Account**

```
DELETE /user/delete
```

**Description:** Permanently delete user account and all associated data. Requires authentication.

**Authorization:** Required (Bearer token)

**Success Response (200):**
```json
{
  "message": "User deleted successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (no token)
- `404` - User not found
- `500` - Server error during deletion

---

## URL Shortening Routes

### Base Path: `/` (root)

#### 1. **Create Shortened URL**

```
POST /shorten
```

**Description:** Create a new shortened URL. Requires authentication.

**Authorization:** Required (Bearer token)

**Request Body:**
```json
{
  "url": "https://www.example.com/very/long/url/that/needs/shortening",
  "code": "mycode"
}
```

**Validation Rules:**
- `url`: Required, must be valid URL format
- `code`: Optional, if not provided, 6-character code is auto-generated using nanoid

**Success Response (201):**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440000",
  "shortCode": "mycode",
  "targetURL": "https://www.example.com/very/long/url/that/needs/shortening"
}
```

**Error Responses:**
- `400` - Validation error (invalid URL format)
- `401` - Unauthorized (no token)
- `409` - Short code already exists (conflict)
- `500` - Server error

---

#### 2. **Get All URLs (User's Links)**

```
GET /codes
```

**Description:** Retrieve all shortened URLs created by the authenticated user.

**Authorization:** Required (Bearer token)

**Success Response (200):**
```json
{
  "codes": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "shortCode": "mycode",
      "targetURL": "https://www.example.com/very/long/url",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized (no token)

---

#### 3. **Delete Shortened URL**

```
DELETE /:id
```

**Description:** Delete a shortened URL by its ID. User can only delete their own URLs. Requires authentication.

**Authorization:** Required (Bearer token)

**Path Parameters:**
- `id`: UUID of the URL to delete

**Success Response (200):**
```json
{
  "deleted": true,
  "id": "650e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
- `401` - Unauthorized (no token)
- `404` - URL not found or user is not the owner

---

#### 4. **Redirect to Original URL (Public)**

```
GET /:shortCode
```

**Description:** Redirect to the original URL using the short code. This is a **public endpoint** (no authentication required).

**Path Parameters:**
- `shortCode`: The shortened code (e.g., "mycode")

**Success Response (302):**
- Redirects to the original URL stored in the database

**Example:**
```
GET /mycode
→ Redirects to: https://www.example.com/very/long/url/that/needs/shortening
```

**Error Responses:**
- `404` - Invalid short code (URL not found)

---

## Authentication

### JWT Token Flow

1. **User logs in** → Receives JWT token
2. **Token is used** in Authorization header for subsequent requests
3. **Token is validated** by middleware for protected routes

### Using Tokens

Include token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Validation

- Tokens are validated using `JWT_SECRET` environment variable
- Invalid or expired tokens return `401 Unauthorized`
- Missing tokens are allowed but protected routes will reject the request

### Authentication Middleware

Two middleware functions handle authentication:

1. **`authenticationMiddleware`**
   - Applied globally to all routes
   - Extracts token from Authorization header if present
   - Sets `req.user` if valid token is provided
   - Allows request to continue even without token

2. **`ensureAuthenticated`**
   - Applied to protected routes
   - Checks if `req.user` exists
   - Returns `401` if user is not authenticated

---

## Services & Controllers

### User Service (`user.service.ts`)

Database operations for user management:

#### `getUserByEmail(email: string)`
- **Purpose:** Fetch user by email address
- **Returns:** User object or undefined
- **Used by:** Login, signup verification

#### `getUserById(id: string)`
- **Purpose:** Fetch user by ID
- **Returns:** User object or undefined
- **Used by:** Profile updates, user validation

#### `updateUserById(id: string, data: object)`
- **Purpose:** Update user profile or password
- **Returns:** Updated user object
- **Used by:** Profile update endpoint

#### `deleteUserById(id: string)`
- **Purpose:** Delete user account
- **Returns:** Deleted user ID
- **Used by:** Account deletion endpoint

### User Controller (`user.controller.ts`)

Handles user authentication and profile management:

#### `createUser(req, res)`
- **Endpoint:** `POST /user/signup`
- **Logic:**
  1. Validate request body with Zod schema
  2. Check if email already exists
  3. Hash password with salt using HMAC SHA-256
  4. Insert new user into database
  5. Return user ID

#### `login(req, res)`
- **Endpoint:** `POST /user/login`
- **Logic:**
  1. Validate request body
  2. Find user by email
  3. Hash provided password with stored salt
  4. Compare hashes
  5. Generate JWT token if credentials match
  6. Return token

#### `updateUser(req, res)`
- **Endpoint:** `PATCH /user/update`
- **Logic:**
  1. Verify user is authenticated
  2. Validate update request
  3. If password change: verify current password, hash new password
  4. Update user record in database
  5. Return updated user data (without password)

#### `deleteUser(req, res)`
- **Endpoint:** `DELETE /user/delete`
- **Logic:**
  1. Verify user is authenticated
  2. Check if user exists
  3. Delete user and all associated URLs
  4. Return confirmation

### URL Controller (`url.controller.ts`)

Handles URL shortening operations:

#### `shortURL(req, res)`
- **Endpoint:** `POST /shorten`
- **Logic:**
  1. Verify user is authenticated
  2. Validate URL and optional custom code
  3. Generate 6-character code if not provided (using nanoid)
  4. Insert URL mapping into database
  5. Handle duplicate code conflicts (409 error)
  6. Return short code and ID

#### `allURL(req, res)`
- **Endpoint:** `GET /codes`
- **Logic:**
  1. Verify user is authenticated
  2. Query all URLs for authenticated user
  3. Return array of URL objects

#### `deleteURL(req, res)`
- **Endpoint:** `DELETE /:id`
- **Logic:**
  1. Verify user is authenticated
  2. Delete URL if it belongs to authenticated user
  3. Return deleted URL ID or 404 if not found

#### `getURL(req, res)`
- **Endpoint:** `GET /:shortCode`
- **Logic:**
  1. Query database for short code (public, no auth needed)
  2. If found: redirect to target URL (302)
  3. If not found: return 404 error

---

## Validation

### Request Validation (`request.validation.ts`)

Uses **Zod** for schema validation with type safety:

#### `signupPostReqBodySchema`
```typescript
{
  firstName: string (min 1 char, required)
  lastName: string (optional)
  email: string (valid email format, required)
  password: string (min 6 chars, required)
}
```

#### `loginPostReqBodySchema`
```typescript
{
  email: string (valid email, required)
  password: string (min 1 char, required)
}
```

#### `shortenPostRequestBodySchema`
```typescript
{
  url: string (valid URL format, required)
  code: string (optional)
}
```

#### `updateUserReqBodySchema`
```typescript
{
  firstName: string (min 1 char, optional)
  lastName: string (optional)
  currentPassword: string (min 6 chars, optional, required if newPassword provided)
  newPassword: string (min 6 chars, optional)
}
```

### Token Validation (`token.validation.ts`)

Schema for JWT payload validation.

---

## Utilities

### Password Hashing (`utils/hash.ts`)

#### `hashPasswordWithSalt(password: string, userSalt?: string)`

**Purpose:** Generate secure password hash using HMAC SHA-256

**Logic:**
1. If no salt provided: generate 256-byte random salt (hex encoded)
2. Create HMAC hash using SHA-256 algorithm
3. Return both salt and hashed password

**Why two-part hashing:**
- Salt prevents rainbow table attacks
- Each user has unique salt
- Same password produces different hashes for different users

**Example:**
```typescript
const { salt, hashedPass } = hashPasswordWithSalt("myPassword");
// On login with same password and stored salt:
const { hashedPass: checkHash } = hashPasswordWithSalt("myPassword", salt);
// checkHash === previously stored hashedPass → Password is correct
```

### JWT Token Management (`utils/token.ts`)

#### `createUserToken(payload: { id: string })`

**Purpose:** Generate JWT token for authenticated user

**Logic:**
1. Validate payload with schema
2. Sign payload with JWT_SECRET
3. Return token string

**Token expires:** Based on JWT default (no explicit expiry set)

#### `validateUserToken(token: string)`

**Purpose:** Validate JWT token and extract payload

**Logic:**
1. Verify token signature using JWT_SECRET
2. If valid: return payload (user ID)
3. If invalid/expired: return null

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Usage |
|--------|---------|-------|
| `200` | OK | Successful GET, POST, PATCH requests |
| `201` | Created | Successful resource creation |
| `302` | Found | URL redirect (short code resolution) |
| `400` | Bad Request | Validation errors, invalid input |
| `401` | Unauthorized | Missing/invalid authentication token |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate short code |
| `500` | Server Error | Unexpected server errors |

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

For validation errors (Zod):
```json
{
  "error": {
    "fieldName": ["error message"]
  }
}
```

---

## Usage Example

### Complete Flow: Sign Up → Create Shortened URL → Redirect

```bash
# 1. Sign up
curl -X POST http://localhost:3000/user/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "email": "john@example.com",
    "password": "securePass123"
  }'

# Response:
# { "data": { "userId": "abc123..." } }

# 2. Login to get token
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'

# Response:
# { "token": "eyJhbGci..." }

# 3. Create shortened URL (use token)
curl -X POST http://localhost:3000/shorten \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/very/long/url",
    "code": "gh"
  }'

# Response:
# { "id": "def456...", "shortCode": "gh", "targetURL": "..." }

# 4. Use shortened URL (no authentication needed)
curl -L http://localhost:3000/gh

# Response: Redirects to https://github.com/very/long/url
```

---

## Security Features

1. **Password Hashing:** HMAC SHA-256 with unique salt per user
2. **JWT Authentication:** Token-based authentication for protected routes
3. **Input Validation:** Zod schema validation for all user inputs
4. **SQL Injection Prevention:** Drizzle ORM parameterized queries
5. **Email Uniqueness:** Database constraint prevents duplicate accounts
6. **User Isolation:** Users can only access/delete their own URLs
7. **CORS Ready:** Can be configured for specific frontend domains

---

## Environment Variables

```env
PORT                 # Server port (default: 3000)
DATABASE_URL         # PostgreSQL connection string
JWT_SECRET          # Secret key for JWT signing
NODE_ENV            # Environment (development/production)
```

---

## Future Improvements

- [ ] Rate limiting on URL creation
- [ ] Custom domain support for shortened URLs
- [ ] Analytics (click tracking, geolocation)
- [ ] Bulk URL import/export
- [ ] URL expiration/TTL support
- [ ] QR code generation for shortened URLs
- [ ] Admin dashboard
- [ ] Two-factor authentication
- [ ] API documentation with Swagger/OpenAPI

---

## Support & Contribution

For issues or contributions, please refer to the project repository.

**Last Updated:** January 2026
