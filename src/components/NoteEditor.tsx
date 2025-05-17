import React, { useState, useEffect, ChangeEvent } from 'react'

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

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setContent(value)
    onChange?.({ content: value })
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd

    if (e.key === 'Tab') {
      e.preventDefault()
      if (start !== end) {
        const lines = content.slice(start, end).split('\n')
        const before = content.slice(0, start)
        const after = content.slice(end)
        const indentedLines = lines.map((line) => '  ' + line).join('\n')
        const newValue = before + indentedLines + after
        setContent(newValue)
        requestAnimationFrame(() => {
          target.selectionStart = start
          target.selectionEnd = end + lines.length * 2
        })
      } else {
        const newValue = content.slice(0, start) + '  ' + content.slice(end)
        setContent(newValue)
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2
        })
      }
    } else if (e.key === 'Enter') {
      const before = content.slice(0, start)
      const after = content.slice(end)
      const lineStart = before.lastIndexOf('\n') + 1
      const currentLine = before.slice(lineStart)
      const bulletMatch = currentLine.match(/^(\s*([-*+])\s)/)
      const numberMatch = currentLine.match(/^(\s*)(\d+)([.)])\s/)
      const checkboxMatch = currentLine.match(/^(\s*[-*+]\s\[[ xX]\]\s)/)

      e.preventDefault()

      let insertText = '\n'
      if (checkboxMatch) {
        insertText +=
          currentLine.trim() === checkboxMatch[0].trim()
            ? checkboxMatch[1].replace(/[-*+]\s\[[ xX]\]\s/, '')
            : checkboxMatch[1]
      } else if (bulletMatch) {
        insertText +=
          currentLine.trim() === bulletMatch[1].trim()
            ? bulletMatch[1].replace(/[-*+]\s/, '')
            : bulletMatch[1]
      } else if (numberMatch) {
        const indent = numberMatch[1]
        const number = parseInt(numberMatch[2], 10)
        const delimiter = numberMatch[3]
        insertText +=
          currentLine.trim() === `${number}${delimiter}`
            ? indent
            : indent + (number + 1) + delimiter + ' '
      } else {
        const indentMatch = currentLine.match(/^(\s*)/)
        insertText += indentMatch ? indentMatch[1] : ''
      }

      const newValue = before + insertText + after
      setContent(newValue)
      requestAnimationFrame(() => {
        const cursorPos = start + insertText.length
        target.selectionStart = target.selectionEnd = cursorPos
      })
    }
  }

  return (
    <div style={{ ...styles.page, padding: isMobile ? 10 : 20 }}>
      <header style={styles.header}>
        <div style={styles.logo}>Tlee</div>

        {isMobile ? (
          <div style={styles.mobileMenu}>
            {isSyncing && <span style={styles.syncIndicator}>Saving...</span>}
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
            <button style={styles.actionButton} onClick={() => setModalOpen(true)}>
              Go to Page
            </button>
            <button style={styles.actionButton} onClick={handleCopy}>
              Copy to Clipboard
            </button>
          </div>
        )}
      </header>

      <textarea
        placeholder="Write a note in this area!!"
        value={content}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        style={{
          ...styles.textArea,
          height: isMobile ? '80vh' : '80vh',
          fontSize: isMobile ? 14 : 16,
        }}
      />
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
  textArea: {
    marginTop: 10,
    width: '100%',
    backgroundColor: '#333333',
    border: '2px solid #555555',
    borderLeft: '6px solid #ff7043',
    padding: 15,
    fontFamily: 'Arial, sans-serif',
    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.7)',
    resize: 'none',
    lineHeight: 1.5,
    color: '#fffde7',
  },
}

export default NoteEditor
