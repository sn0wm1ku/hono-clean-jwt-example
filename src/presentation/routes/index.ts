import { createFactory } from 'hono/factory'
import type { JwtVariables } from 'hono/jwt'
import type { User } from '../../types/user'

// Import route creators (Hono factory pattern best practice)
import { createSystemRoutes } from './system-routes'
import { createAuthRoutes } from './auth-routes'
import { createUserRoutes } from './user-routes'

// Types
import type { loginUseCase } from '../../application/login-use-case'
import type { verifyTokenUseCase } from '../../application/verify-token-use-case'
import type { UserRepository } from '../../domain/interfaces'

// Pure functional router composition with factory pattern (Hono best practice)
export const createRouter = (
  login: ReturnType<typeof loginUseCase>,
  verifyToken: ReturnType<typeof verifyTokenUseCase>,
  userRepository: UserRepository,
  jwtSecret: string
) => {
  // Main Hono app instance with factory
  type Variables = JwtVariables<User>
  const factory = createFactory<{ Variables: Variables }>()
  const app = factory.createApp()

  // Create separate route instances using factory pattern
  const systemRoutes = createSystemRoutes()
  const authRoutes = createAuthRoutes(login, verifyToken, jwtSecret)
  const userRoutes = createUserRoutes(userRepository, jwtSecret)

  // Mount routes using app.route() (Hono official recommendation)
  app.route('/', systemRoutes)      // System routes at root
  app.route('/auth', authRoutes)    // Auth routes under /auth
  app.route('/user', userRoutes)    // User routes under /user

  return app
}
