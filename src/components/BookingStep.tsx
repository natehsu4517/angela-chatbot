import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { getAvailability, bookMeeting } from '../utils/api'
import { useChatStore } from '../stores/chatStore'
import type { TimeSlot, BookingResult } from '../utils/types'

type BookingPhase = 'date' | 'time' | 'confirm' | 'success'

export default function BookingStep() {
  const [phase, setPhase] = useState<BookingPhase>('date')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const { leadProfile, setStage } = useChatStore()

  // Generate next 14 weekdays
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  }).filter((d) => d.getDay() !== 0 && d.getDay() !== 6)

  const handleDateSelect = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    setSelectedDate(dateStr)
    setLoading(true)
    try {
      const available = await getAvailability(dateStr)
      setSlots(available)
      setPhase('time')
    } catch {
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setPhase('confirm')
  }

  const handleBook = async () => {
    if (!selectedSlot || !leadProfile.name || !leadProfile.email) return
    setLoading(true)
    try {
      const result = await bookMeeting(
        selectedDate,
        selectedSlot.start,
        leadProfile.name,
        leadProfile.email,
        leadProfile as unknown as Record<string, unknown>
      )
      setBooking(result)
      setPhase('success')
      setStage('booked')
    } catch {
      // Handle error
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, '0')} ${ampm}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 mb-2 rounded-xl bg-surface border border-border overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {/* Date selection */}
        {phase === 'date' && (
          <motion.div
            key="date"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-accent" />
              <span className="text-xs font-medium text-text-muted">Pick a date</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {dates.map((d) => (
                <button
                  key={d.toISOString()}
                  onClick={() => handleDateSelect(d)}
                  disabled={loading}
                  className="text-xs py-2 px-2 rounded-lg bg-surface-hover
                    hover:bg-accent/10 hover:text-accent border border-border
                    transition-colors cursor-pointer text-text
                    disabled:opacity-50"
                >
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Time selection */}
        {phase === 'time' && (
          <motion.div
            key="time"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3"
          >
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setPhase('date')}
                className="p-1 hover:bg-surface-hover rounded cursor-pointer"
              >
                <ArrowLeft size={14} className="text-text-muted" />
              </button>
              <Clock size={14} className="text-accent" />
              <span className="text-xs font-medium text-text-muted">
                {selectedDate} — Pick a time
              </span>
            </div>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={20} className="text-accent animate-spin" />
              </div>
            ) : slots.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">
                No slots available. Try another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => handleTimeSelect(slot)}
                    className="text-xs py-2 px-2 rounded-lg bg-surface-hover
                      hover:bg-accent/10 hover:text-accent border border-border
                      transition-colors cursor-pointer text-text"
                  >
                    {formatTime(slot.start)}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Confirmation */}
        {phase === 'confirm' && selectedSlot && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setPhase('time')}
                className="p-1 hover:bg-surface-hover rounded cursor-pointer"
              >
                <ArrowLeft size={14} className="text-text-muted" />
              </button>
              <span className="text-xs font-medium text-text-muted">Confirm booking</span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-accent" />
                <span>{selectedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock size={14} className="text-accent" />
                <span>{formatTime(selectedSlot.start)} ET</span>
              </div>
            </div>
            <button
              onClick={handleBook}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                hover:bg-accent-hover transition-colors cursor-pointer
                disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Confirm Meeting'
              )}
            </button>
          </motion.div>
        )}

        {/* Success */}
        {phase === 'success' && booking && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
            </motion.div>
            <p className="text-sm font-medium mb-1">Meeting Booked!</p>
            <p className="text-xs text-text-muted mb-3">
              {booking.eventDate} at {booking.eventTime}
            </p>
            {booking.meetLink && (
              <a
                href={booking.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-hover transition-colors"
              >
                Open Google Meet Link
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
