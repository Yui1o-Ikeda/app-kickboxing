import { Session, AppSettings, MonthlyStats } from './types'

export function computeMonthlyStats(
  allSessions: Session[],
  settings: AppSettings,
  year: number,
  month: number
): MonthlyStats {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const sessions = allSessions.filter(s => s.date.startsWith(prefix))

  const actual = sessions.filter(s => s.status === 'actual')
  const planned = sessions.filter(s => s.status === 'planned')
  const totalRounds = actual.reduce((sum, s) => sum + s.totalRounds, 0)
  const totalCost = settings.monthlyFee + actual.length * settings.transportCost

  const intensities = actual.filter(s => s.intensity).map(s => s.intensity)
  const avgIntensity = intensities.length > 0
    ? intensities.reduce((a, b) => a + b, 0) / intensities.length
    : null

  const plannedRounds = planned.reduce((sum, s) => sum + s.totalRounds, 0)
  const projectedSessions = actual.length + planned.length
  const projectedRounds = totalRounds + plannedRounds
  const projectedTotalCost = settings.monthlyFee + projectedSessions * settings.transportCost

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
    projectedSessions,
    projectedRounds,
    projectedTotalCost,
    projectedCostPerSession: projectedSessions > 0 ? Math.round(projectedTotalCost / projectedSessions) : null,
    projectedCostPerRound: projectedRounds > 0 ? Math.round(projectedTotalCost / projectedRounds) : null,
  }
}
