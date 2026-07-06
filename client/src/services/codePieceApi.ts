import api from './api'
import type { CodePiece, CreatePieceRequest, PaginatedResponse } from '../types'

export const codePieceApi = {
  list: (params?: { page?: number; tag?: string; sort?: string }) =>
    api.get<PaginatedResponse<CodePiece>>('/code-pieces', { params }).then((r) => r.data),

  trending: () =>
    api.get<CodePiece[]>('/code-pieces/trending').then((r) => r.data),

  getById: (id: number) =>
    api.get<CodePiece>(`/code-pieces/${id}`).then((r) => r.data),

  create: (data: CreatePieceRequest) =>
    api.post<CodePiece>('/code-pieces', data).then((r) => r.data),

  update: (id: number, data: Partial<CreatePieceRequest>) =>
    api.put<CodePiece>(`/code-pieces/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    api.delete(`/code-pieces/${id}`).then((r) => r.data),

  search: (params: { q?: string; tags?: string; page?: number }) =>
    api.get<PaginatedResponse<CodePiece>>('/search', { params }).then((r) => r.data),
}
