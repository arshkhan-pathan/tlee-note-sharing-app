import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Welcome to <span className={styles.brand}>Tlee</span> 🔥
        </h1>
        <p className={styles.subtitle}>Your powerful note sharing platform</p>

        <div className={styles.actions}>
          <Link href="/admin/panel" className={styles.adminButton}>
            🛠️ Admin Control Panel
          </Link>
          <p className={styles.hint}>Manage all your notes from one place</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📝</span>
            <h3>Create Notes</h3>
            <p>Write and share notes instantly</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔗</span>
            <h3>Share Easily</h3>
            <p>Get unique URLs for each note</p>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <h3>Live Updates</h3>
            <p>Real-time collaboration and editing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
