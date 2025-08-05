import type { Context } from 'hono'
import type { UserRepository } from '../../domain/interfaces'

// Pure functional user controller
export const createUserController = (
  userRepository: UserRepository
) => ({
  getProfile: async (c: Context) => {
    const payload = c.get('jwtPayload')
    const user = await userRepository.findByUsername((payload as any).username)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      id: user.id,
      username: user.username,
      profile: {
        lastLogin: new Date().toISOString(),
        role: user.username === 'admin' ? 'administrator' : 'user'
      }
    })
  },

  getProtected: (c: Context) => {
    const payload = c.get('jwtPayload')
    return c.json({
      message: 'This is a protected route',
      user: payload,
      timestamp: new Date().toISOString()
    })
  }
})
