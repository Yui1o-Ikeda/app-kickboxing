'use client'

import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import { getSettings, saveSettings, getTrainers, deleteTrainer } from '@/lib/storage'
import { AppSettings, Trainer } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/constants'

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(getSettings())
    setTrainers(getTrainers())
  }, [])

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleDeleteTrainer = (id: string) => {
    deleteTrainer(id)
    setTrainers(getTrainers())
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
          設定
        </h1>
      </header>

      <main className="px-5 pb-28 flex flex-col gap-4">

        {/* 費用設定 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#8E8E93' }}>
            費用設定
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                月会費
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-medium" style={{ color: '#8E8E93' }}>¥</span>
                <input
                  type="number"
                  value={settings.monthlyFee}
                  onChange={e => setSettings(s => ({ ...s, monthlyFee: Number(e.target.value) }))}
                  className="flex-1 text-base font-semibold outline-none border-b pb-1"
                  style={{ color: '#1C1C1E', borderColor: '#EBEBF0' }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                1回あたり交通費
              </label>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-sm font-medium" style={{ color: '#8E8E93' }}>¥</span>
                <input
                  type="number"
                  value={settings.transportCost}
                  onChange={e => setSettings(s => ({ ...s, transportCost: Number(e.target.value) }))}
                  className="flex-1 text-base font-semibold outline-none border-b pb-1"
                  style={{ color: '#1C1C1E', borderColor: '#EBEBF0' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 月間目標 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#8E8E93' }}>
            月間目標
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                目標通い回数
              </label>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setSettings(s => ({ ...s, targetSessions: Math.max(1, s.targetSessions - 1) }))}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                >
                  −
                </button>
                <span className="flex-1 text-center text-3xl font-black" style={{ color: '#1C1C1E' }}>
                  {settings.targetSessions}
                </span>
                <span className="text-sm font-medium" style={{ color: '#8E8E93' }}>回/月</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, targetSessions: s.targetSessions + 1 }))}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#FF6B35', color: 'white' }}
                >
                  ＋
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                目標ラウンド数
              </label>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setSettings(s => ({ ...s, targetRounds: Math.max(1, s.targetRounds - 5) }))}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#F8F4EF', color: '#1C1C1E' }}
                >
                  −
                </button>
                <span className="flex-1 text-center text-3xl font-black" style={{ color: '#1C1C1E' }}>
                  {settings.targetRounds}
                </span>
                <span className="text-sm font-medium" style={{ color: '#8E8E93' }}>R/月</span>
                <button
                  onClick={() => setSettings(s => ({ ...s, targetRounds: s.targetRounds + 5 }))}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#FF6B35', color: 'white' }}
                >
                  ＋
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* トレーナー管理 */}
        {trainers.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: '#8E8E93' }}>
              登録済みトレーナー
            </h2>
            <div className="flex flex-col gap-2">
              {trainers.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                  style={{ borderColor: '#F8F4EF' }}
                >
                  <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                    {t.name}
                  </span>
                  <button
                    onClick={() => handleDeleteTrainer(t.id)}
                    className="text-xs px-3 py-1 rounded-full"
                    style={{ backgroundColor: '#FFF0F0', color: '#FF3B30' }}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アプリ情報 */}
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#8E8E93' }}>
            アプリについて
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span style={{ color: '#8E8E93' }}>アプリ名</span>
              <span className="font-bold" style={{ color: '#1C1C1E' }}>KICKLOG</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#8E8E93' }}>データ保存先</span>
              <span style={{ color: '#1C1C1E' }}>このデバイス</span>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-sm active:opacity-90 transition-all"
          style={{ backgroundColor: saved ? '#34C759' : '#FF6B35' }}
        >
          {saved ? '✓ 保存しました' : '設定を保存'}
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
