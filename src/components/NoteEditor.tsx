'use client'

import React, { useState, useEffect, MouseEvent } from 'react'
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Paper,
  Button,
  Stack,
} from '@mui/material'
import Editor, { OnChange } from '@monaco-editor/react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

type EditorMode = 'text' | 'code'

type NoteEditorProps = {
  initialMode?: EditorMode
  initialContent?: string
  onChange?: (data: { mode: EditorMode; content: string }) => void
}

export default function NoteEditor({
  initialMode = 'text',
  initialContent = '',
  onChange,
}: NoteEditorProps) {
  const [mode, setMode] = useState<EditorMode>(initialMode)
  const [content, setContent] = useState(initialContent)

  useEffect(() => {
    setMode(initialMode)
    setContent(initialContent)
  }, [initialMode, initialContent])

  const handleModeChange = (_: MouseEvent<HTMLElement>, newMode: EditorMode | null) => {
    if (newMode && newMode !== mode) {
      setMode(newMode)
      onChange?.({ mode: newMode, content })
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setContent(value)
    onChange?.({ mode, content: value })
  }

  const handleEditorChange: OnChange = (value) => {
    const newValue = value || ''
    setContent(newValue)
    onChange?.({ mode, content: newValue })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Box px={{ xs: 2, sm: 4 }} py={{ xs: 3, sm: 5 }} maxWidth="lg" mx="auto">
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          mb={2}
          gap={2}
        >
          <Typography variant="h5">Note Editor</Typography>

          <Stack direction="row" spacing={2}>
            <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small">
              <ToggleButton value="text">Text</ToggleButton>
              <ToggleButton value="code">Code</ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopy}
            >
              Copy
            </Button>
          </Stack>
        </Box>

        {mode === 'text' ? (
          <TextField
            multiline
            fullWidth
            rows={10}
            value={content}
            onChange={handleTextChange}
            placeholder="Type your notes here..."
          />
        ) : (
          <Box sx={{ height: { xs: 300, sm: 400 } }}>
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={content}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  )
}
