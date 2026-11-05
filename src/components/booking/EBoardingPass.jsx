'use client'

import Image from 'next/image'
import { TrainFront } from 'lucide-react'
import { RailHubTrainLogo } from '@/components/ui/VectorLogos'
import { formatDate, formatTime } from '@/lib/utils/formatters'

function routeParts(booking, schedule) {
  const route = booking?.schedules?.routes?.name || ''
  const [origin = '', destination = ''] = route.split(/\s*(?:—|→|-)\s*/)

  return {
    originCode: schedule?.origin_code || origin.match(/\(([^)]+)\)/)?.[1] || origin.slice(0, 3).toUpperCase(),
    originName: schedule?.origin_name || origin.replace(/\s*\([^)]+\)\s*/, ''),
    destinationCode: schedule?.destination_code || destination.match(/\(([^)]+)\)/)?.[1] || destination.slice(0, 3).toUpperCase(),
    destinationName: schedule?.destination_name || destination.replace(/\s*\([^)]+\)\s*/, ''),
  }
}

export default function EBoardingPass({ booking, ticket, qrImage, journey }) {
  const schedule = journey?.schedule || booking?.schedules || {}
  const route = routeParts(booking, schedule)
  const trainName = schedule.train_name || schedule.trains?.name || booking?.schedules?.trains?.name || 'Kereta RailHub'
  const trainNumber = schedule.train_number || schedule.trains?.train_number || booking?.schedules?.trains?.train_number
  const departure = schedule.departure_time || booking?.schedules?.departure_time
  const arrival = schedule.arrival_time || booking?.schedules?.arrival_time
  const carriage = ticket?.seats?.carriages

  return (
    <article className="rh-boarding-pass" aria-label={`E-boarding pass ${ticket?.passengers?.full_name || ''}`}>
      <header className="rh-boarding-pass-header">
        <RailHubTrainLogo height={26} />
        <div>
          <span>Kode pemesanan</span>
          <strong>{booking?.booking_code || '-'}</strong>
        </div>
      </header>

      <div className="rh-boarding-pass-train">
        <TrainFront size={22} aria-hidden="true" />
        <div>
          <strong>{trainName}</strong>
          <span>{[trainNumber, carriage?.carriage_class].filter(Boolean).join(' · ')}</span>
        </div>
      </div>

      <div className="rh-boarding-pass-route">
        <div>
          <strong>{departure ? formatTime(departure) : '-'}</strong>
          <b>{route.originCode || '-'}</b>
          <span>{route.originName || 'Stasiun asal'}</span>
        </div>
        <div className="rh-boarding-pass-track" aria-hidden="true">
          <i />
          <span />
          <i />
        </div>
        <div>
          <strong>{arrival ? formatTime(arrival) : '-'}</strong>
          <b>{route.destinationCode || '-'}</b>
          <span>{route.destinationName || 'Stasiun tujuan'}</span>
        </div>
      </div>

      <p className="rh-boarding-pass-date">{departure ? formatDate(departure) : 'Tanggal belum tersedia'}</p>

      <div className="rh-boarding-pass-cut" aria-hidden="true" />

      <dl className="rh-boarding-pass-details">
        <div className="is-passenger">
          <dt>Penumpang</dt>
          <dd>{ticket?.passengers?.full_name || 'Penumpang'}</dd>
        </div>
        <div>
          <dt>Gerbong</dt>
          <dd>{carriage?.carriage_number || '1'}</dd>
        </div>
        <div>
          <dt>Kursi</dt>
          <dd>{ticket?.seats?.seat_number || '-'}</dd>
        </div>
      </dl>

      <div className="rh-boarding-pass-qr">
        <span>Pindai kode ini di gerbang</span>
        {qrImage ? (
          <Image src={qrImage} alt={`QR e-boarding pass ${ticket?.ticket_number || ''}`} width={228} height={228} unoptimized />
        ) : (
          <div className="rh-boarding-pass-qr-placeholder">QR sedang dibuat</div>
        )}
        <strong>{ticket?.ticket_number || '-'}</strong>
        <small>{ticket?.is_validated ? 'Sudah divalidasi petugas' : 'Siapkan identitas penumpang saat pemeriksaan'}</small>
      </div>
    </article>
  )
}
