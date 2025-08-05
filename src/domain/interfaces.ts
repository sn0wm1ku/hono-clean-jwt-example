import type { User, UserPayload } from '../types/user.ts'
import type { Result } from '../types/result.ts'

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>
  findById(id: number): Promise<User | null>
}

export interface PasswordService {
  verify(password: string, hashedPassword: string): Promise<boolean>
  hash(password: string): Promise<string>
}

export interface TokenService {
  sign(payload: UserPayload, secret: string): Promise<string>
  verify(token: string, secret: string): Promise<Result<any, string>>
}
