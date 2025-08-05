# Hono JWT Authentication Demo - Clean Architecture

A sample authentication demo using Hono framework with JWT tokens, implemented with **Clean Architecture**, **Separation of Concerns**, **Pure Functional Programming**, and **Factory Pattern** following official Hono best practices.

## Features

- 🔐 JWT-based authentication using Hono's built-in JWT middleware
- 🛡️ Protected routes with middleware
- 🎨 Separate HTML, CSS, and JavaScript files
- 🏗️ Clean Architecture with layered separation
- 🔧 Pure functional programming approach
- 🏭 Hono Factory Pattern for better type inference
- ✅ Zod validation for type-safe request handling
- 📝 Full TypeScript support with strict typing
- 🎯 Dependency injection with pure functions
- 🔗 Multiple Hono instances with `app.route()` (official best practice)

## Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── application/              # Application layer (use cases)
│   ├── login-use-case.ts
│   └── verify-token-use-case.ts
├── domain/                   # Domain layer (business logic & entities)
│   ├── interfaces.ts
│   └── user-data.ts
├── infrastructure/           # Infrastructure layer (external dependencies)
│   ├── password-service.ts
│   ├── token-service.ts
│   └── user-repository.ts
├── presentation/             # Presentation layer (routes & handlers)
│   └── routes/
│       ├── auth-routes.ts    # Authentication routes with factory pattern
│       ├── user-routes.ts    # Protected user routes
│       ├── system-routes.ts  # System routes (health, static files)
│       └── index.ts          # Main router composition
├── types/                    # Type definitions
│   ├── config.ts
│   ├── result.ts
│   ├── user.ts
│   └── validation.ts         # Zod validation schemas
└── index.ts                  # Entry point & dependency composition

public/                       # Static files served separately
├── index.html
├── styles.css
└── app.js
```

### Hono Best Practices Implementation

This project follows **official Hono best practices**:

- **Factory Pattern**: Using `createFactory()` for better type inference
- **Separate Hono Instances**: Each route group has its own Hono instance
- **Route Mounting**: Using `app.route()` to mount route groups
- **Validation**: Built-in Hono validator with Zod schemas
- **Type Safety**: Full TypeScript integration with proper typing

### Functional Programming Approach

- **Pure Functions**: All business logic is implemented as pure functions
- **Immutability**: Data structures are treated as immutable with `readonly` properties
- **No Classes**: Functions and composition instead of OOP
- **Dependency Injection**: Through function composition and higher-order functions
- **Factory Pattern**: Hono's factory pattern for type-safe handler creation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:9527`

## Demo Credentials

- **Username**: `admin` or `user`
- **Password**: `password`

## API Endpoints

### Public Routes

- `GET /` - Redirects to static HTML page  
- `GET /health` - Health check
- `GET /static/*` - Static file serving

### Authentication Routes (under `/auth`)

- `POST /auth/login` - Login endpoint with Zod validation
- `POST /auth/verify-token` - Token verification with Zod validation

### Protected Routes (under `/user`)

- `GET /user/protected` - Protected route (requires JWT)
- `GET /user/profile` - User profile (requires JWT)

## Hono Factory Pattern Examples

### Route Creation with Factory
```typescript
// Create routes with factory pattern for better type inference
export const createAuthRoutes = (
  login: ReturnType<typeof loginUseCase>,
  verifyToken: ReturnType<typeof verifyTokenUseCase>,
  jwtSecret: string
) => {
  const factory = createFactory()
  const app = factory.createApp()
  
  // Validation middleware with Zod
  const loginValidator = validator('json', (value, c) => {
    const parsed = loginSchema.safeParse(value)
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400)
    }
    return parsed.data
  })
  
  // Handler with factory pattern
  const loginHandlers = factory.createHandlers(
    loginValidator,
    async (c) => {
      const requestData = c.req.valid('json') as LoginRequest
      const result = await login(requestData, jwtSecret)
      return result.success ? c.json(result.data) : c.json({ error: result.error }, 401)
    }
  )
  
  app.post('/login', ...loginHandlers)
  return app
}
```

### Route Mounting with app.route()
```typescript
// Main router composition following Hono best practices
export const createRouter = (login, verifyToken, userRepository, jwtSecret) => {
  const factory = createFactory<{ Variables: JwtVariables<User> }>()
  const app = factory.createApp()

  // Create separate route instances
  const systemRoutes = createSystemRoutes()
  const authRoutes = createAuthRoutes(login, verifyToken, jwtSecret)
  const userRoutes = createUserRoutes(userRepository, jwtSecret)

  // Mount routes using app.route() - official Hono best practice
  app.route('/', systemRoutes)      // System routes at root
  app.route('/auth', authRoutes)    // Auth routes under /auth
  app.route('/user', userRoutes)    // User routes under /user

  return app
}
```

### Zod Validation Schemas
```typescript
// Type-safe validation with Zod
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Automatic type inference
export type LoginRequest = z.infer<typeof loginSchema>
```

## Example API Calls

### Login with Validation
```bash
# Valid login
curl -X POST http://localhost:9527/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Invalid input (shows Zod validation)
curl -X POST http://localhost:9527/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"","password":"123"}'
# Response: {"error":"Validation failed","details":[...]}
```

### Access Protected Routes
```bash
# Get user profile
curl -X GET http://localhost:9527/user/profile \
  -H "Authorization: Bearer <your-jwt-token>"

# Access protected endpoint
curl -X GET http://localhost:9527/user/protected \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Token Verification
```bash
curl -X POST http://localhost:9527/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token":"<your-jwt-token>"}'
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Clean Architecture Benefits

1. **Separation of Concerns**: Each layer has a single responsibility
2. **Dependency Inversion**: High-level modules don't depend on low-level modules
3. **Testability**: Pure functions are easy to test in isolation
4. **Maintainability**: Changes in one layer don't affect others
5. **Scalability**: Easy to add new features without breaking existing code

## Hono Best Practices Benefits

1. **Type Safety**: Factory pattern provides excellent TypeScript inference
2. **Modular Routes**: Separate Hono instances for different route groups
3. **Clean Mounting**: Using `app.route()` for organized route structure
4. **Validation**: Built-in validator with Zod for type-safe request handling
5. **Performance**: Efficient route organization and middleware application

## Pure Functional Benefits

1. **Predictability**: Pure functions always return the same output for the same input
2. **Immutability**: No side effects or mutation of state
3. **Composability**: Functions can be easily composed together
4. **Testability**: No mocking required for pure functions
5. **Concurrency**: Safe for concurrent execution

## Security Notes

This is a demo project. For production use:

- Use environment variables for JWT secrets
- Use a proper database instead of in-memory storage
- Implement rate limiting
- Add input validation and sanitization (✅ partially implemented with Zod)
- Use HTTPS
- Implement proper error handling
- Add comprehensive logging
- Add request/response validation middleware
- Implement proper CORS configuration

## Architecture Decisions

### Why Factory Pattern?
- **Better Type Inference**: Hono's factory pattern provides superior TypeScript support
- **Consistent Typing**: Avoid repetitive type declarations across route handlers
- **Official Best Practice**: Recommended by Hono documentation for larger applications

### Why Separate Route Instances?
- **Modular Organization**: Each feature has its own route group
- **Middleware Isolation**: Apply middleware only where needed (e.g., JWT on user routes only)
- **Scalability**: Easy to add new route groups without affecting existing ones

### Why Zod + Hono Validator?
- **Runtime Safety**: Validates data at runtime, not just compile time
- **Better Error Messages**: Detailed validation errors for debugging
- **Schema-First**: Define once, use everywhere with type inference
- **Future Proof**: Easy to extend with complex validation rules

### Why Clean Architecture?
- **Testability**: Business logic separated from framework concerns
- **Maintainability**: Clear boundaries between layers
- **Framework Independence**: Could easily switch from Hono to another framework
- **Scalability**: Easy to add features without breaking existing code

## Project Structure Explanation

```
├── domain/           → Core business logic (entities, interfaces)
├── application/      → Use cases (business operations)
├── infrastructure/   → External concerns (password hashing, JWT, data)
├── presentation/     → HTTP layer (routes, validation, handlers)
└── types/           → Shared type definitions and schemas
```

This structure ensures that:
- **Domain** contains pure business logic with no external dependencies
- **Application** orchestrates business operations
- **Infrastructure** handles technical concerns
- **Presentation** deals with HTTP-specific concerns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the existing patterns:
   - Use factory pattern for new routes
   - Add Zod validation for new endpoints
   - Maintain pure functional approach
   - Keep Clean Architecture layer separation
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Technologies Used

- [Hono](https://hono.dev/) - Fast web framework following best practices
- [Hono Factory](https://hono.dev/docs/helpers/factory) - Factory pattern for better type inference
- [Hono JWT](https://hono.dev/middleware/builtin/jwt) - Built-in JWT middleware
- [Hono Validator](https://hono.dev/docs/guides/validation) - Built-in validation middleware
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [TypeScript](https://www.typescriptlang.org/) - Type safety with strict configuration

---

Made with ❤️ for Hong Kong films
