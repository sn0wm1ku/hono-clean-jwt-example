import type { Context } from 'hono'
import type { LoginRequest, TokenVerificationRequest } from '../../types/user'
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
        return c.json(result.data)
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
        return c.json(result.data)
      } else {
        return c.json({ error: result.error }, 401)
      }
    } catch (error) {
      return c.json({ error: 'Token verification failed' }, 500)
    }
  }
})
