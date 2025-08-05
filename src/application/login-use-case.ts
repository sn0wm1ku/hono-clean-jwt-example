import type { UserRepository, PasswordService, TokenService } from '../domain/interfaces'
import type { LoginRequest, LoginResponse, UserPayload } from '../types/user'
import type { Result } from '../types/result'
import { success, failure } from '../types/result'

// Pure functional login use case
export const loginUseCase = (
  userRepository: UserRepository,
  passwordService: PasswordService,
  tokenService: TokenService
) => async (
  request: LoginRequest,
  jwtSecret: string
): Promise<Result<LoginResponse, string>> => {
  const { username, password } = request

  if (!username || !password) {
    return failure('Username and password are required')
  }

  const user = await userRepository.findByUsername(username)
  if (!user) {
    return failure('Invalid username or password')
  }

  const isValidPassword = await passwordService.verify(password, user.password)
  if (!isValidPassword) {
    return failure('Invalid username or password')
  }

  const userPayload: UserPayload = {
    id: user.id,
    username: user.username,
  }

  const token = await tokenService.sign(userPayload, jwtSecret)

  const response: LoginResponse = {
    message: 'Login successful',
    token,
    user: userPayload,
  }

  return success(response)
}
