import { getSupabase } from './supabase'
import { Session, AppSettings, RoundBreakdown } from './types'
import { DEFAULT_SETTINGS } from './constants'

// ── Sessions ──────────────────────────────────────────────

export async function getSessions(userId: string): Promise<Session[]> {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []).map(dbToSession)
}

export async function getSessionById(id: string, userId: string): Promise<Session | null> {
  const { data, error } = await getSupabase()
    .from('sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data ? dbToSession(data) : null
}

export async function saveSession(session: Session, userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('sessions')
    .upsert(sessionToDb(session, userId))
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

export async function getSettings(userId: string): Promise<AppSettings> {
  const { data, error } = await getSupabase()
    .from('app_settings')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error || !data) return DEFAULT_SETTINGS
  return {
    monthlyFee: data.monthly_fee,
    transportCost: data.transport_cost,
    targetSessions: data.target_sessions,
    targetRounds: data.target_rounds,
  }
}

export async function saveSettings(settings: AppSettings, userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from('app_settings')
    .upsert({
      user_id: userId,
      monthly_fee: settings.monthlyFee,
      transport_cost: settings.transportCost,
      target_sessions: settings.targetSessions,
      target_rounds: settings.targetRounds,
    }, { onConflict: 'user_id' })
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

function sessionToDb(s: Session, userId: string) {
  return {
    id: s.id,
    user_id: userId,
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
