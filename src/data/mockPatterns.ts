import type { Pattern } from '@/types/pattern'

export const mockPatterns: Pattern[] = [
  {
    id: '1',
    name: 'D913',
    year: 1978,
    digitizedAt: '2025-04-13',
    designer: 'Tannenhauer',
    origin: 'Braunsdorf, Deutschland',
    technique: 'Jacquard-Gewebe',
    colors: ['Rot', 'Weiß', 'Grau'],
    description:
      'Elegantes Rosenmuster.',
    tags: ['Rosen'],
    images: [
      {
        id: '14-1',
        url: '/jacq-suite-web/patterns/D913/thumbnail.png',
        thumbnailUrl: '/jacq-suite-web/patterns/D913/thumbnail.png',
        role: 'thumbnail',
        label: 'Symbolbild',
        width: 512,
        height: 512,
        isHighResolution: false,
      },
      {
        id: '14-2',
        url: '/jacq-suite-web/patterns/D913/design_scan_small.jpg',
        thumbnailUrl: '/jacq-suite-web/patterns/D913/design_scan_small.jpg',
        role: 'paper_template',
        label: 'Papiervorlage',
        width: 800,
        height: 600,
        isHighResolution: true,
      },
      {
        id: '14-3',
        url: '/jacq-suite-web/patterns/D913/design_full_small.png',
        thumbnailUrl: '/jacq-suite-web/patterns/D913/design_full_small.png',
        role: 'digital_pattern',
        label: 'Digitales Muster',
        width: 16000,
        height: 12000,
        isHighResolution: true,
      },
    ],
  },
]
