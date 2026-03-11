'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, HomeIcon, Eye, Edit3, Trash2, ToggleLeft, ToggleRight, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = useRef(getSupabase()).current
  const router = useRouter()
  const fetchedRef = useRef(false)

  const fetchRooms = useCallback(async (uid: string) => {
    const { data } = await supabase.from('rooms').select('*,room_images(*)').eq('owner_id', uid).order('created_at', { ascending: false })
    setRooms(data || []); setRoomsLoading(false)
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth/login'); return }
    if (profile && profile.role !== 'owner' && profile.role !== 'admin') { router.replace('/browse'); return }
    if (!fetchedRef.current) { fetchedRef.current = true; fetchRooms(user.id) }
  }, [authLoading, user, profile, fetchRooms, router])

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="w-8 h-8 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return null

  const stats = [
    { l: 'Total Listings', v: rooms.length, icon: HomeIcon, c: 'text-blue-600', bg: 'bg-blue-50' },
    { l: 'Available', v: rooms.filter(r => r.is_available).length, icon: TrendingUp, c: 'text-green-600', bg: 'bg-green-50' },
    { l: 'Occupied', v: rooms.filter(r => !r.is_available).length, icon: HomeIcon, c: 'text-amber-600', bg: 'bg-amber-50' },
    { l: 'Monthly Value', v: formatPrice(rooms.filter(r => r.is_available).reduce((s, r) => s + r.rent_price, 0)), icon: DollarSign, c: 'text-[#1A1A18]', bg: 'bg-[#F5F5F4]' },
  ]

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(p => p.filter(r => r.id !== id))
    toast({ title: 'Room deleted' })
  }
  const toggleAvail = async (id: string, cur: boolean) => {
    await supabase.from('rooms').update({ is_available: !cur }).eq('id', id)
    setRooms(p => p.map(r => r.id === id ? { ...r, is_available: !cur } : r))
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-[62px] max-w-7xl mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[#1A1A18]" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>My Listings</h1>
            <p className="text-[13px] text-[#6B6B67] mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Owner'}</p>
          </div>
          <Link href="/owner/add">
            <span className="btn btn-dark px-5 py-3 text-[13px]"><Plus className="w-4 h-4" /> Add New Room</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-[#E8E8E6]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.c}`} />
              </div>
              <div className="font-display text-[1.5rem] text-[#1A1A18]">{s.v}</div>
              <div className="text-[12px] text-[#A8A8A4] mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#E8E8E6] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="px-6 py-4 border-b border-[#E8E8E6] flex items-center justify-between">
            <h2 className="font-semibold text-[15px] text-[#1A1A18]">All Listings</h2>
            <span className="text-[12px] text-[#A8A8A4]">{rooms.length} total</span>
          </div>

          {roomsLoading ? (
            <div className="p-12 text-center text-[#A8A8A4] text-[13px]">Loading your listings...</div>
          ) : rooms.length === 0 ? (
            <div className="p-16 text-center">
              <HomeIcon className="w-12 h-12 mx-auto mb-4 text-[#E8E8E6]" />
              <p className="font-semibold text-[#1A1A18] mb-1">No listings yet</p>
              <p className="text-[13px] text-[#6B6B67] mb-6">Add your first room to start getting enquiries</p>
              <Link href="/owner/add"><span className="btn btn-dark px-6 py-3 text-[13px]"><Plus className="w-4 h-4" /> Add Your First Room</span></Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E8E8E6] bg-[#F9F9F8]">
                    {['Room', 'City', 'Rent', 'Status', 'Photos', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F4]">
                  {rooms.map(room => (
                    <tr key={room.id} className="hover:bg-[#F9F9F8] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#1A1A18] line-clamp-1 max-w-[160px]">{room.title}</div>
                        <div className="text-[11px] text-[#A8A8A4]">{room.room_type} · {room.num_beds} bed</div>
                      </td>
                      <td className="px-5 py-4 text-[#6B6B67]">{room.city}</td>
                      <td className="px-5 py-4 font-bold text-[#1A1A18]">{formatPrice(room.rent_price)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleAvail(room.id, room.is_available)} className="flex items-center gap-2 group">
                          {room.is_available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-[#D4D4D0]" />}
                          <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>
                            {room.is_available ? 'Available' : 'Occupied'}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-[#A8A8A4]">{room.room_images?.length || 0}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/room/${room.id}`}><button className="btn btn-ghost p-2 rounded-xl"><Eye className="w-4 h-4" /></button></Link>
                          <Link href={`/owner/edit/${room.id}`}><button className="btn btn-ghost p-2 rounded-xl"><Edit3 className="w-4 h-4" /></button></Link>
                          <button onClick={() => deleteRoom(room.id)} className="btn btn-ghost p-2 rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
