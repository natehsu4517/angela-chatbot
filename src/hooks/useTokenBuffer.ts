import { useRef, useCallback } from 'react'

interface TokenBufferOptions {
  onFlush: (text: string) => void
}

// 1 char/frame at 60fps = ~60 chars/sec.
// True character-by-character typewriter. Since onFlush writes
// directly to the DOM (no React), each tick is essentially free.
const CHARS_PER_FRAME = 1

export function useTokenBuffer({ onFlush }: TokenBufferOptions) {
  const allText = useRef('')
  const displayed = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    rafRef.current = null
    const gap = allText.current.length - displayed.current
    if (gap <= 0) return

    const end = displayed.current + Math.min(CHARS_PER_FRAME, gap)
    const chunk = allText.current.slice(displayed.current, end)
    displayed.current = end

    onFlush(chunk)

    if (displayed.current < allText.current.length) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [onFlush])

  const push = useCallback((token: string) => {
    allText.current += token
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(tick)
    }
  }, [tick])

  /** Stream ended: dump remaining instantly (DOM writes are free). */
  const flush = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    const remaining = allText.current.length - displayed.current
    if (remaining > 0) {
      onFlush(allText.current.slice(displayed.current))
      displayed.current = allText.current.length
    }
  }, [onFlush])

  const reset = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    allText.current = ''
    displayed.current = 0
  }, [])

  return { push, flush, reset }
}
