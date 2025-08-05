import { serve } from '@hono/node-server'

// Application layer
import { loginUseCase } from './application/login-use-case'
import { verifyTokenUseCase } from './application/verify-token-use-case'

// Infrastructure layer
import { createUserRepository } from './infrastructure/user-repository'
import { createPasswordService } from './infrastructure/password-service'
import { createTokenService } from './infrastructure/token-service'

// Presentation layer
import { createRouter } from './presentation/routes/index'

// Types
import type { AppConfig } from './types/config'

// Configuration
const config: AppConfig = {
  port: 9527,
  jwtSecret: 'your-super-secret-jwt-key',
}

// Dependency injection - pure functional composition
const userRepository = createUserRepository()
const passwordService = createPasswordService()
const tokenService = createTokenService()

// Use cases with injected dependencies
const login = loginUseCase(userRepository, passwordService, tokenService)
const verifyToken = verifyTokenUseCase(tokenService)

// Create application with router composition
const app = createRouter(login, verifyToken, userRepository, config.jwtSecret)

console.log(`Server is running on http://localhost:${config.port}`)

serve({
  fetch: app.fetch,
  port: config.port
})
