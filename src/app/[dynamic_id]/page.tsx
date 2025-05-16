import { Metadata } from 'next'
import NoteEditorPage from '@/components/Pages/NoteEditorPage'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ dynamic_id: string }>
}): Promise<Metadata> {
  const { dynamic_id: id } = await params

  return {
    title: `${id} @ Tlee 🔥`,
    description: 'Edit your note with live autosave.',
    openGraph: {
      title: `Edit Note ${id}`,
      description: 'Edit your note in real-time.',
    },
  }
}

export default function Page() {
  return <NoteEditorPage />
}
