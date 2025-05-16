'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Box, CircularProgress, Typography, Fade } from '@mui/material'
import NoteEditor from '@/components/NoteEditor'
import { BACKEND_URL } from '@/constants'

export default function NoteEditorPage() {
  const { dynamic_id } = useParams() as { dynamic_id: string }
  const [note, setNote] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setNote(data?.note || '')
        } else {
          console.log('Failed to fetch note:', res.statusText)
        }
      } catch (error) {
        console.error('Error fetching note:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (dynamic_id) {
      fetchNote()
    }
  }, [dynamic_id])

  const handleSubmit = useCallback(
    async (newNote: string) => {
      try {
        const payload = {
          note: newNote,
          author: 'string',
          identifier: dynamic_id,
        }

        const res = await fetch(`${BACKEND_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('Failed to save note')
        console.log('Note saved successfully')
      } catch (error) {
        console.error('Error saving note:', error)
      } finally {
        setIsSyncing(false)
      }
    },
    [dynamic_id]
  )

  const onChange = useCallback(
    (value: { content: string } | undefined) => {
      const newContent = value?.content || ''
      setNote(newContent)
      setIsSyncing(true)

      if (debounceRef.current) clearTimeout(debounceRef.current)

      debounceRef.current = setTimeout(() => {
        handleSubmit(newContent)
      }, 2000)
    },
    [handleSubmit]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <main style={{ padding: '1rem' }}>
      {isLoading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress size={40} />
          <Typography variant="h6" color="white" mt={2}>
            Fetching your note...
          </Typography>
        </Box>
      ) : (
        <>
          <NoteEditor initialContent={note} onChange={onChange} />
          {isSyncing && (
            <Fade in={true}>
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                mb={2}
                bgcolor="#222"
                p={1}
                borderRadius={1}
                width="fit-content"
                color="#fff"
              >
                <CircularProgress size={20} color="warning" />
                <Typography variant="body2">Saving changes...</Typography>
              </Box>
            </Fade>
          )}
        </>
      )}
    </main>
  )
}
