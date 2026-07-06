// User types
export interface User {
  id: number
  username: string
  email: string
  display_name: string
  avatar_url: string
  bio: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Code Piece types
export interface CodePiece {
  id: number
  user_id: number
  title: string
  description: string
  html_code: string
  css_code: string
  js_code: string
  is_public: number
  fork_of: number | null
  view_count: number
  like_count: number
  comment_count: number
  fork_count: number
  created_at: string
  updated_at: string
  author?: User
  tags?: Tag[]
  liked?: boolean
}

export interface CreatePieceRequest {
  title: string
  description: string
  html_code: string
  css_code: string
  js_code: string
  is_public: boolean
  tags: string[]
}

export interface UpdatePieceRequest extends Partial<CreatePieceRequest> {}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Comment {
  id: number
  code_piece_id: number
  user_id: number
  content: string
  parent_id: number | null
  created_at: string
  author?: User
  replies?: Comment[]
}

export interface Notification {
  id: number
  user_id: number
  actor_id: number
  type: 'like' | 'comment' | 'fork'
  code_piece_id: number | null
  comment_id: number | null
  is_read: number
  created_at: string
  actor?: User
  code_piece?: CodePiece
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
