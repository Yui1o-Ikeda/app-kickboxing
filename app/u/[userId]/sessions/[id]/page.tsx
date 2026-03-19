'use client'

import { useParams } from 'next/navigation'
import SessionForm from '@/components/SessionForm'

export default function EditSessionPage() {
  const { userId, id } = useParams<{ userId: string; id: string }>()
  return <SessionForm sessionId={id} userId={userId} />
}
