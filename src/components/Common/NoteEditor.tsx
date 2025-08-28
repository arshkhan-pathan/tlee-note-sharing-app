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
  const [isDarkTheme, setIsDarkTheme] = useState(false)

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

  // Auto-detect system theme preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleThemeChange = (e: MediaQueryListEvent) => {
        setIsDarkTheme(e.matches)
      }

      // Set initial theme based on system preference
      setIsDarkTheme(mediaQuery.matches)

      // Listen for system theme changes
      mediaQuery.addEventListener('change', handleThemeChange)

      // Cleanup
      return () => mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [])

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
    <div style={{ ...styles.page, padding: isMobile ? '0.5rem' : '1rem' }}>
      <header style={styles.header}>
        <div style={styles.logo}>Tlee</div>

        {isMobile ? (
          <div style={styles.mobileMenu}>
            {isSyncing && <span style={styles.syncIndicator}>Saving...</span>}
            <button
              style={{
                ...styles.actionButton,
                backgroundColor: isPreviewMode ? '#ff7043' : 'transparent',
                color: isPreviewMode ? '#fff' : '#ffd54f',
                marginRight: '8px',
              }}
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
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

      <div style={styles.editorContainer} className={isDarkTheme ? 'dark-theme' : ''}>
        <MDEditor
          value={content}
          onChange={handleTextChange}
          height={isMobile ? '85vh' : '80vh'}
          preview={isPreviewMode ? 'preview' : 'edit'}
          style={styles.markdownEditor}
          textareaProps={{
            placeholder: isMobile
              ? 'Start typing your note here...\n\nQuick markdown examples:\n# Heading\n**Bold text**\n*Italic text*\n- List item\n[Link](url)'
              : 'Start typing your note here...\n\nQuick markdown examples:\n# Heading\n**Bold text**\n*Italic text**\n- List item\n[Link](url)',
            style: {
              fontSize: isMobile ? '16px' : '14px',
              lineHeight: '1.6',
              color: '#ffffff',
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontFamily: 'monospace',
            },
          }}
        />

        {/* Theme toggle button positioned within preview section */}
        {isPreviewMode && (
          <div className="theme-toggle-container">
            <button
              className="theme-toggle-button"
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              title={
                isDarkTheme
                  ? 'Switch to Light Theme (System: Dark)'
                  : 'Switch to Dark Theme (System: Light)'
              }
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        )}
      </div>

      {isMobile && (
        <div style={styles.mobileFormattingGuide}>
          <div style={{ color: '#888', fontSize: '11px', textAlign: 'center' }}>
            💡 <strong>Markdown:</strong> # ## ** * - [text](url) \`code\` quote
          </div>
        </div>
      )}

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
    fontSize: '14px',
    whiteSpace: 'nowrap',
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
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'nowrap',
    minWidth: '200px',
    justifyContent: 'flex-end',
  },
  mobileActions: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: '120px',
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
    position: 'relative',
  },
  markdownEditor: {
    width: '100%',
    height: '100%',
  },
  shortcutsInfo: {
    marginTop: 10,
    padding: '0 15px',
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: 4,
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.7)',
  },
  mobileFormattingGuide: {
    marginTop: 10,
    padding: '0 15px',
    backgroundColor: '#2c2c2c',
    border: '1px solid #444',
    borderRadius: 4,
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.7)',
  },
}

export default NoteEditor
