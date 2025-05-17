'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Box, CircularProgress, Typography, Modal, TextField, Button, Fade } from '@mui/material'
import NoteEditor from '@/components/NoteEditor'
import { BACKEND_URL } from '@/constants'

type Params = {
  dynamic_id?: string
}

export default function NoteEditorPage() {
  const params = useParams() as Params
  const dynamic_id = params.dynamic_id || ''

  const [note, setNote] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [inputId, setInputId] = useState('')

  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`${BACKEND_URL}/notes/${dynamic_id}`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setNote(data?.note || '')
        } else {
          console.error('Failed to fetch note:', res.statusText)
        }
      } catch (error) {
        console.error('Error fetching note:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (dynamic_id) fetchNote()
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

  // Fix type for onChange param — NoteEditor should accept `{ content: string } | undefined`
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
      {isLoading ? (
        <Box textAlign="center" mt="auto" mb="auto">
          <CircularProgress size={40} />
          <Typography variant="h6" mt={2}>
            Fetching your note...
          </Typography>
        </Box>
      ) : (
        <>
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

          <Box
            sx={{
              borderTop: '1px solid #444',
              paddingTop: 1,
            }}
          >
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
                  InputLabelProps={{
                    sx: {
                      color: 'rgba(255,255,255,0.7)',
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
                    if (inputId.trim()) {
                      router.push(`/${inputId.trim()}`)
                    }
                  }}
                  disabled={!inputId.trim()}
                >
                  Go
                </Button>
              </Box>
            </Fade>
          </Modal>
        </>
      )}
    </main>
  )
}
