export type RoundType = 'kick' | 'punch' | 'combo' | 'mitt' | 'sparring' | 'other'

export interface RoundBreakdown {
  type: RoundType
  count: number
}

export type SessionStatus = 'planned' | 'actual'

export interface Session {
  id: string
  date: string // ISO: yyyy-mm-dd
  status: SessionStatus
  totalRounds: number
  roundBreakdown: RoundBreakdown[]
  intensity: 1 | 2 | 3 | 4 | 5 // 追込み度
  comment: string
  trainerId: string
  trainerName: string
  createdAt: string
  updatedAt: string
}

export interface Trainer {
  id: string
  name: string
}

export interface AppSettings {
  monthlyFee: number       // 17600
  transportCost: number    // 380
  targetSessions: number   // 6
  targetRounds: number     // 50
}

export interface MonthlyStats {
  year: number
  month: number
  actualSessions: number
  plannedSessions: number
  totalRounds: number
  totalCost: number
  costPerSession: number | null
  costPerRound: number | null
  avgIntensity: number | null
}
