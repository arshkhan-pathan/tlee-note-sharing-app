import { Metadata } from 'next'
import ControlPanel from '@/components/Common/ControlPanel'

export const metadata: Metadata = {
  title: 'Admin Panel - Tlee 🔥',
  description: 'Manage all your notes from one place.',
}

export default function AdminPanelPage() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        position: 'relative',
        zIndex: 1,
      }}
    >
      <ControlPanel />
    </div>
  )
}
