'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/lib/hooks'

export function RoomCard({ room, userId, index = 0 }: { room: any; userId?: string; index?: number }) {
  const { favorites, toggleFavorite } = useFavorites(userId)
  const isFav = favorites.includes(room.id)
  const img = room.room_images?.find((i: any) => i.is_primary) || room.room_images?.[0]

  return (
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:index*0.04,duration:0.3}} className="card-hover">
      <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E6] h-full flex flex-col" style={{boxShadow:'var(--shadow-sm)'}}>
        {/* Image */}
        <div className="relative h-44 bg-[#F5F5F4] shrink-0">
          {img ? (
            <Image src={img.url} alt={room.title} fill className="object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
          )}
          <div className="absolute top-3 left-3">
            <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>
              {room.is_available ? '● Available' : '○ Occupied'}
            </span>
          </div>
          {userId && (
            <button onClick={e => { e.preventDefault(); toggleFavorite(room.id) }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'text-red-500' : 'text-[#A8A8A4] hover:text-red-400'}`}
              style={{boxShadow:'var(--shadow-sm)'}}>
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`}/>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-[14px] text-[#1A1A18] leading-snug line-clamp-2 flex-1">{room.title}</h3>
            <div className="shrink-0 text-right">
              <div className="font-bold text-[14px] text-[#1A1A18]">{formatPrice(room.rent_price)}</div>
              <div className="text-[11px] text-[#A8A8A4]">/mo</div>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[12px] text-[#6B6B67] mb-3">
            <MapPin className="w-3 h-3 shrink-0"/>
            <span className="line-clamp-1">{room.location}, {room.city}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="chip text-[11px]"><Bed className="w-3 h-3"/> {room.num_beds} Bed{room.num_beds > 1 ? 's' : ''}</span>
            <span className="chip text-[11px]">{room.room_type}</span>
          </div>
          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {room.amenities.slice(0,2).map((a: string) => <span key={a} className="text-[10px] px-2 py-0.5 bg-[#F5F5F4] rounded-full text-[#6B6B67] border border-[#E8E8E6]">{a}</span>)}
              {room.amenities.length > 2 && <span className="text-[10px] px-2 py-0.5 bg-[#F5F5F4] rounded-full text-[#6B6B67] border border-[#E8E8E6]">+{room.amenities.length - 2}</span>}
            </div>
          )}
          <div className="mt-auto">
            <Link href={`/room/${room.id}`}>
              <span className="btn btn-dark w-full justify-center py-2.5 text-[13px]">View Details</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#E8E8E6]">
      <div className="h-44 shimmer"/>
      <div className="p-4 space-y-3">
        <div className="h-4 shimmer rounded-full w-3/4"/>
        <div className="h-3 shimmer rounded-full w-1/2"/>
        <div className="flex gap-2"><div className="h-6 w-20 shimmer rounded-full"/><div className="h-6 w-24 shimmer rounded-full"/></div>
        <div className="h-9 shimmer rounded-xl"/>
      </div>
    </div>
  )
}
