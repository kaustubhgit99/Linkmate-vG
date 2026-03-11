'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, HomeIcon, Trash2, Shield, Eye, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatDate, formatPrice } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    if (authLoading || !user || profile?.role !== 'admin') return
    Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('rooms').select('*,users(full_name,email),room_images(*)').order('created_at', { ascending: false }),
    ]).then(([u, r]) => { if (u.data) setUsers(u.data); if (r.data) setRooms(r.data); setLoading(false) })
  }, [user, profile, authLoading, supabase])

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="w-8 h-8 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin" /></div>
  if (!user || profile?.role !== 'admin') return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}><Navbar />
      <div className="pt-24 max-w-sm mx-auto px-5 text-center py-16">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#D4D4D0]" />
        <h2 className="font-display text-[#1A1A18] text-[1.4rem] mb-2">Admin Only</h2>
        <p className="text-[13px] text-[#6B6B67] mb-6">You need admin access to view this page.</p>
        <Link href="/"><span className="btn btn-dark px-6 py-3">Go Home</span></Link>
      </div>
    </div>
  )

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('users').delete().eq('id', id)
    setUsers(p => p.filter(u => u.id !== id)); toast({ title: 'User removed' })
  }
  const deleteRoom = async (id: string) => {
    if (!confirm('Remove listing?')) return
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(p => p.filter(r => r.id !== id)); toast({ title: 'Listing removed' })
  }
  const toggleRoomAvail = async (id: string, cur: boolean) => {
    await supabase.from('rooms').update({ is_available: !cur }).eq('id', id)
    setRooms(p => p.map(r => r.id === id ? { ...r, is_available: !cur } : r))
  }

  const stats = [
    { l: 'Total Users', v: users.length, bg: 'bg-blue-50', c: 'text-blue-600', icon: Users },
    { l: 'Owners', v: users.filter(u => u.role === 'owner').length, bg: 'bg-amber-50', c: 'text-amber-600', icon: HomeIcon },
    { l: 'Citizens', v: users.filter(u => u.role === 'citizen').length, bg: 'bg-[#F5F5F4]', c: 'text-[#1A1A18]', icon: Users },
    { l: 'Rooms Listed', v: rooms.length, bg: 'bg-green-50', c: 'text-green-600', icon: HomeIcon },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-[62px] max-w-7xl mx-auto px-5 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#1A1A18] flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="font-display text-[#1A1A18]" style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>Admin Panel</h1>
            <p className="text-[13px] text-[#6B6B67]">Platform moderation</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-[#E8E8E6]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.c}`} /></div>
              <div className="font-display text-[1.5rem] text-[#1A1A18]">{s.v}</div>
              <div className="text-[12px] text-[#A8A8A4] mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-6 bg-white border border-[#E8E8E6] p-1 rounded-xl">
            <TabsTrigger value="users" className="rounded-lg text-[13px] data-[state=active]:bg-[#1A1A18] data-[state=active]:text-white">
              <Users className="w-3.5 h-3.5 mr-1.5" />Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="rooms" className="rounded-lg text-[13px] data-[state=active]:bg-[#1A1A18] data-[state=active]:text-white">
              <HomeIcon className="w-3.5 h-3.5 mr-1.5" />Rooms ({rooms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-white rounded-2xl border border-[#E8E8E6] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {loading ? <div className="p-12 text-center text-[#A8A8A4] text-[13px]">Loading...</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead><tr className="border-b border-[#E8E8E6] bg-[#F9F9F8]">
                      {['User', 'Role', 'Joined', 'Actions'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider text-left">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-[#F5F5F4]">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-[#F9F9F8] transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1A1A18] flex items-center justify-center text-white text-[12px] font-bold shrink-0">{u.full_name?.charAt(0) || '?'}</div>
                              <div><div className="font-semibold text-[#1A1A18]">{u.full_name || '—'}</div><div className="text-[11px] text-[#A8A8A4]">{u.email}</div></div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><span className={`badge ${u.role === 'admin' ? 'badge-dark' : u.role === 'owner' ? 'badge-amber' : 'badge-gray'} capitalize`}>{u.role}</span></td>
                          <td className="px-5 py-4 text-[#A8A8A4] text-[12px]">{formatDate(u.created_at)}</td>
                          <td className="px-5 py-4">{u.id !== user.id && <button onClick={() => deleteUser(u.id)} className="btn btn-ghost p-2 rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="bg-white rounded-2xl border border-[#E8E8E6] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
              {loading ? <div className="p-12 text-center text-[#A8A8A4] text-[13px]">Loading...</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead><tr className="border-b border-[#E8E8E6] bg-[#F9F9F8]">
                      {['Room', 'Owner', 'Rent', 'Status', 'Actions'].map(h => <th key={h} className="px-5 py-3 text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider text-left">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-[#F5F5F4]">
                      {rooms.map(r => (
                        <tr key={r.id} className="hover:bg-[#F9F9F8] transition-colors">
                          <td className="px-5 py-4"><div className="font-semibold text-[#1A1A18] line-clamp-1 max-w-[140px]">{r.title}</div><div className="text-[11px] text-[#A8A8A4]">{r.city} · {r.room_type}</div></td>
                          <td className="px-5 py-4 text-[#6B6B67]">{r.users?.full_name || '—'}</td>
                          <td className="px-5 py-4 font-bold text-[#1A1A18]">{formatPrice(r.rent_price)}</td>
                          <td className="px-5 py-4">
                            <button onClick={() => toggleRoomAvail(r.id, r.is_available)} className="flex items-center gap-1.5">
                              {r.is_available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-[#D4D4D0]" />}
                              <span className={`badge ${r.is_available ? 'badge-green' : 'badge-amber'}`}>{r.is_available ? 'Available' : 'Occupied'}</span>
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-1">
                              <Link href={`/room/${r.id}`}><button className="btn btn-ghost p-2 rounded-xl"><Eye className="w-4 h-4" /></button></Link>
                              <button onClick={() => deleteRoom(r.id)} className="btn btn-ghost p-2 rounded-xl hover:bg-red-50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
