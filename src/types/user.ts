export type UserRole = 'admin' | 'editor' | 'user'

export interface Profile {
  id: string
  display_name: string
  role: UserRole
}
