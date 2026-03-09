import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

const supportsVoice = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const stopListening = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
      return
    }

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionClass) return

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join('')
      setValue(transcript)

      if (event.results[event.results.length - 1].isFinal) {
        setIsListening(false)
        recognitionRef.current = null
        inputRef.current?.focus()
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const handleSend = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    if (isListening) stopListening()
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isListening) stopListening()
    setValue(e.target.value)
  }

  return (
    <div className="flex items-center gap-2 p-3.5 border-t border-border">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder={isListening ? 'Listening...' : 'Type a message...'}
        disabled={disabled}
        className={`flex-1 bg-surface-elevated text-text text-[15px] px-4 py-2.5 rounded-xl
          border focus:outline-none
          placeholder:text-text-muted/50 transition-colors
          disabled:opacity-50 ${
            isListening
              ? 'border-accent/50 focus:border-accent'
              : 'border-border focus:border-text/30'
          }`}
      />

      {supportsVoice && (
        <motion.button
          onClick={toggleListening}
          disabled={disabled}
          whileTap={{ scale: 0.9 }}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center
            transition-colors cursor-pointer shrink-0
            disabled:opacity-30 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                : 'bg-surface border border-border text-text-muted hover:text-text hover:border-text/20'
            }`}
        >
          {isListening && (
            <motion.span
              className="absolute inset-0 rounded-xl border-2 border-red-500/30"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          {isListening ? <MicOff size={17} /> : <Mic size={17} />}
        </motion.button>
      )}

      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="w-10 h-10 rounded-xl bg-accent text-bg flex items-center justify-center
          hover:bg-accent-hover transition-colors cursor-pointer
          disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <Send size={17} />
      </button>
    </div>
  )
}
