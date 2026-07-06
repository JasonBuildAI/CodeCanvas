import api from './api'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((res) => res.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((res) => res.data),
}
