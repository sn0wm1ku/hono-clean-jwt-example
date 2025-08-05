import type { TokenService } from '../domain/interfaces'
import type { TokenVerificationRequest, TokenVerificationResponse } from '../types/user'
import type { Result } from '../types/result'
import { success, failure } from '../types/result'

// Pure functional verify token use case
export const verifyTokenUseCase = (
  tokenService: TokenService
) => async (
  request: TokenVerificationRequest,
  jwtSecret: string
): Promise<Result<TokenVerificationResponse, string>> => {
  const { token } = request

  if (!token) {
    return failure('Token is required')
  }

  const verificationResult = await tokenService.verify(token, jwtSecret)

  if (verificationResult.success) {
    const response: TokenVerificationResponse = {
      valid: true,
      payload: verificationResult.data,
    }
    return success(response)
  } else {
    const response: TokenVerificationResponse = {
      valid: false,
      error: verificationResult.error,
    }
    return success(response)
  }
}
