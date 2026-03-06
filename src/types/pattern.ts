export type ImageRole = 'paper' | 'digital' | 'other'

export interface PatternImage {
  id: string
  pattern_id: string
  filename: string
  role: ImageRole
  label: string
  width?: number
  height?: number
}

export interface Pattern {
  id: string
  title: string
  description: string
  inventory: string
  year: number
  designer: string
  location: string
  technique: string
  digitized_at: string // ISO date string
  digitized_by: string
  labels: string[]
  images?: PatternImage[]
}
