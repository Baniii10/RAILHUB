import { TrainTrackLoader } from '@/components/ui/RailLoader'

export default function Loading() {
  return (
    <main className="rh-route-loading" aria-label="Memuat halaman">
      <TrainTrackLoader
        text="Kereta menuju halaman berikutnya…"
        subtext="Perjalanan Anda tetap tersimpan."
      />
    </main>
  )
}
