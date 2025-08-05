import { createFactory } from 'hono/factory'
import { validator } from 'hono/validator'
import { loginSchema, tokenVerificationSchema } from '../../types/validation'
import type { LoginRequest, TokenVerificationRequest } from '../../types/validation'
import type { loginUseCase } from '../../application/login-use-case'
import type { verifyTokenUseCase } from '../../application/verify-token-use-case'
import { createAuthController } from '../controllers/auth-controller'

// Create auth routes with factory pattern and Zod validation (Hono best practice)
export const createAuthRoutes = (
  login: ReturnType<typeof loginUseCase>,
  verifyToken: ReturnType<typeof verifyTokenUseCase>,
  jwtSecret: string
) => {
  const factory = createFactory()
  const app = factory.createApp()

  // Create controller instance with dependency injection
  const authController = createAuthController(login, verifyToken, jwtSecret)

  // Login validation middleware
  const loginValidator = validator('json', (value, c) => {
    const parsed = loginSchema.safeParse(value)
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400)
    }
    return parsed.data
  })

  // Token verification validation middleware
  const tokenValidator = validator('json', (value, c) => {
    const parsed = tokenVerificationSchema.safeParse(value)
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      }, 400)
    }
    return parsed.data
  })

  // Login handler using factory.createHandlers() with controller
  const loginHandlers = factory.createHandlers(
    loginValidator,
    authController.login
  )

  // Token verification handler using factory.createHandlers() with controller
  const verifyTokenHandlers = factory.createHandlers(
    tokenValidator,
    authController.verifyToken
  )

  // Authentication routes with validation
  app.post('/login', ...loginHandlers)
  app.post('/verify-token', ...verifyTokenHandlers)
  
  // Logout handler using controller
  const logoutHandlers = factory.createHandlers(authController.logout)
  app.post('/logout', ...logoutHandlers)

  return app
}
