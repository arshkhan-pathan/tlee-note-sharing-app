import React, { useState, useEffect, ChangeEvent } from 'react'

type NoteEditorProps = {
  initialContent?: string
  onChange?: (data: { content: string }) => void
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialContent = '', onChange }) => {
  const [content, setContent] = useState(initialContent)
  const [windowWidth, setWindowWidth] = useState<number | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)

      const handleResize = () => setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

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

    // Tab: Insert 2 spaces or indent selection
    if (e.key === 'Tab') {
      e.preventDefault()

      if (start !== end) {
        // Indent selected lines
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
        // Insert 2 spaces at cursor
        const newValue = content.slice(0, start) + '  ' + content.slice(end)
        setContent(newValue)
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 2
        })
      }
    }

    // Auto-indent and list continuation on Enter
    else if (e.key === 'Enter') {
      const before = content.slice(0, start)
      const after = content.slice(end)

      const lineStart = before.lastIndexOf('\n') + 1
      const currentLine = before.slice(lineStart)

      // Match bullet, number, or checkbox lists
      const bulletMatch = currentLine.match(/^(\s*([-*+])\s)/)
      const numberMatch = currentLine.match(/^(\s*)(\d+)([.)])\s/)
      const checkboxMatch = currentLine.match(/^(\s*[-*+]\s\[[ xX]\]\s)/)

      e.preventDefault()

      let insertText = '\n' // default new line

      if (checkboxMatch) {
        // Continue checkbox list if not empty line
        if (currentLine.trim() === checkboxMatch[0].trim()) {
          // If current line is just checkbox markup, stop list
          insertText += checkboxMatch[1].replace(/[-*+]\s\[[ xX]\]\s/, '')
        } else {
          insertText += checkboxMatch[1]
        }
      } else if (bulletMatch) {
        if (currentLine.trim() === bulletMatch[1].trim()) {
          // User pressed enter on empty bullet line, exit list
          insertText += bulletMatch[1].replace(/[-*+]\s/, '')
        } else {
          insertText += bulletMatch[1]
        }
      } else if (numberMatch) {
        const indent = numberMatch[1]
        const number = parseInt(numberMatch[2], 10)
        const delimiter = numberMatch[3]

        if (currentLine.trim() === `${number}${delimiter}`) {
          // User pressed enter on empty number line, exit list
          insertText += indent
        } else {
          insertText += indent + (number + 1) + delimiter + ' '
        }
      } else {
        // Normal indent (spaces)
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

  const isMobile = windowWidth !== null && windowWidth <= 600

  return (
    <div
      style={{
        ...styles.page,
        padding: isMobile ? 10 : 20,
      }}
    >
      <header
        style={{
          ...styles.header,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 10 : 0,
        }}
      >
        <div style={styles.logo}>Tlee</div>
        <div
          style={{
            ...styles.actions,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 6 : 10,
            marginTop: isMobile ? 8 : 0,
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <button style={styles.actionButton} onClick={handleCopy}>
            Copy to Clipboard
          </button>
        </div>
      </header>
      <textarea
        placeholder="Write a note in this area!!"
        value={content}
        onChange={handleTextChange}
        style={{
          ...styles.textArea,
          height: isMobile ? '60vh' : '80vh',
          fontSize: isMobile ? 14 : 16,
        }}
        onKeyDown={handleKeyDown}
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
    fontFamily: "'Comic Sans MS', cursive, sans-serif",
    fontWeight: 'bold',
    color: '#f0f0f0',
  },
  logo: {
    fontSize: 24,
    color: '#ffd54f',
  },
  actions: {
    display: 'flex',
    gap: 10,
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#ffd54f',
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
