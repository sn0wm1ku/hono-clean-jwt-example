import bcrypt from 'bcryptjs'
import type { PasswordService } from '../domain/interfaces'

// Pure functional password service
export const createPasswordService = (): PasswordService => ({
  verify: async (password: string, hashedPassword: string): Promise<boolean> =>
    bcrypt.compare(password, hashedPassword),
  
  hash: async (password: string): Promise<string> =>
    bcrypt.hash(password, 10),
})
