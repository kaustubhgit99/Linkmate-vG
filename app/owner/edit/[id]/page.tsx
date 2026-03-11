'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/rooms/ImageUpload'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES, AMENITIES_LIST } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function EditRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useRef(getSupabase()).current
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [room, setRoom] = useState<any>(null)
  const [form, setForm] = useState({ title: '', description: '', rent_price: '', location: '', city: '', room_type: '', num_beds: '1', is_available: true, amenities: [] as string[] })

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*)').eq('id', params.id).single().then(({ data }) => {
      if (data) { setRoom(data); setForm({ title: data.title, description: data.description, rent_price: String(data.rent_price), location: data.location, city: data.city, room_type: data.room_type, num_beds: String(data.num_beds), is_available: data.is_available, amenities: data.amenities || [] }) }
      setLoading(false)
    })
  }, [params.id, supabase])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const toggleAmenity = (a: string) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { error } = await supabase.from('rooms').update({ title: form.title.trim(), description: form.description.trim(), rent_price: Number(form.rent_price), location: form.location.trim(), city: form.city, room_type: form.room_type, num_beds: Number(form.num_beds), is_available: form.is_available, amenities: form.amenities }).eq('id', params.id)
    if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }) }
    else { toast({ title: 'Changes saved!' }); router.push('/owner') }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="w-8 h-8 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-[62px] max-w-2xl mx-auto px-5 py-8">
        <Link href="/owner" className="flex items-center gap-1.5 text-[13px] text-[#6B6B67] hover:text-[#1A1A18] mb-6 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-lg overflow-hidden">
            <div className="px-7 py-5 border-b border-[#E8E8E6]">
              <h1 className="font-display text-[#1A1A18] text-[1.4rem]">Edit Room</h1>
              <p className="text-[13px] text-[#6B6B67] mt-0.5 line-clamp-1">{room?.title}</p>
            </div>
            <form onSubmit={handleSave} className="px-7 py-6 space-y-5">
              <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Room Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} required className="field" /></div>
              <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Description *</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} required className="field" /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Area / Street *</label>
                  <input value={form.location} onChange={e => set('location', e.target.value)} required className="field" /></div>
                <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">City *</label>
                  <select value={form.city} onChange={e => set('city', e.target.value)} required className="field">
                    <option value="">Select</option>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Type *</label>
                  <select value={form.room_type} onChange={e => set('room_type', e.target.value)} required className="field">
                    <option value="">Select</option>{ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Beds</label>
                  <input type="number" min="1" value={form.num_beds} onChange={e => set('num_beds', e.target.value)} className="field" /></div>
                <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Rent (₹)</label>
                  <input type="number" min="0" value={form.rent_price} onChange={e => set('rent_price', e.target.value)} className="field" /></div>
              </div>
              <label className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F8] border border-[#E8E8E6] cursor-pointer">
                <div><p className="font-semibold text-[14px] text-[#1A1A18]">Available for Rent</p><p className="text-[12px] text-[#A8A8A4]">Toggle off if occupied</p></div>
                <Switch checked={form.is_available} onCheckedChange={v => set('is_available', v)} />
              </label>
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A18] mb-3">Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_LIST.map(a => (
                    <label key={a} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-[13px] font-medium transition-all border ${form.amenities.includes(a) ? 'bg-[#1A1A18] text-white border-[#1A1A18]' : 'bg-white text-[#6B6B67] border-[#E8E8E6] hover:border-[#D4D4D0]'}`}>
                      <Checkbox checked={form.amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} />{a}
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn btn-dark w-full justify-center py-3.5 text-[14px]">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
              </button>
            </form>
          </div>

          {room && (
            <div className="card-lg mt-5 p-7">
              <h3 className="font-semibold text-[15px] text-[#1A1A18] mb-5">Room Photos</h3>
              <ImageUpload roomId={params.id as string} existingImages={room.room_images || []} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
