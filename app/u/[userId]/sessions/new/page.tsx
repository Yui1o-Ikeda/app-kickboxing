'use client'

import { Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import SessionForm from '@/components/SessionForm'

function NewSessionContent() {
  const { userId } = useParams<{ userId: string }>()
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? undefined
  return <SessionForm initialDate={date} userId={userId} />
}

export default function NewSessionPage() {
  return (
    <Suspense>
      <NewSessionContent />
    </Suspense>
  )
}
