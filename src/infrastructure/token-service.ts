import { sign, verify } from 'hono/jwt'
import type { TokenService } from '../domain/interfaces'
import type { UserPayload } from '../types/user'
import type { Result } from '../types/result'
import { success, failure } from '../types/result'

// Pure functional token service
export const createTokenService = (): TokenService => ({
  sign: async (payload: UserPayload, secret: string): Promise<string> => {
    const tokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    }
    
    return sign(tokenPayload, secret)
  },

  verify: async (token: string, secret: string): Promise<Result<any, string>> => {
    try {
      const payload = await verify(token, secret)
      return success(payload)
    } catch (error) {
      return failure('Invalid token')
    }
  },
})
