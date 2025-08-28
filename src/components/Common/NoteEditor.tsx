import React, { useState, useEffect, ChangeEvent } from 'react'
import MDEditor from '@uiw/react-md-editor'

type NoteEditorProps = {
  initialContent?: string
  onChange?: (data: { content: string }) => void
  isSyncing?: boolean
  setModalOpen?: (isOpen: boolean) => void
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialContent = '',
  onChange,
  isSyncing = false,
  setModalOpen = (f) => f,
}) => {
  const [content, setContent] = useState(initialContent)
  const [windowWidth, setWindowWidth] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setWindowWidth(window.innerWidth)
      setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const isMobile = windowWidth !== null && windowWidth <= 600

  const handleTextChange = (value?: string) => {
    const newValue = value || ''
    setContent(newValue)
    onChange?.({ content: newValue })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div style={{ ...styles.page, padding: isMobile ? 10 : 20 }}>
      <header style={styles.header}>
        <div style={styles.logo}>Tlee</div>

        {isMobile ? (
          <div style={styles.mobileMenu}>
            {isSyncing && <span style={styles.syncIndicator}>Saving...</span>}
            <button style={styles.actionButton} onClick={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button style={styles.actionButton} onClick={handleCopy}>
              Copy
            </button>
            <button style={styles.menuIcon} onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
            {menuOpen && (
              <div style={styles.mobileActions}>
                <button style={styles.actionButton} onClick={() => setModalOpen(true)}>
                  Go to Page
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={styles.actions}>
            {isSyncing && <span style={styles.syncIndicator}>Saving...</span>}
            <button style={styles.actionButton} onClick={() => setIsPreviewMode(!isPreviewMode)}>
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            <button style={styles.actionButton} onClick={() => setModalOpen(true)}>
              Go to Page
            </button>
            <button style={styles.actionButton} onClick={handleCopy}>
              Copy to Clipboard
            </button>
          </div>
        )}
      </header>

      <div style={styles.editorContainer}>
        <MDEditor
          value={content}
          onChange={handleTextChange}
          height={isMobile ? '80vh' : '80vh'}
          preview={isPreviewMode ? 'preview' : 'edit'}
          style={styles.markdownEditor}
          textareaProps={{
            placeholder: `Write a note in this area!! 

Markdown Examples:
# Heading 1
## Heading 2
**Bold text**
*Italic text*
- Bullet point
1. Numbered list
[Link text](url)
![Alt text](image-url)
\`inline code\`
\`\`\`javascript
// code block
\`\`\`
> Blockquote`,
            style: {
              fontSize: isMobile ? 14 : 16,
              lineHeight: 1.5,
              color: '#fffde7',
              backgroundColor: '#333333',
              border: 'none',
              outline: 'none',
              fontFamily: 'Arial, sans-serif',
            },
          }}
        />
      </div>

      {!isMobile && (
        <div style={styles.shortcutsInfo}>
          <div style={{ color: '#888', fontSize: '12px' }}>
            💡 <strong>Keyboard Shortcuts:</strong> Ctrl/Cmd + B (Bold), Ctrl/Cmd + I (Italic),
            Ctrl/Cmd + K (Link)
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    height: '100%',
    boxSizing: 'border-box',
  },
  header: {
    backgroundColor: '#2c2c2c',
    borderBottom: '1px solid #444',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#f0f0f0',
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
    fontWeight: 'bold',
  },
  logo: {
    fontSize: 24,
    color: '#ffd54f',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    background: 'none',
    border: '1px solid #ffd54f',
    borderRadius: 4,
    padding: '6px 10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#ffd54f',
  },
  syncIndicator: {
    fontSize: 12,
    color: '#ccc',
    marginRight: 10,
  },
  menuIcon: {
    fontSize: 22,
    background: 'none',
    border: 'none',
    color: '#ffd54f',
    cursor: 'pointer',
  },
  mobileMenu: {
    position: 'relative',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  mobileActions: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  editorContainer: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#333333',
    border: '2px solid #555555',
    borderLeft: '6px solid #ff7043',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.7)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  markdownEditor: {
    backgroundColor: '#333333',
    color: '#fffde7',
  },
  shortcutsInfo: {
    marginTop: 10,
    padding: '0 15px',
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: 4,
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.7)',
  },
}

export default NoteEditor
