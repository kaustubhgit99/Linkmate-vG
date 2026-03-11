'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Heart, ArrowLeft, CheckCircle, Shield, ChevronLeft, ChevronRight, Share2, X, Phone, Send, Loader2, User } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { getSupabase } from '@/lib/supabase'
import { useAuth, useFavorites } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

function ContactModal({ owner, roomTitle, roomId, onClose }: { owner: any; roomTitle: string; roomId: string; onClose: () => void }) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ name: profile?.full_name||'', phone: profile?.phone||'', message: `Hi, I am interested in "${roomTitle}". Please contact me.` })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = useRef(getSupabase()).current

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    const { error } = await supabase.from('enquiries').insert({
      room_id: roomId, owner_id: owner.id, sender_id: user?.id||null,
      sender_name: form.name, sender_phone: form.phone, message: form.message,
    })
    if (error) { toast({ title:'Failed to send', description:error.message, variant:'destructive' }); setLoading(false); return }
    setSent(true); setLoading(false)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:40}} transition={{type:'spring',damping:30,stiffness:320}}
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{boxShadow:'var(--shadow-lg)'}} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E8E8E6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-semibold">
              {owner.full_name?.charAt(0)||'?'}
            </div>
            <div>
              <p className="font-semibold text-[14px] text-[#1A1A18]">{owner.full_name}</p>
              <div className="flex items-center gap-1 text-[11px] text-green-600 font-semibold">
                <Shield className="w-3 h-3"/>Verified Owner
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F5F5F4] flex items-center justify-center text-[#6B6B67] hover:bg-[#E8E8E6] transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="px-6 py-5">
          {sent ? (
            <div className="text-center py-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600"/>
              </div>
              <h3 className="font-display text-[#1A1A18] text-[1.3rem] mb-1.5">Enquiry Sent!</h3>
              <p className="text-[13px] text-[#6B6B67] mb-1">Message sent to <strong className="text-[#1A1A18]">{owner.full_name}</strong>.</p>
              <p className="text-[13px] text-[#6B6B67] mb-6">They will contact you at your phone number.</p>
              {owner.phone && (
                <a href={`tel:${owner.phone}`} className="btn btn-dark px-6 py-2.5 text-[13px] w-full justify-center">
                  <Phone className="w-4 h-4"/> Call Owner Now
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-[13px] text-[#6B6B67] mb-5">Fill in your details and the owner will contact you directly.</p>
              <form onSubmit={send} className="space-y-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#A8A8A4] uppercase tracking-wide mb-1.5">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A4]"/>
                    <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Full Name" required className="field pl-9 text-[14px]"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#A8A8A4] uppercase tracking-wide mb-1.5">Your Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A4]"/>
                    <input value={form.phone} onChange={e => setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" type="tel" required className="field pl-9 text-[14px]"/>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#A8A8A4] uppercase tracking-wide mb-1.5">Message</label>
                  <textarea value={form.message} onChange={e => setForm(p=>({...p,message:e.target.value}))} rows={3} required className="field text-[14px]"/>
                </div>
                <button type="submit" disabled={loading} className="btn btn-dark w-full justify-center py-3 mt-1 text-[14px]">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending...</> : <><Send className="w-4 h-4"/>Send Enquiry</>}
                </button>
                {!user && <p className="text-center text-[12px] text-[#A8A8A4] pt-1"><Link href="/auth/login" className="font-semibold text-[#1A1A18]">Sign in</Link> to track your enquiries</p>}
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [showContact, setShowContact] = useState(false)
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user?.id)
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(id,full_name,phone,avatar_url)').eq('id', params.id).single()
      .then(({ data }) => { setRoom(data); setLoading(false) })
  }, [params.id, supabase])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}><Navbar/><div className="w-9 h-9 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin"/></div>
  if (!room) return <div className="min-h-screen" style={{background:'var(--bg)'}}><Navbar/><div className="pt-24 text-center px-4"><h2 className="font-display text-[1.5rem] text-[#1A1A18] mb-4">Room not found</h2><Link href="/browse"><span className="btn btn-dark px-6 py-3">Browse Rooms</span></Link></div></div>

  const imgs = room.room_images || []
  const isFav = favorites.includes(room.id)
  const share = () => { navigator.clipboard?.writeText(window.location.href); toast({ title:'Link copied!' }) }

  return (
    <div className="min-h-screen" style={{background:'var(--bg)'}}>
      <Navbar/>
      <AnimatePresence>{showContact && room.users && <ContactModal owner={room.users} roomTitle={room.title} roomId={room.id} onClose={() => setShowContact(false)}/>}</AnimatePresence>

      <div className="pt-[62px] max-w-6xl mx-auto px-5 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] text-[#6B6B67] hover:text-[#1A1A18] mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/> Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
              <div className="relative h-64 sm:h-[400px] rounded-2xl overflow-hidden bg-[#F5F5F4]">
                {imgs.length > 0 ? (
                  <Image src={imgs[imgIdx]?.url} alt={room.title} fill className="object-cover transition-all duration-300"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl">🏠</div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>{room.is_available ? '● Available' : '○ Occupied'}</span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {user && <button onClick={() => toggleFavorite(room.id)} className={`w-9 h-9 rounded-full bg-white shadow flex items-center justify-center transition-all hover:scale-110 ${isFav ? 'text-red-500' : 'text-[#A8A8A4]'}`}><Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`}/></button>}
                  <button onClick={share} className="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-[#6B6B67] hover:text-[#1A1A18] transition-all hover:scale-110"><Share2 className="w-4 h-4"/></button>
                </div>
                {imgs.length > 1 && <>
                  <button onClick={() => setImgIdx(i => (i-1+imgs.length)%imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5 text-[#1A1A18]"/></button>
                  <button onClick={() => setImgIdx(i => (i+1)%imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5 text-[#1A1A18]"/></button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {imgs.map((_:any,i:number) => <button key={i} onClick={() => setImgIdx(i)} className={`rounded-full transition-all ${i===imgIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}/>)}
                  </div>
                </>}
              </div>
              {imgs.length > 1 && (
                <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
                  {imgs.map((img:any, i:number) => (
                    <button key={img.id} onClick={() => setImgIdx(i)} className={`relative w-14 h-10 rounded-xl overflow-hidden shrink-0 transition-all ${i===imgIdx ? 'ring-2 ring-[#1A1A18]' : 'opacity-50 hover:opacity-80'}`}>
                      <Image src={img.url} alt="" fill className="object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="card-lg p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-[#1A1A18] mb-1.5" style={{fontSize:'clamp(1.3rem,3vw,1.7rem)'}}>{room.title}</h1>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#6B6B67]"><MapPin className="w-3.5 h-3.5"/>{room.location}, {room.city}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[1.4rem] text-[#1A1A18]">{formatPrice(room.rent_price)}</div>
                  <div className="text-[12px] text-[#A8A8A4]">/month</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="chip"><Bed className="w-3.5 h-3.5"/> {room.num_beds} Bed{room.num_beds>1?'s':''}</span>
                <span className="chip">{room.room_type}</span>
                <span className="chip">{formatDate(room.created_at)}</span>
              </div>
              <div className="divider mb-5"/>
              <h3 className="font-semibold text-[14px] text-[#1A1A18] mb-2">About this room</h3>
              <p className="text-[14px] text-[#6B6B67] leading-relaxed">{room.description || 'No description provided.'}</p>
              {room.amenities?.length > 0 && (
                <div className="mt-5">
                  <h3 className="font-semibold text-[14px] text-[#1A1A18] mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F4] border border-[#E8E8E6] rounded-full text-[12px] font-medium text-[#1A1A18]">
                        <CheckCircle className="w-3 h-3 text-green-600"/>{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} transition={{delay:0.15}} className="card-lg p-6 sticky top-[80px]">
              <h3 className="font-semibold text-[14px] text-[#1A1A18] mb-4">Owner Details</h3>
              {room.users ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full bg-[#1A1A18] flex items-center justify-center text-white font-semibold text-lg">
                      {room.users.full_name?.charAt(0)||'?'}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-[#1A1A18]">{room.users.full_name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-green-600 font-semibold mt-0.5"><Shield className="w-3 h-3"/>Verified Owner</div>
                    </div>
                  </div>

                  {room.users.phone && (
                    <a href={`tel:${room.users.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F5F4] border border-[#E8E8E6] hover:border-[#D4D4D0] transition-colors text-[13px] font-medium text-[#1A1A18] mb-4">
                      <Phone className="w-4 h-4 text-green-600 shrink-0"/>{room.users.phone}
                    </a>
                  )}

                  <div className="divider mb-4"/>
                  <div className="space-y-2.5 text-[13px] mb-5">
                    {[['Type',room.room_type],['Beds',String(room.num_beds)],['City',room.city],['Status',room.is_available?'Available':'Occupied'],['Rent/mo',formatPrice(room.rent_price)]].map(([k,v])=>(
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-[#A8A8A4]">{k}</span>
                        <span className={`font-semibold ${k==='Status'?(room.is_available?'text-green-600':'text-amber-600'):k==='Rent/mo'?'text-[#1A1A18]':'text-[#1A1A18]'}`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setShowContact(true)} className="btn btn-dark w-full justify-center py-3 text-[14px]">Contact Owner</button>
                  {!user && <p className="text-center text-[12px] text-[#A8A8A4] mt-3"><Link href="/auth/login" className="font-semibold text-[#1A1A18]">Sign in</Link> to save this room</p>}
                </>
              ) : <p className="text-[13px] text-[#6B6B67]">Owner info not available</p>}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
