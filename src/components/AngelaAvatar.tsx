import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { AvatarExpression } from '../utils/types'

interface AngelaAvatarProps {
  size?: number
  isTyping?: boolean
  expression?: AvatarExpression
}

const IDLE_SRC = '/angela-sprite.png'
const TALK_SRC = '/angela-sprite-talk.png'

export default function AngelaAvatar({ size = 36, isTyping = false }: AngelaAvatarProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!isTyping) {
      setFrame(0)
      return
    }
    const interval = setInterval(() => {
      setFrame(f => (f === 0 ? 1 : 0))
    }, 500)
    return () => clearInterval(interval)
  }, [isTyping])

  const src = isTyping && frame === 1 ? TALK_SRC : IDLE_SRC

  return (
    <motion.img
      src={src}
      alt="Angela"
      width={size}
      height={size}
      animate={{
        y: isTyping ? [0, -2, 0] : [0, -1.5, 0],
      }}
      transition={{
        y: {
          duration: isTyping ? 0.6 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      className="shrink-0 rounded-full"
      style={{
        imageRendering: 'pixelated',
        objectFit: 'cover',
      }}
      draggable={false}
    />
  )
}
