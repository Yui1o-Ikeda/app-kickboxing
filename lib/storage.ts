import { getSupabase } from './supabase'
import { Session, AppSettings, RoundBreakdown } from './types'
import { DEFAULT_SETTINGS } from './constants'

// ── Sessions ──────────────────────────────────────────────

export async function getSessions(): Promise<Session[]> {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToSession)
}

export async function getSessionById(id: string): Promise<Session | null> {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data ? dbToSession(data) : null
}

export async function saveSession(session: Session): Promise<void> {
  const { error } = await getSupabase()
    .from('sessions')
    .upsert(sessionToDb(session))
  if (error) throw error
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from('sessions')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ── Settings ──────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error || !data) return DEFAULT_SETTINGS
  return {
    monthlyFee: data.monthly_fee,
    transportCost: data.transport_cost,
    targetSessions: data.target_sessions,
    targetRounds: data.target_rounds,
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await getSupabase()
    .from('app_settings')
    .upsert({
      id: 1,
      monthly_fee: settings.monthlyFee,
      transport_cost: settings.transportCost,
      target_sessions: settings.targetSessions,
      target_rounds: settings.targetRounds,
    })
  if (error) throw error
}

// ── DB mapping ────────────────────────────────────────────

function dbToSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    date: row.date as string,
    status: row.status as 'planned' | 'actual',
    totalRounds: row.total_rounds as number,
    roundBreakdown: (row.round_breakdown as RoundBreakdown[]) ?? [],
    intensity: ((row.intensity as number) ?? 3) as 1 | 2 | 3 | 4 | 5,
    comment: (row.comment as string) ?? '',
    trainerId: (row.trainer_id as string) ?? '',
    trainerName: (row.trainer_name as string) ?? '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function sessionToDb(s: Session) {
  return {
    id: s.id,
    date: s.date,
    status: s.status,
    total_rounds: s.totalRounds,
    round_breakdown: s.roundBreakdown,
    intensity: s.intensity,
    comment: s.comment,
    trainer_id: s.trainerId,
    trainer_name: s.trainerName,
    created_at: s.createdAt,
    updated_at: new Date().toISOString(),
  }
}

// ── Utilities ─────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}
