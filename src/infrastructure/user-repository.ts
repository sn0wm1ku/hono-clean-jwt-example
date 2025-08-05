import type { UserRepository } from '../domain/interfaces'
import type { User } from '../types/user'
import { users } from '../domain/user-data'

// Pure functional user repository
export const createUserRepository = (): UserRepository => ({
  findByUsername: async (username: string): Promise<User | null> => {
    const user = users.find(u => u.username === username)
    return user || null
  },
  
  findById: async (id: number): Promise<User | null> => {
    const user = users.find(u => u.id === id)
    return user || null
  },
})
