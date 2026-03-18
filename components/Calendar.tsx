'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Session } from '@/lib/types'

interface CalendarProps {
  year: number
  month: number
  sessions: Session[]
  onMonthChange: (year: number, month: number) => void
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export default function Calendar({ year, month, sessions, onMonthChange }: CalendarProps) {
  const router = useRouter()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // セッションをdateでマップ
  const sessionMap = useMemo(() => {
    const map: Record<string, Session[]> = {}
    sessions.forEach((s) => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return map
  }, [sessions])

  // カレンダーの日付配列を生成
  const days = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDow = firstDay.getDay()
    const totalDays = lastDay.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < startDow; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    // 6行に揃える
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const prev = () => {
    if (month === 1) onMonthChange(year - 1, 12)
    else onMonthChange(year, month - 1)
  }

  const next = () => {
    if (month === 12) onMonthChange(year + 1, 1)
    else onMonthChange(year, month + 1)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const existing = sessionMap[dateStr]
    if (existing && existing.length > 0) {
      // 既存セッションがあれば最初のものを編集
      router.push(`/sessions/${existing[0].id}`)
    } else {
      router.push(`/sessions/new?date=${dateStr}`)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="font-semibold text-base" style={{ color: '#1C1C1E' }}>
          {year}年{month}月
        </span>
        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center rounded-full active:bg-gray-100"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="#1C1C1E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* 曜日ラベル */}
      <div className="grid grid-cols-7 px-2 pb-1">
        {DOW_LABELS.map((d, i) => (
          <div
            key={d}
            className="text-center text-xs font-medium py-1"
            style={{ color: i === 0 ? '#FF3B30' : i === 6 ? '#007AFF' : '#8E8E93' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 px-2 pb-4 gap-y-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const daySessions = sessionMap[dateStr] || []
          const hasActual = daySessions.some(s => s.status === 'actual')
          const hasPlanned = daySessions.some(s => s.status === 'planned')
          const isToday = dateStr === todayStr
          const dow = (idx % 7)

          return (
            <button
              key={dateStr}
              onClick={() => handleDayClick(day)}
              className="flex flex-col items-center py-1 rounded-xl active:bg-orange-50 transition-colors"
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                  isToday ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: isToday ? '#FF6B35' : 'transparent',
                  color: isToday
                    ? 'white'
                    : dow === 0
                    ? '#FF3B30'
                    : dow === 6
                    ? '#007AFF'
                    : '#1C1C1E',
                }}
              >
                {day}
              </span>
              {/* インジケーター */}
              <div className="flex gap-0.5 mt-0.5 h-2">
                {hasActual && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#FF6B35' }}
                  />
                )}
                {hasPlanned && (
                  <span
                    className="w-1.5 h-1.5 rounded-full border"
                    style={{ borderColor: '#FF6B35' }}
                  />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-4 px-5 pb-4 text-xs" style={{ color: '#8E8E93' }}>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
          <span>実績</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full border" style={{ borderColor: '#FF6B35' }} />
          <span>予定</span>
        </div>
      </div>
    </div>
  )
}
