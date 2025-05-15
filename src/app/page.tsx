'use client'
import styles from './styles/Home.module.css'
import NoteEditor from '../components/NoteEditor'

export default function main() {
  return (
    <div className={styles.container}>
      <NoteEditor></NoteEditor>
    </div>
  )
}
