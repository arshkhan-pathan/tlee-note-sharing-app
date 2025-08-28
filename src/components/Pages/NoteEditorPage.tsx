'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Typography, Modal, TextField, Button, Fade } from '@mui/material'
import NoteEditor from '@/components/Common/NoteEditor'
import { BACKEND_URL } from '@/constants'

type Props = {
  dynamic_id: string
  initialContent: string
}

export default function NoteEditorPage({ dynamic_id, initialContent }: Props) {
  const [note, setNote] = useState(initialContent)
  const [isSyncing, setIsSyncing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [inputId, setInputId] = useState('')
  const [windowWidth, setWindowWidth] = useState<number | null>(null)

  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth)
      setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

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
    (value?: { content: string }) => {
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
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        padding: windowWidth && windowWidth <= 600 ? '0.25rem' : '0.5rem',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          marginBottom: windowWidth && windowWidth <= 600 ? '0.5rem' : '1rem',
        }}
      >
        <NoteEditor
          initialContent={note}
          onChange={onChange}
          isSyncing={isSyncing}
          setModalOpen={setModalOpen}
        />
      </div>

      <Box
        sx={{
          borderTop: '1px solid #444',
          paddingTop: windowWidth && windowWidth <= 600 ? 0.5 : 1,
          paddingX: windowWidth && windowWidth <= 600 ? 1 : 0,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontSize: windowWidth && windowWidth <= 600 ? '0.875rem' : '1rem',
            marginBottom: windowWidth && windowWidth <= 600 ? 0.5 : 1,
          }}
        >
          Currently editing <strong>/ {dynamic_id}</strong>
        </Typography>
        <Typography
          variant="body1"
          sx={{
            cursor: 'pointer',
            color: '#ffd54f',
            fontSize: windowWidth && windowWidth <= 600 ? '0.875rem' : '1rem',
          }}
          onClick={() => setModalOpen(true)}
        >
          Go to another Note
        </Typography>
      </Box>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(4px)',
              transition: 'opacity 300ms ease-in-out',
            },
          },
        }}
      >
        <Fade in={modalOpen}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'linear-gradient(135deg, #1e1e2f 0%, #3c3c5a 100%)',
              color: 'white',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              p: windowWidth && windowWidth <= 600 ? 3 : 5,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: windowWidth && windowWidth <= 600 ? 2 : 3,
              width: '95%',
              maxWidth: windowWidth && windowWidth <= 600 ? 350 : 420,
              outline: 'none',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              textAlign="center"
              sx={{
                mb: 1,
                fontSize: windowWidth && windowWidth <= 600 ? '1.25rem' : '1.5rem',
              }}
            >
              Enter Note ID
            </Typography>

            <TextField
              variant="filled"
              placeholder="e.g. myNote123"
              fullWidth
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              InputProps={{
                sx: {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  color: 'white',
                  '& .MuiInputBase-input': {
                    padding: '12px',
                  },
                },
              }}
            />

            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #fdd835 30%, #fbc02d 90%)',
                color: '#2c2c2c',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(251, 192, 45, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #fbc02d 30%, #fdd835 90%)',
                  boxShadow: '0 6px 20px rgba(251, 192, 45, 0.7)',
                },
                transition: 'all 0.3s ease',
                textTransform: 'none',
                py: windowWidth && windowWidth <= 600 ? 1 : 1.5,
                fontSize: windowWidth && windowWidth <= 600 ? '0.875rem' : '1rem',
              }}
              onClick={() => {
                setModalOpen(false)
                const cleanedId = inputId.trim().toLowerCase()
                if (cleanedId) {
                  router.push(`/${cleanedId}`)
                }
              }}
              disabled={!inputId.trim()}
            >
              Go
            </Button>
          </Box>
        </Fade>
      </Modal>
    </main>
  )
}
