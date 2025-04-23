'use client'
import styles from './styles/Home.module.css'
import NoteEditor from '../components/NoteEditor'

export default function main() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Share Anywhere</h1>
      </header>
      <NoteEditor></NoteEditor>
    </div>
  )
}
