'use client'

import { useRouter } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import DiscordChatBumperPlayer from './DiscordChatBumperPlayer'

function DiscordIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  )
}

export default function DiscordCommunityBanner() {
  const router = useRouter()
  const { user } = useAuth()
  const discordUrl = process.env.NEXT_PUBLIC_DISCORD_URL || 'https://discord.gg/railhub'

  const handleJoinClick = (e) => {
    if (!user) {
      e.preventDefault()
      toast('Silakan login terlebih dahulu untuk bergabung ke Discord Railfans.')
      router.push('/auth/login?next=%2Frailfans')
      return
    }
    toast.success('Membuka server Discord Komunitas Railfans...')
  }

  return (
    <section aria-labelledby="discord-heading" className="pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-6 lg:gap-8 items-center bg-white border border-[var(--rh-border)] rounded-xl p-4 sm:p-6">
        {/* Remotion Animated Live Chat Bumper */}
        <DiscordChatBumperPlayer />

        {/* Invite Details & High-Contrast CTA */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--rh-blue)] text-white flex items-center justify-center shrink-0">
              <DiscordIcon size={20} />
            </div>
            <div>
              <h2 id="discord-heading" className="text-lg sm:text-xl font-extrabold text-[var(--rh-blue)] m-0">
                Discord Komunitas Railfans
              </h2>
              <div className="text-xs font-semibold text-[var(--rh-orange)]">
                1.480+ Anggota Aktif · Lintas Jawa
              </div>
            </div>
          </div>

          <p className="text-sm text-[var(--rh-text)] opacity-85 m-0 leading-relaxed">
            Pantau info dinas lokomotif harian, berbagi hasil foto hunting, dan diskusi langsung bersama sesama pecinta kereta api.
          </p>

          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleJoinClick}
            style={{ color: '#ffffff' }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[var(--rh-blue)] text-white text-sm font-bold no-underline hover:opacity-90 transition-opacity w-full sm:w-auto cursor-pointer"
          >
            <DiscordIcon size={17} />
            <span>Gabung Server Discord</span>
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}
