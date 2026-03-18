'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SessionForm from '@/components/SessionForm'

function NewSessionContent() {
  const searchParams = useSearchParams()
  const date = searchParams.get('date') ?? undefined
  return <SessionForm initialDate={date} />
}

export default function NewSessionPage() {
  return (
    <Suspense>
      <NewSessionContent />
    </Suspense>
  )
}
