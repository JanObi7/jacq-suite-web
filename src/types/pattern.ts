export type ImageRole = 'thumbnail' | 'paper_template' | 'digital_pattern' | 'other'

export interface PatternImage {
  id: string
  url: string
  thumbnailUrl: string
  role: ImageRole
  label: string
  width?: number
  height?: number
  isHighResolution?: boolean // true wenn > 15000x10000
}

export interface Pattern {
  id: string
  name: string
  year: number
  digitizedAt: string // ISO date string
  digitizedBy: string
  designer: string
  origin: string
  technique: string
  width: number
  height: number
  colors: string[]
  description: string
  tags: string[]
  images: PatternImage[]
}
