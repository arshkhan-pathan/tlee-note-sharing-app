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

  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
        padding: '1rem',
        boxSizing: 'border-box',
        color: 'white',
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          marginBottom: '1rem',
        }}
      >
        <NoteEditor
          initialContent={note}
          onChange={onChange}
          isSyncing={isSyncing}
          setModalOpen={setModalOpen}
        />
      </div>

      <Box sx={{ borderTop: '1px solid #444', paddingTop: 1 }}>
        <Typography variant="body1">
          Currently editing <strong>/ {dynamic_id}</strong>
        </Typography>
        <Typography
          variant="body1"
          sx={{ cursor: 'pointer', color: '#ffd54f' }}
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
              p: 5,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              width: '90%',
              maxWidth: 420,
              outline: 'none',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            <Typography variant="h5" fontWeight="bold" textAlign="center" sx={{ mb: 1 }}>
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
                py: 1.5,
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
