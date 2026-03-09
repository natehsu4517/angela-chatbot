import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, Users, Activity as ActivityIcon } from 'lucide-react'
import { useChatStore } from '../../stores/chatStore'
import { MOCK_LEADS, generateActivities, mergeLiveLead } from '../../data/mockLeads'
import type { AdminTab } from '../../utils/types'
import OverviewTab from './OverviewTab'
import LeadsTab from './LeadsTab'
import ActivityTab from './ActivityTab'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const TABS: { key: AdminTab; label: string; icon: typeof BarChart3 }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'leads', label: 'Leads', icon: Users },
  { key: 'activity', label: 'Activity', icon: ActivityIcon },
]

export default function AdminPanel({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const { leadProfile, score, stage, messages, conversationStartTime } = useChatStore()

  const leads = useMemo(
    () =>
      mergeLiveLead(MOCK_LEADS, {
        leadProfile,
        score,
        stage,
        messages,
        conversationStartTime,
      }),
    [leadProfile, score, stage, messages, conversationStartTime]
  )

  const activities = useMemo(() => generateActivities(leads), [leads])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-3 md:inset-6 lg:inset-10 bg-bg rounded-2xl border border-border
              shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold font-sans">Admin Panel</h2>

                {/* Tabs */}
                <div className="flex gap-1 bg-surface rounded-lg p-0.5">
                  {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                        ${
                          activeTab === key
                            ? 'bg-surface-elevated text-text shadow-sm'
                            : 'text-text-muted hover:text-text'
                        }`}
                    >
                      <Icon size={13} />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6">
              {activeTab === 'overview' && <OverviewTab leads={leads} />}
              {activeTab === 'leads' && <LeadsTab leads={leads} />}
              {activeTab === 'activity' && <ActivityTab activities={activities} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
