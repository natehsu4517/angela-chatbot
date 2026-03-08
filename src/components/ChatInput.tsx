import { useState, useRef } from 'react'
import { Send } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <div className="flex items-center gap-2 p-3.5 border-t border-border">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-surface-elevated text-text text-[15px] px-4 py-2.5 rounded-xl
          border border-border focus:border-text/30 focus:outline-none
          placeholder:text-text-muted/50 transition-colors
          disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="w-10 h-10 rounded-xl bg-accent text-bg flex items-center justify-center
          hover:bg-accent-hover transition-colors cursor-pointer
          disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <Send size={17} />
      </button>
    </div>
  )
}
