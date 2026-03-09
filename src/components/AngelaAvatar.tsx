import { useId } from 'react'
import { motion } from 'framer-motion'
import type { AvatarExpression } from '../utils/types'

interface AngelaAvatarProps {
  size?: number
  isTyping?: boolean
  expression?: AvatarExpression
}

export default function AngelaAvatar({ size = 36, isTyping = false, expression = 'neutral' }: AngelaAvatarProps) {
  const uid = useId()
  const id = (name: string) => `${name}-${uid}`

  // Expression-driven values (dramatic enough to read at 36px)
  const irisOffset = expression === 'thinking' ? { x: -2, y: -2 } : { x: 0, y: 0 }
  const eyeSquint = expression === 'happy' ? 1.5 : 0 // flatten eye opening
  const blushOpacity = expression === 'happy' ? 0.25 : expression === 'concerned' ? 0.05 : 0.12
  const sparkleOpacity = expression === 'happy' ? 1 : 0.8

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={{ y: isTyping ? [0, -2, 0] : [0, -1.5, 0] }}
      transition={{
        duration: isTyping ? 0.6 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="shrink-0"
    >
      <defs>
        <clipPath id={id('clip')}>
          <circle cx={50} cy={50} r={49} />
        </clipPath>

        <linearGradient id={id('hair')} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0D0D12" />
          <stop offset="40%" stopColor="#080810" />
          <stop offset="60%" stopColor="#12121E" />
          <stop offset="100%" stopColor="#0A0A12" />
        </linearGradient>

        <linearGradient id={id('hl')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3A4A6A" />
          <stop offset="100%" stopColor="#0D0D12" />
        </linearGradient>

        <radialGradient id={id('skin')} cx="50%" cy="38%" r="55%">
          <stop offset="0%" stopColor="#F8EDE8" />
          <stop offset="70%" stopColor="#F2E0D8" />
          <stop offset="100%" stopColor="#EBCFC4" />
        </radialGradient>

        <linearGradient id={id('lip')} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8A0A0" />
          <stop offset="100%" stopColor="#D88888" />
        </linearGradient>

        <filter id={id('sparkle')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx={50} cy={50} r={49} fill="#F0EBE6" stroke="#E0DCD8" strokeWidth={1.2} />

      <g clipPath={`url(#${id('clip')})`}>

        {/* ============ LAYER 1: HAIR BEHIND EVERYTHING ============ */}

        {/* Full hair — fans outward into wide triangular silhouette */}
        <path
          d="M18 18
             Q14 40 8 70
             Q4 88 5 100
             L95 100
             Q96 88 92 70
             Q86 40 82 18
             Q78 8 50 6
             Q22 8 18 18 Z"
          fill={`url(#${id('hair')})`}
        />

        {/* Hair inner volume — left side */}
        <path d="M20 22 Q16 50 10 82 L18 82 Q22 50 24 28 Z" fill="#0E0E16" opacity={0.5} />
        {/* Hair inner volume — right side */}
        <path d="M80 22 Q84 50 90 82 L82 82 Q78 50 76 28 Z" fill="#0E0E16" opacity={0.5} />

        {/* Blue sheen — left */}
        <motion.path
          d="M14 35 Q10 55 8 78 L13 78 Q15 55 17 38 Z"
          fill={`url(#${id('hl')})`}
          opacity={0.15}
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Blue sheen — right */}
        <motion.path
          d="M86 35 Q90 55 92 78 L87 78 Q85 55 83 38 Z"
          fill={`url(#${id('hl')})`}
          opacity={0.12}
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* Hair crown — voluminous top behind the face */}
        <ellipse cx={50} cy={26} rx={32} ry={20} fill={`url(#${id('hair')})`} />

        {/* ============ LAYER 2: BODY ============ */}

        {/* Neck */}
        <path d="M42 68 Q42 78 41 88 L59 88 Q58 78 58 68" fill="#F0DDD4" />
        <path
          d="M42 68 Q50 70 58 68 Q56 72 50 73 Q44 72 42 68"
          fill="#E4C8BC"
          opacity={0.4}
        />

        {/* Black top */}
        <path
          d="M30 85 Q35 80 42 78 Q46 82 50 83 Q54 82 58 78 Q65 80 70 85 L72 100 L28 100 Z"
          fill="#1A1A20"
        />
        <path
          d="M42 78 Q46 82 50 83 Q54 82 58 78 Q56 80 50 81 Q44 80 42 78"
          fill="#222230"
        />

        {/* ============ LAYER 3: FACE (on top of hair crown) ============ */}

        <path
          d="M29 36
             Q27 48 30 56
             Q33 63 38 66
             Q44 71 50 72
             Q56 71 62 66
             Q67 63 70 56
             Q73 48 71 36 Z"
          fill={`url(#${id('skin')})`}
        />

        {/* Cheekbone shadow */}
        <ellipse cx={33} cy={56} rx={4} ry={3} fill="#E4C8BC" opacity={0.2} />
        <ellipse cx={67} cy={56} rx={4} ry={3} fill="#E4C8BC" opacity={0.2} />

        {/* ============ LAYER 4: FACIAL FEATURES ============ */}

        {/* Eyebrows */}
        <motion.path
          animate={{
            d: expression === 'concerned'
              ? 'M33 40 Q37 39 42 41.5'     // inner ends drop
              : expression === 'happy'
              ? 'M33 41.5 Q37 39 42 40.5'   // relaxed
              : 'M33 41 Q37 38.5 42 40',     // neutral
          }}
          transition={{ duration: 0.3 }}
          stroke="#1A1520"
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />
        <motion.path
          animate={{
            d: expression === 'concerned'
              ? 'M58 41.5 Q63 39 67 40'
              : expression === 'happy'
              ? 'M58 40.5 Q63 39 67 41.5'
              : 'M58 40 Q63 38.5 67 41',
          }}
          transition={{ duration: 0.3 }}
          stroke="#1A1520"
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* --- LEFT EYE --- */}
        <g>
          <motion.path
            animate={{ d: `M32 49 Q38 ${43.5 + eyeSquint} 44 49 Q38 ${53.5 - eyeSquint} 32 49` }}
            transition={{ duration: 0.3 }}
            fill="white"
          />
          <path d="M33 48.5 Q38 44.5 43 48.5" fill="#E0D0CC" opacity={0.3} />

          <motion.circle
            cx={38 + irisOffset.x} cy={49 + irisOffset.y} r={4} fill="#1A1520"
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${38 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />
          <motion.circle
            cx={38 + irisOffset.x} cy={49 + irisOffset.y} r={4} fill="none" stroke="#2A2030" strokeWidth={0.8}
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${38 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />
          <motion.circle
            cx={38 + irisOffset.x} cy={48.5 + irisOffset.y} r={2} fill="#000"
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${38 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />

          {/* Lash line */}
          <path d="M32.5 49 Q35 44.5 38 44 Q41 44.5 44 49" stroke="#0A0A10" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d="M33.5 49.5 Q38 53 42.5 49.5" stroke="#2A2030" strokeWidth={0.5} fill="none" opacity={0.4} />

          {/* Lashes */}
          <path d="M32.5 48.5 L31 46.5" stroke="#0A0A10" strokeWidth={0.8} strokeLinecap="round" />
          <path d="M33.5 46.5 L32.5 44.5" stroke="#0A0A10" strokeWidth={0.7} strokeLinecap="round" />
          <path d="M35.5 45 L35 43" stroke="#0A0A10" strokeWidth={0.7} strokeLinecap="round" />
          <path d="M37.5 44.2 L37.5 42.5" stroke="#0A0A10" strokeWidth={0.6} strokeLinecap="round" />

          {/* Sparkles */}
          <motion.circle
            cx={40} cy={47} r={1.5} fill="white" filter={`url(#${id('sparkle')})`}
            animate={{ opacity: [sparkleOpacity - 0.1, sparkleOpacity, sparkleOpacity - 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx={36} cy={50.5} r={0.7} fill="white" opacity={0.5} />
        </g>

        {/* --- RIGHT EYE --- */}
        <g>
          <motion.path
            animate={{ d: `M56 49 Q62 ${43.5 + eyeSquint} 68 49 Q62 ${53.5 - eyeSquint} 56 49` }}
            transition={{ duration: 0.3 }}
            fill="white"
          />
          <path d="M57 48.5 Q62 44.5 67 48.5" fill="#E0D0CC" opacity={0.3} />

          <motion.circle
            cx={62 + irisOffset.x} cy={49 + irisOffset.y} r={4} fill="#1A1520"
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${62 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />
          <motion.circle
            cx={62 + irisOffset.x} cy={49 + irisOffset.y} r={4} fill="none" stroke="#2A2030" strokeWidth={0.8}
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${62 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />
          <motion.circle
            cx={62 + irisOffset.x} cy={48.5 + irisOffset.y} r={2} fill="#000"
            animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
            style={{ transformOrigin: `${62 + irisOffset.x}px ${49 + irisOffset.y}px` }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.42, 0.44, 0.46, 1] }}
          />

          {/* Lash line */}
          <path d="M56 49 Q59 44.5 62 44 Q65 44.5 67.5 49" stroke="#0A0A10" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d="M57.5 49.5 Q62 53 66.5 49.5" stroke="#2A2030" strokeWidth={0.5} fill="none" opacity={0.4} />

          {/* Lashes */}
          <path d="M67.5 48.5 L69 46.5" stroke="#0A0A10" strokeWidth={0.8} strokeLinecap="round" />
          <path d="M66.5 46.5 L67.5 44.5" stroke="#0A0A10" strokeWidth={0.7} strokeLinecap="round" />
          <path d="M64.5 45 L65 43" stroke="#0A0A10" strokeWidth={0.7} strokeLinecap="round" />
          <path d="M62.5 44.2 L62.5 42.5" stroke="#0A0A10" strokeWidth={0.6} strokeLinecap="round" />

          {/* Sparkles */}
          <motion.circle
            cx={64} cy={47} r={1.5} fill="white" filter={`url(#${id('sparkle')})`}
            animate={{ opacity: [sparkleOpacity - 0.1, sparkleOpacity, sparkleOpacity - 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <circle cx={60} cy={50.5} r={0.7} fill="white" opacity={0.5} />
        </g>

        {/* Nose */}
        <path
          d="M49.5 57 L50 58 L50.5 57"
          stroke="#D8BEB4"
          strokeWidth={0.7}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Lips */}
        {isTyping ? (
          <motion.ellipse
            cx={50} cy={62} rx={3} ry={2}
            fill={`url(#${id('lip')})`}
            animate={{ ry: [2, 3, 1.2, 2.5, 2], rx: [3, 2.5, 3.5, 2.5, 3] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <g>
            <path
              d="M46 61.5 Q47.5 60.5 49 61.2 Q49.5 60.8 50 61 Q50.5 60.8 51 61.2 Q52.5 60.5 54 61.5"
              fill="#D89898"
            />
            <path d="M46 61.5 Q50 64 54 61.5" fill={`url(#${id('lip')})`} />
            <motion.ellipse
              cx={50} cy={62.2} rx={1.5} ry={0.5} fill="white" opacity={0.12}
              animate={{ opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        )}

        {/* Blush */}
        <motion.ellipse
          cx={32} cy={55} rx={5} ry={3} fill="#F0B0B0"
          animate={{ opacity: [blushOpacity - 0.04, blushOpacity + 0.04, blushOpacity - 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx={68} cy={55} rx={5} ry={3} fill="#F0B0B0"
          animate={{ opacity: [blushOpacity - 0.04, blushOpacity + 0.04, blushOpacity - 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* ============ LAYER 5: BANGS + HAIR FRAMING (on top of face) ============ */}

        {/* Bangs — soft wispy strand groups, not ruler-straight */}
        <path
          d="M22 22
             Q24 10 36 7
             Q43 5.5 50 5.5
             Q57 5.5 64 7
             Q76 10 78 22
             L77 32
             Q74 35.5 70 34
             Q66 33 62 35
             Q58 37 54 35.5
             Q51 34 50 34.5
             Q49 34 46 35.5
             Q42 37 38 35
             Q34 33 30 34
             Q26 35.5 23 32
             Z"
          fill={`url(#${id('hair')})`}
        />

        {/* Strand separation lines in bangs */}
        <path d="M36 8 L35 35" stroke="#16161E" strokeWidth={0.5} opacity={0.25} />
        <path d="M43 6.5 L42 36" stroke="#16161E" strokeWidth={0.5} opacity={0.2} />
        <path d="M50 5.5 L50 34.5" stroke="#16161E" strokeWidth={0.5} opacity={0.25} />
        <path d="M57 6.5 L58 36" stroke="#16161E" strokeWidth={0.5} opacity={0.2} />
        <path d="M64 8 L65 35" stroke="#16161E" strokeWidth={0.5} opacity={0.25} />

        {/* Bangs highlight */}
        <motion.path
          d="M38 12 Q44 10 50 11 Q56 10 62 12"
          stroke="#4A5A80"
          strokeWidth={1.8}
          fill="none"
          opacity={0.12}
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Hair framing — thick strands falling alongside face, wider */}
        <path
          d="M23 32 Q19 50 16 70 Q14 80 13 85
             L20 85 Q22 75 24 65 Q26 50 27 35 Z"
          fill={`url(#${id('hair')})`}
        />
        <path
          d="M77 32 Q81 50 84 70 Q86 80 87 85
             L80 85 Q78 75 76 65 Q74 50 73 35 Z"
          fill={`url(#${id('hair')})`}
        />

        {/* Hair falling forward — left side over shoulder */}
        <path
          d="M24 55 Q28 70 32 82 Q33 88 35 92
             L30 92 Q27 85 24 72 Q22 62 22 55 Z"
          fill={`url(#${id('hair')})`}
        />
        {/* Hair falling forward — right side over shoulder */}
        <path
          d="M76 55 Q72 70 68 82 Q67 88 65 92
             L70 92 Q73 85 76 72 Q78 62 78 55 Z"
          fill={`url(#${id('hair')})`}
        />

        {/* Hair shine streaks */}
        <motion.path
          d="M16 45 Q14 60 12 75"
          stroke="#4A5A80"
          strokeWidth={1.5}
          fill="none"
          strokeLinecap="round"
          opacity={0.1}
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M84 45 Q86 60 88 75"
          stroke="#4A5A80"
          strokeWidth={1.2}
          fill="none"
          strokeLinecap="round"
          opacity={0.08}
          animate={{ opacity: [0.05, 0.12, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        />
      </g>

      {/* Border on top */}
      <circle cx={50} cy={50} r={49} fill="none" stroke="#E0DCD8" strokeWidth={1.2} />
    </motion.svg>
  )
}
