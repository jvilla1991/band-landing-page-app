import type { ReactNode } from 'react'

export type IconName =
  | 'spotify'
  | 'apple'
  | 'tidal'
  | 'bandcamp'
  | 'youtube'
  | 'instagram'
  | 'x'
  | 'tiktok'
  | 'facebook'
  | 'discord'
  | 'play'
  | 'pause'
  | 'arrow'
  | 'arrowUp'
  | 'check'
  | 'info'
  | 'mail'
  | 'download'
  | 'note'
  | 'image'
  | 'disc'

interface SvgProps {
  filled?: boolean
  children: ReactNode
}

function Svg({ filled, children }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const ICONS: Record<IconName, JSX.Element> = {
  /* ---- streaming ---- */
  spotify: (
    <Svg>
      <circle cx={12} cy={12} r={9.2} strokeWidth={1.4} />
      <path d="M7.4 9.6c3-0.8 6.4-0.5 9.1 1.1" strokeWidth={1.4} />
      <path d="M7.8 13c2.5-0.6 5.2-0.3 7.4 0.9" strokeWidth={1.4} />
      <path d="M8.4 16c1.9-0.4 3.9-0.2 5.6 0.7" strokeWidth={1.4} />
    </Svg>
  ),
  apple: (
    <Svg>
      <path d="M16 7c0 5-3 6-3 10" />
      <circle cx={9.5} cy={16.5} r={2.4} />
      <path d="M11.9 16.2V7.3c0-0.5 0.3-0.9 0.8-1L16 5.4" />
    </Svg>
  ),
  tidal: (
    <Svg>
      <path d="M3.2 9.7 6 6.9l2.8 2.8L6 12.5z" />
      <path d="M8.8 9.7 11.6 6.9l2.8 2.8-2.8 2.8z" />
      <path d="M14.4 9.7 17.2 6.9 20 9.7l-2.8 2.8z" />
      <path d="M8.8 15.3 11.6 12.5l2.8 2.8-2.8 2.8z" />
    </Svg>
  ),
  bandcamp: (
    <Svg filled>
      <path d="M4 15.5 8 8.5h12l-4 7z" />
    </Svg>
  ),
  youtube: (
    <Svg>
      <rect x={3} y={6.5} width={18} height={11} rx={3} />
      <path d="M11 9.6l4 2.4-4 2.4z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  /* ---- social ---- */
  instagram: (
    <Svg>
      <rect x={4} y={4} width={16} height={16} rx={5} />
      <circle cx={12} cy={12} r={3.6} />
      <circle cx={17} cy={7} r={0.6} fill="currentColor" stroke="none" />
    </Svg>
  ),
  x: (
    <Svg>
      <path d="M5 5l14 14M19 5L5 19" />
    </Svg>
  ),
  tiktok: (
    <Svg>
      <path d="M14 4c0 4 2.5 5.5 5 5.5" />
      <path d="M14 4v10.5a3.8 3.8 0 1 1-3.8-3.8" />
    </Svg>
  ),
  facebook: (
    <Svg>
      <path d="M14.5 8.5H13c-0.8 0-1.5 0.6-1.5 1.5v10" />
      <path d="M9.5 12.5h5" />
    </Svg>
  ),
  discord: (
    <Svg>
      <path d="M8 7.5C9.2 7 10.6 6.7 12 6.7s2.8 0.3 4 0.8c2 2 2.8 5 3 8.3-1.3 1-2.7 1.6-4 1.9l-0.9-1.5" />
      <path d="M16 16.7c-1.2 0.5-2.6 0.8-4 0.8s-2.8-0.3-4-0.8l-1 1.5c-1.3-0.3-2.7-0.9-4-1.9 0.2-3.3 1-6.3 3-8.3" />
      <circle cx={9.8} cy={13} r={1} fill="currentColor" stroke="none" />
      <circle cx={14.2} cy={13} r={1} fill="currentColor" stroke="none" />
    </Svg>
  ),
  /* ---- ui ---- */
  play: (
    <Svg>
      <path d="M8 5.5l11 6.5-11 6.5z" fill="currentColor" stroke="none" />
    </Svg>
  ),
  pause: (
    <Svg>
      <rect x={7.5} y={6} width={3} height={12} rx={1} fill="currentColor" stroke="none" />
      <rect x={13.5} y={6} width={3} height={12} rx={1} fill="currentColor" stroke="none" />
    </Svg>
  ),
  arrow: (
    <Svg>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  arrowUp: (
    <Svg>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Svg>
  ),
  check: (
    <Svg>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  ),
  info: (
    <Svg>
      <circle cx={12} cy={12} r={8.5} />
      <path d="M12 11v5M12 8h0.01" />
    </Svg>
  ),
  mail: (
    <Svg>
      <rect x={3.5} y={5.5} width={17} height={13} rx={2} />
      <path d="M4 7l8 6 8-6" />
    </Svg>
  ),
  download: (
    <Svg>
      <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
    </Svg>
  ),
  note: (
    <Svg>
      <circle cx={8} cy={17} r={2.4} />
      <circle cx={17} cy={15} r={2.4} />
      <path d="M10.4 17V7l9-1.6V15" />
    </Svg>
  ),
  image: (
    <Svg>
      <rect x={4} y={5} width={16} height={14} rx={2} />
      <circle cx={9} cy={10} r={1.4} />
      <path d="M5 17l4.5-4 3 2.5L16 11l3 3" />
    </Svg>
  ),
  disc: (
    <Svg>
      <circle cx={12} cy={12} r={8.5} />
      <circle cx={12} cy={12} r={2} />
    </Svg>
  ),
}

function Icon({ name }: { name: IconName }) {
  return ICONS[name]
}

export default Icon
