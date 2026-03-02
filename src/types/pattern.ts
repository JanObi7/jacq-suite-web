export type ImageRole = 'thumbnail' | 'paper_template' | 'digital_pattern' | 'other'

export interface PatternImage {
  id: string
  url: string
  thumbnailUrl: string
  role: ImageRole
  label: string
  width?: number
  height?: number
  highres?: boolean // true wenn > 15000x10000
}

export interface Pattern {
  id: string
  title: string
  description: string
  inventory_number: string
  year: number
  designer: string
  location: string
  technique: string
  digitized_at: string // ISO date string
  digitized_by: string
  thumbnail_url: string
  labels: string[]
  images?: PatternImage[]
}
