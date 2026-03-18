import { AppSettings, RoundType } from './types'

export const DEFAULT_SETTINGS: AppSettings = {
  monthlyFee: 17600,
  transportCost: 380,
  targetSessions: 6,
  targetRounds: 50,
}

export const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  kick: 'キック',
  punch: 'パンチ',
  combo: 'コンビ',
  mitt: 'ミット',
  sparring: 'スパーリング',
  other: 'その他',
}

export const ROUND_TYPES: RoundType[] = ['kick', 'punch', 'combo', 'mitt', 'sparring', 'other']

export const INTENSITY_LABELS: Record<number, string> = {
  1: 'ウォームアップ',
  2: '軽め',
  3: '普通',
  4: 'ハード',
  5: '限界突破',
}

export const INTENSITY_COLORS: Record<number, string> = {
  1: '#4ADE80',
  2: '#86EFAC',
  3: '#FCD34D',
  4: '#FB923C',
  5: '#EF4444',
}
