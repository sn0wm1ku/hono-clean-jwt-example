import { createFactory } from 'hono/factory'
import { jwt } from 'hono/jwt'
import type { JwtVariables } from 'hono/jwt'
import type { User } from '../../types/user'
import type { UserRepository } from '../../domain/interfaces'

// Create user routes with factory pattern (Hono best practice)
export const createUserRoutes = (
  userRepository: UserRepository,
  jwtSecret: string
) => {
  // Define environment type for JWT variables
  type Env = {
    Variables: JwtVariables<User>
  }
  
  const factory = createFactory<Env>()
  const app = factory.createApp()

  // Apply JWT middleware to all user routes (they're all protected)
  app.use('*', jwt({ secret: jwtSecret }))

  // Protected endpoint handler using factory.createHandlers()
  const getProtectedHandlers = factory.createHandlers(async (c) => {
    const payload = c.get('jwtPayload')
    return c.json({
      message: 'This is a protected endpoint',
      user: payload,
      timestamp: new Date().toISOString()
    })
  })

  // Profile endpoint handler using factory.createHandlers()
  const getProfileHandlers = factory.createHandlers(async (c) => {
    const payload = c.get('jwtPayload') as User
    const user = await userRepository.findById(payload.id)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      id: user.id,
      username: user.username,
      profile: {
        lastLogin: new Date().toISOString(),
        role: user.id === 1 ? 'administrator' : 'user'
      }
    })
  })

  // Protected user routes
  app.get('/protected', ...getProtectedHandlers)
  app.get('/profile', ...getProfileHandlers)

  return app
}
