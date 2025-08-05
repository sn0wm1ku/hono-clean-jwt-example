export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  readonly success: true
  readonly data: T
}

export interface Failure<E> {
  readonly success: false
  readonly error: E
}

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
})

export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error,
})

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  !result.success
