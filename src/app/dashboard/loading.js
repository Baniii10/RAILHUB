import { TrainTrackLoader } from '@/components/ui/RailLoader'

export default function DashboardLoading() {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TrainTrackLoader
        text="Memuat Dashboard Anda…"
        subtext="Menghubungkan ke server RAILHUB..."
      />
    </div>
  )
}

