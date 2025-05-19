import { Metadata } from 'next'
import NoteEditorPage from '@/components/Pages/NoteEditorPage'
import { BACKEND_URL } from '@/constants'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dynamic_id: string }>
}): Promise<Metadata> {
  const { dynamic_id: id } = await params

  return {
    title: `${id} @ Tlee 🔥`,
    description: 'Edit your note with live autosave.',
  }
}

export default async function Page({ params }: { params: Promise<{ dynamic_id: string }> }) {
  const { dynamic_id } = await params
  const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
    cache: 'no-store',
  })
  const data = await res.json()

  return <NoteEditorPage dynamic_id={dynamic_id} initialContent={data?.note || ''} />
}
