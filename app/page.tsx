'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Calendar from '@/components/Calendar'
import ROIDashboard from '@/components/ROIDashboard'
import BottomNav from '@/components/BottomNav'
import { getSessions, getSettings } from '@/lib/storage'
import { computeMonthlyStats } from '@/lib/stats'
import { Session, MonthlyStats, AppSettings } from '@/lib/types'

export default function HomePage() {
  const router = useRouter()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [sessions, setSessions] = useState<Session[]>([])
  const [stats, setStats] = useState<MonthlyStats | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [tab, setTab] = useState<'calendar' | 'roi'>('calendar')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [all, appSettings] = await Promise.all([getSessions(), getSettings()])
      const prefix = `${year}-${String(month).padStart(2, '0')}`
      setSessions(all.filter(s => s.date.startsWith(prefix)))
      setStats(computeMonthlyStats(all, appSettings, year, month))
      setSettings(appSettings)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    load()
  }, [load])

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  return (
    <div className="min-h-dvh" style={{ backgroundColor: '#F8F4EF' }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-5"
        style={{
          backgroundColor: '#F8F4EF',
          paddingTop: `calc(env(safe-area-inset-top) + 12px)`,
          paddingBottom: '12px',
        }}
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#1C1C1E' }}>
            KICK<span style={{ color: '#FF6B35' }}>LOG</span>
          </h1>
          {isCurrentMonth && (
            <p className="text-xs" style={{ color: '#8E8E93' }}>今月の記録</p>
          )}
        </div>
        <button
          onClick={() => router.push('/sessions/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-white active:opacity-80"
          style={{ backgroundColor: '#FF6B35' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          記録する
        </button>
      </header>

      <div className="px-5 mb-4">
        <div className="flex rounded-xl p-1" style={{ backgroundColor: '#EBEBF0' }}>
          {(['calendar', 'roi'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t ? 'white' : 'transparent',
                color: tab === t ? '#1C1C1E' : '#8E8E93',
                boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
              }}
            >
              {t === 'calendar' ? 'カレンダー' : 'ROI'}
            </button>
          ))}
        </div>
      </div>

      <main className="px-5 pb-28 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
          </div>
        ) : tab === 'calendar' ? (
          <>
            <Calendar
              year={year}
              month={month}
              sessions={sessions}
              onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
            />
            {sessions.filter(s => s.status === 'actual').length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 px-1" style={{ color: '#8E8E93' }}>
                  今月の実績
                </h3>
                <div className="flex flex-col gap-2">
                  {sessions
                    .filter(s => s.status === 'actual')
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map(s => (
                      <SessionSummaryCard
                        key={s.id}
                        session={s}
                        onClick={() => router.push(`/sessions/${s.id}`)}
                      />
                    ))}
                </div>
              </div>
            )}
            {sessions.length === 0 && (
              <div className="flex flex-col items-center gap-3 py-12">
                <span className="text-5xl">🥊</span>
                <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>
                  まだ記録がありません
                </p>
                <button
                  onClick={() => router.push('/sessions/new')}
                  className="px-6 py-2.5 rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  最初の記録を追加
                </button>
              </div>
            )}
          </>
        ) : (
          stats && settings && <ROIDashboard stats={stats} settings={settings} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function SessionSummaryCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const date = new Date(session.date + 'T00:00:00')
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}(${['日','月','火','水','木','金','土'][date.getDay()]})`
  const INTENSITY_EMOJI = ['', '😌', '💪', '🏋️', '🔥', '💀']
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between active:bg-gray-50 text-left w-full shadow-sm"
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-sm" style={{ color: '#1C1C1E' }}>{dateLabel}</span>
        <span className="text-xs" style={{ color: '#8E8E93' }}>
          {session.totalRounds}R{session.trainerName ? ` · ${session.trainerName}` : ''}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {session.intensity && <span className="text-xl">{INTENSITY_EMOJI[session.intensity]}</span>}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="#D1D1D6" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </button>
  )
}
