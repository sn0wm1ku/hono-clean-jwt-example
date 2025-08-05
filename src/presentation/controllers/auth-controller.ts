import type { Context } from 'hono'
import type { LoginRequest, TokenVerificationRequest } from '../../types/validation'
import type { loginUseCase } from '../../application/login-use-case'
import type { verifyTokenUseCase } from '../../application/verify-token-use-case'

// Pure functional controllers
export const createAuthController = (
  login: ReturnType<typeof loginUseCase>,
  verifyToken: ReturnType<typeof verifyTokenUseCase>,
  jwtSecret: string
) => ({
  login: async (c: Context) => {
    try {
      const requestData: LoginRequest = await c.req.json()
      const result = await login(requestData, jwtSecret)
      
      if (result.success) {
        // Set JWT in HttpOnly cookie for security
        const cookieOptions = [
          `jwt=${result.data.token}`,
          'HttpOnly',
          'Secure', 
          'SameSite=Strict',
          'Path=/',
          'Max-Age=3600' // 1 hour
        ].join('; ')
        
        c.header('Set-Cookie', cookieOptions)
        
        // Return success without token in body
        return c.json({
          message: result.data.message,
          user: result.data.user
        })
      } else {
        return c.json({ error: result.error }, 401)
      }
    } catch (error) {
      return c.json({ error: 'Login failed' }, 500)
    }
  },

  verifyToken: async (c: Context) => {
    try {
      const requestData: TokenVerificationRequest = await c.req.json()
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
  },

  logout: async (c: Context) => {
    // Clear the JWT cookie
    c.header('Set-Cookie', 'jwt=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0')
    return c.json({ message: 'Logged out successfully' })
  }
})
