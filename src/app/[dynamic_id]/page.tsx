import { Metadata } from 'next'
import NoteEditorPage from '@/components/Pages/NoteEditorPage'
import { BACKEND_URL } from '@/constants'

type PageProps = {
  params: {
    dynamic_id: string
  }
}

export async function generateMetadata({
  params,
}: {
  params: { dynamic_id: string }
}): Promise<Metadata> {
  const { dynamic_id: id } = await params

  return {
    title: `${id} @ Tlee 🔥`,
    description: 'Edit your note with live autosave.',
  }
}

export default async function Page({ params }: PageProps) {
  const { dynamic_id } = await params
  const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
    cache: 'no-store',
  })
  const data = await res.json()

  return <NoteEditorPage dynamic_id={dynamic_id} initialContent={data?.note || ''} />
}
