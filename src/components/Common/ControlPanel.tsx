'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BACKEND_URL } from '@/constants'
import styles from './ControlPanel.module.css'

interface Note {
  id: number
  note: string
  author: string
  identifier: string
}

export default function ControlPanel() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [perPage, setPerPage] = useState(10)
  const [totalNotes, setTotalNotes] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminUser, setAdminUser] = useState<{ username: string; email: string } | null>(null)
  const router = useRouter()

  // Utility function to get admin token from cookies
  const getAdminToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('adminToken='))
      ?.split('=')[1]
  }

  // Utility function to clear admin token cookie
  const clearAdminToken = () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes()
    }
  }, [currentPage, perPage, isAuthenticated])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const checkAuthStatus = async () => {
    const token = getAdminToken()

    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/admin/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setAdminUser(userData)
        setIsAuthenticated(true)
      } else {
        // Token is invalid, redirect to login
        clearAdminToken()
        router.push('/admin/login')
      }
    } catch (err) {
      clearAdminToken()
      router.push('/admin/login')
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    setIsAuthenticated(false)
    setAdminUser(null)
    router.push('/admin/login')
  }

  const fetchNotes = async () => {
    try {
      setLoading(true)
      const token = getAdminToken()

      if (!token) {
        router.push('/admin/login')
        return
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString(),
      })

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }

      const response = await fetch(`${BACKEND_URL}/notes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        // Unauthorized, redirect to login
        clearAdminToken()
        router.push('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data.notes)
      setTotalNotes(data.total)
      setTotalPages(data.total_pages)
      setHasNext(data.has_next)
      setHasPrev(data.has_prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (noteId: number, identifier: string) => {
    if (!noteId || !identifier) return

    setDeletingNoteId(noteId)

    try {
      const token = getAdminToken()

      if (!token) {
        router.push('/admin/login')
        return
      }

      // Try the new route first (by identifier)
      let response = await fetch(`${BACKEND_URL}/admin/notes/delete/${identifier}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Fallback to the old route if the new one doesn't exist
      if (!response.ok) {
        response = await fetch(`${BACKEND_URL}/admin/notes/${noteId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (response.status === 401) {
        clearAdminToken()
        router.push('/admin/login')
        return
      }

      if (response.ok) {
        setNotes(notes.filter((note) => note.id !== noteId))
        setDeleteConfirm(null)
        setToastMessage('Note deleted successfully!')
        setToastType('success')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        throw new Error('Failed to delete note')
      }
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : 'Failed to delete note')
      setToastType('error')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } finally {
      setDeletingNoteId(null)
    }
  }

  const copyToClipboard = (identifier: string) => {
    if (!identifier) return
    const url = `${window.location.origin}/${identifier}`
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text || typeof text !== 'string') return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Use notes directly since search is now handled by the API
  const filteredNotes = notes

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage)
    setCurrentPage(1) // Reset to first page when changing per_page
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading notes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={fetchNotes} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>Notes Control Panel</h1>
          <div className={styles.adminInfo}>
            <span>Welcome, {adminUser?.username}!</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              🚪 Logout
            </button>
          </div>
          <Link href="/" className={styles.homeLink}>
            ← Back to Home
          </Link>
        </div>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            Total Notes: <strong>{totalNotes}</strong>
          </span>
          <span className={styles.statItem}>
            Page: <strong>{currentPage}</strong> of {totalPages}
          </span>
          <span className={styles.statItem}>
            Per Page: <strong>{perPage === -1 ? 'All' : perPage}</strong>
          </span>
          <button onClick={fetchNotes} className={styles.refreshButton} title="Refresh notes">
            🔄
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No notes found. Create your first note!</p>
        </div>
      ) : (
        <>
          {/* Search and Pagination Controls */}
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search notes, authors, or content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setCurrentPage(1) // Reset to first page when searching
                    fetchNotes()
                  }
                }}
                className={styles.searchInput}
              />
              <span className={styles.searchIcon}>🔍</span>
              {searchTerm.trim() ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    fetchNotes()
                  }}
                  className={styles.searchButton}
                  title="Clear search"
                >
                  ❌
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPage(1)
                    fetchNotes()
                  }}
                  className={styles.searchButton}
                  title="Search"
                >
                  🔍
                </button>
              )}
            </div>

            <div className={styles.paginationControls}>
              <div className={styles.perPageSelector}>
                <label htmlFor="perPage">Show:</label>
                <select
                  id="perPage"
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className={styles.perPageSelect}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={-1}>All</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div className={styles.paginationInfo}>
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </div>

          {filteredNotes.length === 0 ? (
            <div className={styles.emptySearch}>
              <p>No notes match your search criteria.</p>
              <button onClick={() => setSearchTerm('')} className={styles.clearSearchButton}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Identifier</th>
                      <th>Author</th>
                      <th>Content Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.map((note) => {
                      if (!note) return null

                      const identifier = note.identifier || 'Unknown'
                      const author = note.author || 'Unknown'
                      const noteContent = note.note || ''

                      return (
                        <tr key={note.id} className={styles.tableRow}>
                          <td>{note.id}</td>
                          <td>
                            <div className={styles.identifierCell}>
                              <code className={styles.identifier}>{identifier}</code>
                              <button
                                onClick={() => copyToClipboard(identifier)}
                                className={styles.copyButton}
                                title="Copy link"
                              >
                                📋
                              </button>
                            </div>
                          </td>
                          <td>{author}</td>
                          <td className={styles.contentPreview}>{truncateText(noteContent)}</td>
                          <td>
                            <div className={styles.actions}>
                              <a
                                href={`/${identifier}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.viewButton}
                              >
                                👁️ View
                              </a>
                              <a href={`/${identifier}`} className={styles.editButton}>
                                ✏️ Edit
                              </a>
                              {deleteConfirm === note.id ? (
                                <div className={styles.deleteConfirm}>
                                  {deletingNoteId === note.id ? (
                                    <div className={styles.deletingState}>
                                      <div className={styles.spinner}></div>
                                      <span>Deleting...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <span>Sure?</span>
                                      <button
                                        onClick={() => handleDelete(note.id, identifier)}
                                        className={styles.confirmDeleteButton}
                                        disabled={deletingNoteId !== null}
                                      >
                                        ✅ Yes
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className={styles.cancelDeleteButton}
                                        disabled={deletingNoteId !== null}
                                      >
                                        ❌ No
                                      </button>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(note.id)}
                                  className={styles.deleteButton}
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={!hasPrev}
                    className={styles.pageButton}
                  >
                    ⏮️ First
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPrev}
                    className={styles.pageButton}
                  >
                    ⏪ Previous
                  </button>

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(
                        (page) =>
                          page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2
                      )
                      .map((page, index, array) => (
                        <div key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className={styles.pageEllipsis}>...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`${styles.pageButton} ${currentPage === page ? styles.currentPage : ''}`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNext}
                    className={styles.pageButton}
                  >
                    Next ⏩
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={!hasNext}
                    className={styles.pageButton}
                  >
                    Last ⏭️
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={styles.scrollTopButton}
          title="Scroll to top"
        >
          ⬆️
        </button>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className={`${styles.toast} ${styles[toastType]}`}>
          <span className={styles.toastMessage}>{toastMessage}</span>
          <button onClick={() => setShowToast(false)} className={styles.toastClose}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}
