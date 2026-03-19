import { redirect } from 'next/navigation'

export default function OldEditSessionPage({ params }: { params: { id: string } }) {
  redirect(`/u/default/sessions/${params.id}`)
}
