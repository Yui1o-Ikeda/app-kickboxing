'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getSessionById,
  saveSession,
  deleteSession,
  generateId,
  toDateString,
} from '@/lib/storage'
import { Session, RoundBreakdown, RoundType } from '@/lib/types'
import { ROUND_TYPES, ROUND_TYPE_LABELS, INTENSITY_LABELS } from '@/lib/constants'

interface SessionFormProps {
  sessionId?: string
  initialDate?: string
}

const DEFAULT_BREAKDOWN: RoundBreakdown[] = [
  { type: 'kick', count: 6 },
  { type: 'punch', count: 4 },
]

const PRESET_TRAINERS = ['たかやさん', 'りゅうせいさん', 'まさるさん', 'しおうさん', '藤原さん', 'まなかちゃん']

export default function SessionForm({ sessionId, initialDate }: SessionFormProps) {
  const router = useRouter()
  const isEdit = !!sessionId

  const today = toDateString(new Date())

  const [status, setStatus] = useState<'planned' | 'actual'>('actual')
  const [date, setDate] = useState(initialDate ?? today)
  const [totalRounds, setTotalRounds] = useState(10)
  const [breakdown, setBreakdown] = useState<RoundBreakdown[]>(DEFAULT_BREAKDOWN)
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [comment, setComment] = useState('')
  const [trainerSelect, setTrainerSelect] = useState('')  // プルダウン選択値
  const [trainerCustom, setTrainerCustom] = useState('')  // その他テキスト
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (sessionId) {
      getSessionById(sessionId).then(s => {
        if (s) {
          setStatus(s.status)
          setDate(s.date)
          setTotalRounds(s.totalRounds)
          setBreakdown(s.roundBreakdown.length > 0 ? s.roundBreakdown : DEFAULT_BREAKDOWN)
          setIntensity(s.intensity)
          setComment(s.comment)
          if (PRESET_TRAINERS.includes(s.trainerName)) {
            setTrainerSelect(s.trainerName)
          } else if (s.trainerName) {
            setTrainerSelect('その他')
            setTrainerCustom(s.trainerName)
          }
        }
      })
    }
  }, [sessionId])

  const trainerName = trainerSelect === 'その他' ? trainerCustom : trainerSelect

  const handleBreakdownChange = (idx: number, field: 'type' | 'count', value: string | number) => {
    setBreakdown(prev => prev.map((b, i) =>
      i === idx ? { ...b, [field]: field === 'count' ? Number(value) : value } : b
    ))
  }

  const addBreakdown = () => {
    if (breakdown.length >= ROUND_TYPES.length) return
    const usedTypes = breakdown.map(b => b.type)
    const next = ROUND_TYPES.find(t => !usedTypes.includes(t))
    if (next) setBreakdown(prev => [...prev, { type: next, count: 0 }])
  }

  const removeBreakdown = (idx: number) => {
    setBreakdown(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    const now = new Date().toISOString()
    const session: Session = {
      id: sessionId ?? generateId(),
      date,
      status,
      totalRounds,
      roundBreakdown: breakdown.filter(b => b.count > 0),
      intensity,
      comment: comment.trim(),
      trainerId: '',
      trainerName: trainerName.trim(),
      createdAt: now,
      updatedAt: now,
    }
    await saveSession(session)
    router.back()
  }

  const handleDelete = async () => {
    if (sessionId) {
      await deleteSession(sessionId)
      router.replace('/')
    }
  }

  const INTENSITY_EMOJI = ['', '😌', '💪', '🏋️', '🔥', '💀']

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: '#F8F4EF' }}>
      {/* ヘッダー */}
      <header
        className="flex items-center justify-between px-5 sticky top-0 z-40"
        style={{
          backgroundColor: '#F8F4EF',
          paddingTop: `calc(env(safe-area-inset-top) + 12px)`,
          paddingBottom: '12px',
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm font-medium active:opacity-70"
          style={{ color: '#FF6B35' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          戻る
        </button>
        <h1 className="font-bold text-base" style={{ color: '#1C1C1E' }}>
          {isEdit ? 'セッション編集' : 'セッション記録'}
        </h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-5 pb-32 flex flex-col gap-4 overflow-y-auto">

        {/* 予実切り替え */}
        <div className="flex rounded-xl p-1" style={{ backgroundColor: '#EBEBF0' }}>
          <button
            onClick={() => setStatus('actual')}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: status === 'actual' ? 'white' : 'transparent',
              color: status === 'actual' ? '#FF6B35' : '#8E8E93',
              boxShadow: status === 'actual' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            ✅ 実績
          </button>
          <button
            onClick={() => setStatus('planned')}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: status === 'planned' ? 'white' : 'transparent',
              color: status === 'planned' ? '#1C1C1E' : '#8E8E93',
              boxShadow: status === 'planned' ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            📅 予定
          </button>
        </div>

        {/* 日付 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full mt-2 text-base font-semibold outline-none border-b pb-1"
            style={{ color: '#1C1C1E', borderColor: '#EBEBF0' }}
          />
        </div>

        {/* ラウンド数 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
            総ラウンド数
          </label>
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setTotalRounds(r => Math.max(1, r - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl active:opacity-70"
              style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-black" style={{ color: '#1C1C1E' }}>
                {totalRounds}
              </span>
              <span className="text-lg font-medium ml-1" style={{ color: '#8E8E93' }}>R</span>
            </div>
            <button
              onClick={() => setTotalRounds(r => r + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl active:opacity-70"
              style={{ backgroundColor: '#FF6B35', color: 'white' }}
            >
              ＋
            </button>
          </div>
        </div>

        {/* ラウンド内訳 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
              ラウンド内訳
            </label>
            <button
              onClick={addBreakdown}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: '#FFF0EB', color: '#FF6B35' }}
            >
              ＋追加
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {breakdown.map((b, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select
                  value={b.type}
                  onChange={e => handleBreakdownChange(idx, 'type', e.target.value)}
                  className="flex-1 text-sm font-medium rounded-xl px-3 py-2.5 outline-none appearance-none"
                  style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                >
                  {ROUND_TYPES.map(t => (
                    <option key={t} value={t}>{ROUND_TYPE_LABELS[t]}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBreakdownChange(idx, 'count', Math.max(0, b.count - 1))}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-bold text-base" style={{ color: '#1C1C1E' }}>
                    {b.count}
                  </span>
                  <button
                    onClick={() => handleBreakdownChange(idx, 'count', b.count + 1)}
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                    style={{ backgroundColor: '#FF6B35', color: 'white' }}
                  >
                    ＋
                  </button>
                </div>
                {breakdown.length > 1 && (
                  <button
                    onClick={() => removeBreakdown(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-full active:opacity-70"
                    style={{ color: '#8E8E93' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 追込み度（実績のみ） */}
        {status === 'actual' && (
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
              追込み度
            </label>
            <div className="flex gap-2 mt-3">
              {([1, 2, 3, 4, 5] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setIntensity(v)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: intensity === v ? '#FF6B35' : '#F8F4EF',
                  }}
                >
                  <span className="text-xl">{INTENSITY_EMOJI[v]}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: intensity === v ? 'white' : '#8E8E93' }}
                  >
                    {v}
                  </span>
                </button>
              ))}
            </div>
            <p
              className="text-xs text-center mt-2 font-medium"
              style={{ color: '#FF6B35' }}
            >
              {INTENSITY_LABELS[intensity]}
            </p>
          </div>
        )}

        {/* トレーナー */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
            トレーナー
          </label>
          <select
            value={trainerSelect}
            onChange={e => {
              setTrainerSelect(e.target.value)
              if (e.target.value !== 'その他') setTrainerCustom('')
            }}
            className="w-full mt-2 text-base font-medium rounded-xl px-3 py-3 outline-none appearance-none"
            style={{ backgroundColor: '#F8F4EF', color: trainerSelect ? '#1C1C1E' : '#8E8E93' }}
          >
            <option value="">トレーナーを選択</option>
            {PRESET_TRAINERS.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option value="その他">その他</option>
          </select>
          {trainerSelect === 'その他' && (
            <input
              type="text"
              value={trainerCustom}
              onChange={e => setTrainerCustom(e.target.value)}
              placeholder="トレーナー名を入力"
              className="w-full mt-3 text-base outline-none border-b pb-1"
              style={{ color: '#1C1C1E', borderColor: '#EBEBF0' }}
              autoFocus
            />
          )}
        </div>

        {/* コメント（実績のみ） */}
        {status === 'actual' && (
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
              コメント
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="今日のトレーニングはどうでしたか？"
              className="w-full mt-2 text-sm outline-none resize-none leading-relaxed"
              style={{ color: '#1C1C1E' }}
              rows={3}
            />
          </div>
        )}

        {/* 削除ボタン（編集時） */}
        {isEdit && (
          <div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ backgroundColor: '#FFF0F0', color: '#FF3B30' }}
              >
                このセッションを削除
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-sm text-center font-medium" style={{ color: '#1C1C1E' }}>
                  本当に削除しますか？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: '#FF3B30' }}
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 保存ボタン */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-safe bg-transparent"
        style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 16px)` }}
      >
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-lg active:opacity-90 transition-opacity"
          style={{ backgroundColor: '#FF6B35' }}
        >
          {isEdit ? '更新する' : '記録する'}
        </button>
      </div>
    </div>
  )
}
