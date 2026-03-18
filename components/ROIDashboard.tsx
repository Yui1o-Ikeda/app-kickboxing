'use client'

import { MonthlyStats, AppSettings } from '@/lib/types'

interface ROIDashboardProps {
  stats: MonthlyStats
  settings: AppSettings
}

function ProgressBar({ value, max, color = '#FF6B35' }: { value: number; max: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  sub,
  accent = false,
}: {
  label: string
  value: string | number
  unit?: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ backgroundColor: accent ? '#FF6B35' : '#F8F4EF' }}
    >
      <span
        className="text-xs font-medium"
        style={{ color: accent ? 'rgba(255,255,255,0.8)' : '#8E8E93' }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className="text-2xl font-bold"
          style={{ color: accent ? 'white' : '#1C1C1E' }}
        >
          {value}
        </span>
        {unit && (
          <span
            className="text-sm font-medium"
            style={{ color: accent ? 'rgba(255,255,255,0.9)' : '#8E8E93' }}
          >
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <span
          className="text-xs"
          style={{ color: accent ? 'rgba(255,255,255,0.75)' : '#8E8E93' }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}

export default function ROIDashboard({ stats, settings }: ROIDashboardProps) {
  const sessionPct = Math.round((stats.actualSessions / settings.targetSessions) * 100)
  const roundPct = Math.round((stats.totalRounds / settings.targetRounds) * 100)

  const formatYen = (v: number | null) =>
    v === null ? '—' : `¥${v.toLocaleString()}`

  return (
    <div className="flex flex-col gap-4">
      {/* ROIメインカード */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base" style={{ color: '#1C1C1E' }}>
            今月のROI
          </h2>
          <span className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ backgroundColor: '#FFF0EB', color: '#FF6B35' }}
          >
            ¥{stats.totalCost.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="1回あたり単価"
            value={stats.costPerSession !== null ? `¥${stats.costPerSession.toLocaleString()}` : '—'}
            sub={stats.actualSessions > 0 ? `${stats.actualSessions}回参加` : '実績なし'}
            accent
          />
          <StatCard
            label="1ラウンド単価"
            value={stats.costPerRound !== null ? `¥${stats.costPerRound.toLocaleString()}` : '—'}
            sub={stats.totalRounds > 0 ? `${stats.totalRounds}R完了` : '実績なし'}
          />
        </div>
      </div>

      {/* 目標進捗 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-base mb-4" style={{ color: '#1C1C1E' }}>
          目標進捗
        </h2>

        <div className="flex flex-col gap-4">
          {/* 通った回数 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                通った回数
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold" style={{ color: '#FF6B35' }}>
                  {stats.actualSessions}
                </span>
                <span className="text-xs" style={{ color: '#8E8E93' }}>
                  / {settings.targetSessions}回
                </span>
                <span
                  className="text-xs font-medium ml-1 px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: sessionPct >= 100 ? '#DCFCE7' : '#FFF0EB',
                    color: sessionPct >= 100 ? '#16A34A' : '#FF6B35',
                  }}
                >
                  {sessionPct}%
                </span>
              </div>
            </div>
            <ProgressBar
              value={stats.actualSessions}
              max={settings.targetSessions}
              color={sessionPct >= 100 ? '#34C759' : '#FF6B35'}
            />
            {stats.plannedSessions > 0 && (
              <p className="text-xs mt-1" style={{ color: '#8E8E93' }}>
                予定 {stats.plannedSessions}回 あと {Math.max(0, settings.targetSessions - stats.actualSessions - stats.plannedSessions)}回
              </p>
            )}
          </div>

          {/* ラウンド数 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                ラウンド数
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold" style={{ color: '#FF6B35' }}>
                  {stats.totalRounds}
                </span>
                <span className="text-xs" style={{ color: '#8E8E93' }}>
                  / {settings.targetRounds}R
                </span>
                <span
                  className="text-xs font-medium ml-1 px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: roundPct >= 100 ? '#DCFCE7' : '#FFF0EB',
                    color: roundPct >= 100 ? '#16A34A' : '#FF6B35',
                  }}
                >
                  {roundPct}%
                </span>
              </div>
            </div>
            <ProgressBar
              value={stats.totalRounds}
              max={settings.targetRounds}
              color={roundPct >= 100 ? '#34C759' : '#FF6B35'}
            />
          </div>

          {/* 平均追込み度 */}
          {stats.avgIntensity !== null && (
            <div className="pt-2 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#1C1C1E' }}>
                  平均追込み度
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className="text-base"
                      style={{ opacity: i <= Math.round(stats.avgIntensity!) ? 1 : 0.25 }}
                    >
                      🔥
                    </span>
                  ))}
                  <span className="text-sm font-bold ml-1" style={{ color: '#FF6B35' }}>
                    {stats.avgIntensity.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 費用内訳 */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-base mb-3" style={{ color: '#1C1C1E' }}>
          費用内訳
        </h2>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span style={{ color: '#8E8E93' }}>月会費</span>
            <span style={{ color: '#1C1C1E' }}>¥{settings.monthlyFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: '#8E8E93' }}>交通費 × {stats.actualSessions}回</span>
            <span style={{ color: '#1C1C1E' }}>
              ¥{(settings.transportCost * stats.actualSessions).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-50">
            <span style={{ color: '#1C1C1E' }}>合計</span>
            <span style={{ color: '#FF6B35' }}>¥{stats.totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
