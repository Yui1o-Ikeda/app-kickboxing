'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { getSessions } from '@/lib/storage'
import { Session } from '@/lib/types'
import { ROUND_TYPE_LABELS, INTENSITY_LABELS } from '@/lib/constants'

const INTENSITY_EMOJI = ['', '😌', '💪', '🏋️', '🔥', '💀']

function groupByMonth(sessions: Session[]): Record<string, Session[]> {
  const map: Record<string, Session[]> = {}
  sessions.forEach(s => {
    const key = s.date.slice(0, 7) // yyyy-mm
    if (!map[key]) map[key] = []
    map[key].push(s)
  })
  return map
}

export default function HistoryPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [filter, setFilter] = useState<'all' | 'actual' | 'planned'>('all')

  useEffect(() => {
    getSessions().then(all => {
      setSessions(all.sort((a, b) => b.date.localeCompare(a.date)))
    })
  }, [])

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter)
  const grouped = groupByMonth(filtered)
  const monthKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const formatMonthKey = (key: string) => {
    const [y, m] = key.split('-')
    return `${y}年${parseInt(m)}月`
  }

  return (
    <div className="min-h-dvh" style={{ backgroundColor: '#F8F4EF' }}>
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-40 px-5"
        style={{
          backgroundColor: '#F8F4EF',
          paddingTop: `calc(env(safe-area-inset-top) + 12px)`,
          paddingBottom: '12px',
        }}
      >
        <h1 className="text-xl font-black tracking-tight" style={{ color: '#1C1C1E' }}>
          記録一覧
        </h1>
        {/* フィルター */}
        <div className="flex gap-2 mt-3">
          {(['all', 'actual', 'planned'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                backgroundColor: filter === f ? '#FF6B35' : '#EBEBF0',
                color: filter === f ? 'white' : '#8E8E93',
              }}
            >
              {f === 'all' ? 'すべて' : f === 'actual' ? '実績' : '予定'}
            </button>
          ))}
          <span className="ml-auto text-xs self-center" style={{ color: '#8E8E93' }}>
            {filtered.length}件
          </span>
        </div>
      </header>

      <main className="px-5 pb-28 flex flex-col gap-6">
        {monthKeys.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <span className="text-5xl">📭</span>
            <p className="text-sm font-medium" style={{ color: '#8E8E93' }}>
              記録がありません
            </p>
          </div>
        ) : (
          monthKeys.map(key => {
            const monthSessions = grouped[key]
            const actualCount = monthSessions.filter(s => s.status === 'actual').length
            const totalRounds = monthSessions
              .filter(s => s.status === 'actual')
              .reduce((sum, s) => sum + s.totalRounds, 0)

            return (
              <div key={key}>
                {/* 月ヘッダー */}
                <div className="flex items-baseline gap-3 mb-3 px-1">
                  <h2 className="font-bold text-base" style={{ color: '#1C1C1E' }}>
                    {formatMonthKey(key)}
                  </h2>
                  {actualCount > 0 && (
                    <span className="text-xs" style={{ color: '#8E8E93' }}>
                      {actualCount}回 · {totalRounds}R
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {monthSessions.map(s => (
                    <SessionCard
                      key={s.id}
                      session={s}
                      onClick={() => router.push(`/sessions/${s.id}`)}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </main>

      <BottomNav />
    </div>
  )
}

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const date = new Date(session.date + 'T00:00:00')
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}(${['日','月','火','水','木','金','土'][date.getDay()]})`

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl px-4 py-4 shadow-sm text-left w-full active:bg-gray-50 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm" style={{ color: '#1C1C1E' }}>
              {dateLabel}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: session.status === 'actual' ? '#FFF0EB' : '#F0F4FF',
                color: session.status === 'actual' ? '#FF6B35' : '#5B7FFF',
              }}
            >
              {session.status === 'actual' ? '実績' : '予定'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-black" style={{ color: '#FF6B35' }}>
              {session.totalRounds}
            </span>
            <span className="text-sm font-medium" style={{ color: '#8E8E93' }}>
              ラウンド
            </span>
          </div>

          {/* ラウンド内訳 */}
          {session.roundBreakdown.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {session.roundBreakdown.map((b, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                >
                  {ROUND_TYPE_LABELS[b.type]} {b.count}R
                </span>
              ))}
            </div>
          )}

          {/* トレーナー */}
          {session.trainerName && (
            <span className="text-xs" style={{ color: '#8E8E93' }}>
              👤 {session.trainerName}
            </span>
          )}

          {/* コメント */}
          {session.comment && (
            <p
              className="text-xs leading-relaxed line-clamp-2"
              style={{ color: '#8E8E93' }}
            >
              "{session.comment}"
            </p>
          )}
        </div>

        {/* 追込み度 */}
        <div className="flex flex-col items-center gap-1 ml-3">
          {session.status === 'actual' && session.intensity && (
            <>
              <span className="text-2xl">{INTENSITY_EMOJI[session.intensity]}</span>
              <span className="text-xs font-medium" style={{ color: '#8E8E93' }}>
                {INTENSITY_LABELS[session.intensity]}
              </span>
            </>
          )}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-1">
            <path d="M6 4L10 8L6 12" stroke="#D1D1D6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </button>
  )
}
