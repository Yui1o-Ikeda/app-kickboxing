'use client'

import { useParams } from 'next/navigation'
import SessionForm from '@/components/SessionForm'

export default function EditSessionPage() {
  const { id } = useParams<{ id: string }>()
  return <SessionForm sessionId={id} />
}
