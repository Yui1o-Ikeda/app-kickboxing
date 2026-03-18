'use client'

import { Session, Trainer, AppSettings, MonthlyStats } from './types'
import { DEFAULT_SETTINGS } from './constants'

const KEYS = {
  sessions: 'kb_sessions',
  trainers: 'kb_trainers',
  settings: 'kb_settings',
}

// Sessions
export function getSessions(): Session[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEYS.sessions)
  return raw ? JSON.parse(raw) : []
}

export function saveSession(session: Session): void {
  const sessions = getSessions()
  const idx = sessions.findIndex(s => s.id === session.id)
  if (idx >= 0) {
    sessions[idx] = session
  } else {
    sessions.push(session)
  }
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions))
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter(s => s.id !== id)
  localStorage.setItem(KEYS.sessions, JSON.stringify(sessions))
}

export function getSessionById(id: string): Session | null {
  return getSessions().find(s => s.id === id) ?? null
}

export function getSessionsByMonth(year: number, month: number): Session[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return getSessions().filter(s => s.date.startsWith(prefix))
}

// Trainers
export function getTrainers(): Trainer[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEYS.trainers)
  return raw ? JSON.parse(raw) : []
}

export function saveTrainer(trainer: Trainer): void {
  const trainers = getTrainers()
  const idx = trainers.findIndex(t => t.id === trainer.id)
  if (idx >= 0) {
    trainers[idx] = trainer
  } else {
    trainers.push(trainer)
  }
  localStorage.setItem(KEYS.trainers, JSON.stringify(trainers))
}

export function deleteTrainer(id: string): void {
  const trainers = getTrainers().filter(t => t.id !== id)
  localStorage.setItem(KEYS.trainers, JSON.stringify(trainers))
}

// Settings
export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  const raw = localStorage.getItem(KEYS.settings)
  return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings))
}

// Stats
export function calcMonthlyStats(year: number, month: number): MonthlyStats {
  const sessions = getSessionsByMonth(year, month)
  const settings = getSettings()

  const actual = sessions.filter(s => s.status === 'actual')
  const planned = sessions.filter(s => s.status === 'planned')

  const totalRounds = actual.reduce((sum, s) => sum + s.totalRounds, 0)
  const totalCost = settings.monthlyFee + actual.length * settings.transportCost

  const intensities = actual.filter(s => s.intensity).map(s => s.intensity)
  const avgIntensity = intensities.length > 0
    ? intensities.reduce((a, b) => a + b, 0) / intensities.length
    : null

  return {
    year,
    month,
    actualSessions: actual.length,
    plannedSessions: planned.length,
    totalRounds,
    totalCost,
    costPerSession: actual.length > 0 ? Math.round(totalCost / actual.length) : null,
    costPerRound: totalRounds > 0 ? Math.round(totalCost / totalRounds) : null,
    avgIntensity,
  }
}

// Utilities
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}
