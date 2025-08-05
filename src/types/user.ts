export interface User {
  readonly id: number
  readonly username: string
  readonly password: string
}

export interface UserPayload {
  readonly id: number
  readonly username: string
}

// Re-export validation types for backward compatibility
export type { LoginRequest, TokenVerificationRequest } from './validation'

export interface LoginResponse {
  readonly message: string
  readonly token: string
  readonly user: UserPayload
}

export interface TokenVerificationResponse {
  readonly valid: boolean
  readonly payload?: any
  readonly error?: string
}

export interface UserProfile {
  readonly id: number
  readonly username: string
  readonly profile: {
    readonly lastLogin: string
    readonly role: string
  }
}
