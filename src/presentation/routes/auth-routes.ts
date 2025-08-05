import { createFactory } from 'hono/factory'
import { validator } from 'hono/validator'
import { loginSchema, tokenVerificationSchema } from '../../types/validation'
import type { LoginRequest, TokenVerificationRequest } from '../../types/validation'
import type { loginUseCase } from '../../application/login-use-case'
import type { verifyTokenUseCase } from '../../application/verify-token-use-case'

// Create auth routes with factory pattern and Zod validation (Hono best practice)
export const createAuthRoutes = (
  login: ReturnType<typeof loginUseCase>,
  verifyToken: ReturnType<typeof verifyTokenUseCase>,
  jwtSecret: string
) => {
  const factory = createFactory()
  const app = factory.createApp()

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

  // Login handler using factory.createHandlers()
  const loginHandlers = factory.createHandlers(
    loginValidator,
    async (c) => {
      try {
        const requestData = c.req.valid('json') as LoginRequest
        const result = await login(requestData, jwtSecret)
        
        if (result.success) {
          return c.json(result.data)
        } else {
          return c.json({ error: result.error }, 401)
        }
      } catch (error) {
        return c.json({ error: 'Login failed' }, 500)
      }
    }
  )

  // Token verification handler using factory.createHandlers()
  const verifyTokenHandlers = factory.createHandlers(
    tokenValidator,
    async (c) => {
      try {
        const requestData = c.req.valid('json') as TokenVerificationRequest
        const result = await verifyToken(requestData, jwtSecret)
        
        if (result.success) {
          return c.json({
            valid: true,
            payload: result.data
          })
        } else {
          return c.json({
            valid: false,
            error: result.error
          }, 401)
        }
      } catch (error) {
        return c.json({
          valid: false,
          error: 'Token verification failed'
        }, 500)
      }
    }
  )

  // Authentication routes with validation
  app.post('/login', ...loginHandlers)
  app.post('/verify-token', ...verifyTokenHandlers)

  return app
}
