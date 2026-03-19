'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const id = userId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
    if (id) router.push(`/u/${id}`)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-8" style={{ backgroundColor: '#F8F4EF' }}>
      <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: '#1C1C1E' }}>
        KICK<span style={{ color: '#FF6B35' }}>LOG</span>
      </h1>
      <p className="text-sm mb-12" style={{ color: '#8E8E93' }}>キックボクシング記録アプリ</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#8E8E93' }}>
            ユーザーID
          </label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="例: ikeda"
            className="w-full mt-2 text-base font-semibold outline-none border-b pb-1"
            style={{ color: '#1C1C1E', borderColor: '#EBEBF0' }}
            autoFocus
          />
          <p className="text-xs mt-2" style={{ color: '#8E8E93' }}>
            半角英数字で入力してください（例: ikeda, tanaka）
          </p>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-base font-bold text-white shadow-sm active:opacity-90"
          style={{ backgroundColor: '#FF6B35' }}
        >
          KICKLOGを開く
        </button>
      </form>
    </div>
  )
}
