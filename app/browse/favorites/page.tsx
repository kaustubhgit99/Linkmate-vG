'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'

export default function FavoritesPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('favorites').select('room_id,rooms(*,room_images(*),users(full_name,phone))').eq('user_id', user.id)
      .then(({ data }) => { if (data) setRooms(data.map((f: any) => f.rooms).filter(Boolean)); setLoading(false) })
  }, [user, supabase])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-[62px] max-w-7xl mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <Heart className="w-6 h-6 text-red-400 fill-red-400" />
          <div>
            <h1 className="font-display text-[#1A1A18]" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Saved Rooms</h1>
            <p className="text-[13px] text-[#6B6B67] mt-0.5">{rooms.length} saved</p>
          </div>
        </motion.div>

        {!user ? (
          <div className="text-center py-24">
            <Heart className="w-12 h-12 mx-auto mb-4 text-[#E8E8E6]" />
            <h3 className="font-display text-[#1A1A18] text-[1.3rem] mb-2">Sign in to see saved rooms</h3>
            <p className="text-[13px] text-[#6B6B67] mb-6">Tap the heart on any room to save it here.</p>
            <Link href="/auth/login"><span className="btn btn-dark px-6 py-3">Sign In</span></Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <RoomCardSkeleton key={i} />)}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((r, i) => <RoomCard key={r.id} room={r} userId={user?.id} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-24">
            <Heart className="w-12 h-12 mx-auto mb-4 text-[#E8E8E6]" />
            <h3 className="font-display text-[#1A1A18] text-[1.3rem] mb-2">No saved rooms yet</h3>
            <p className="text-[13px] text-[#6B6B67] mb-6">Tap the heart on any room to save it here.</p>
            <Link href="/browse"><span className="btn btn-dark px-6 py-3">Browse Rooms</span></Link>
          </div>
        )}
      </div>
    </div>
  )
}
