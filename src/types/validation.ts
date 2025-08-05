import { z } from 'zod'

// Login request validation schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50, 'Username too long'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters')
})

// Token verification request validation schema
export const tokenVerificationSchema = z.object({
  token: z.string().min(1, 'Token is required')
})

// Type inference from schemas
export type LoginRequest = z.infer<typeof loginSchema>
export type TokenVerificationRequest = z.infer<typeof tokenVerificationSchema>
