'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle, Camera } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUpload } from '@/components/rooms/ImageUpload'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES, AMENITIES_LIST } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

export default function AddRoomPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = useRef(getSupabase()).current
  const [step, setStep] = useState<'form' | 'photos' | 'done'>('form')
  const [roomId, setRoomId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', rent_price: '', location: '', city: '', room_type: '', num_beds: '1', is_available: true, amenities: [] as string[] })

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
    if (!authLoading && profile && profile.role !== 'owner' && profile.role !== 'admin') router.push('/browse')
  }, [user, profile, authLoading, router])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const toggleAmenity = (a: string) => set('amenities', form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { router.push('/auth/login'); return }
    if (!form.city || !form.room_type) { toast({ title: 'Missing fields', description: 'Please select a city and room type', variant: 'destructive' }); return }
    setSubmitting(true)
    const { data, error } = await supabase.from('rooms').insert({
      owner_id: user.id, title: form.title.trim(), description: form.description.trim(),
      rent_price: Number(form.rent_price), location: form.location.trim(), city: form.city,
      room_type: form.room_type, num_beds: Number(form.num_beds), is_available: form.is_available, amenities: form.amenities,
    }).select().single()
    if (error) { toast({ title: 'Failed to create room', description: error.message, variant: 'destructive' }); setSubmitting(false); return }
    setRoomId(data.id)
    toast({ title: 'Room created!' })
    setStep('photos')
    setSubmitting(false)
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}><div className="w-8 h-8 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="pt-[62px] max-w-2xl mx-auto px-5 py-8">
        <Link href="/owner" className="flex items-center gap-1.5 text-[13px] text-[#6B6B67] hover:text-[#1A1A18] mb-6 group transition-colors">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Dashboard
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          {[{ n: 1, l: 'Details' }, { n: 2, l: 'Photos' }, { n: 3, l: 'Done' }].map((s, i) => {
            const stepNum = step === 'form' ? 1 : step === 'photos' ? 2 : 3
            const done = s.n < stepNum; const active = s.n === stepNum
            return (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${active ? 'bg-[#1A1A18] text-white' : done ? 'bg-green-500 text-white' : 'bg-[#E8E8E6] text-[#A8A8A4]'}`}>
                  {done ? <CheckCircle className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-[13px] font-medium hidden sm:block ${active ? 'text-[#1A1A18]' : 'text-[#A8A8A4]'}`}>{s.l}</span>
                {i < 2 && <div className="w-8 h-px bg-[#E8E8E6] mx-1" />}
              </div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {step === 'form' && (
            <div className="card-lg overflow-hidden">
              <div className="px-7 py-5 border-b border-[#E8E8E6]">
                <h1 className="font-display text-[#1A1A18] text-[1.4rem]">Add New Room</h1>
                <p className="text-[13px] text-[#6B6B67] mt-0.5">Fill in the details to list your room</p>
              </div>
              <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6">
                <section className="space-y-4">
                  <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider">Basic Info</p>
                  <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Room Title *</label>
                    <input placeholder="e.g. Cozy 1BHK near Metro Station" value={form.title} onChange={e => set('title', e.target.value)} required className="field" /></div>
                  <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Description *</label>
                    <textarea placeholder="Describe your room..." rows={4} value={form.description} onChange={e => set('description', e.target.value)} required className="field" /></div>
                </section>

                <div className="divider" />

                <section className="space-y-4">
                  <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider">Location</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Area / Street *</label>
                      <input placeholder="e.g. Koramangala 5th Block" value={form.location} onChange={e => set('location', e.target.value)} required className="field" /></div>
                    <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">City *</label>
                      <select value={form.city} onChange={e => set('city', e.target.value)} required className="field">
                        <option value="">Select city</option>{CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                </section>

                <div className="divider" />

                <section className="space-y-4">
                  <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider">Room Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Type *</label>
                      <select value={form.room_type} onChange={e => set('room_type', e.target.value)} required className="field">
                        <option value="">Select</option>{ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Beds *</label>
                      <input type="number" min="1" max="10" value={form.num_beds} onChange={e => set('num_beds', e.target.value)} required className="field" /></div>
                    <div className="col-span-2 sm:col-span-1"><label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Monthly Rent (₹) *</label>
                      <input type="number" min="500" placeholder="12000" value={form.rent_price} onChange={e => set('rent_price', e.target.value)} required className="field" /></div>
                  </div>
                  <label className="flex items-center justify-between p-4 rounded-xl bg-[#F9F9F8] border border-[#E8E8E6] cursor-pointer">
                    <div><p className="font-semibold text-[14px] text-[#1A1A18]">Available for Rent</p><p className="text-[12px] text-[#A8A8A4]">Toggle off if currently occupied</p></div>
                    <Switch checked={form.is_available} onCheckedChange={v => set('is_available', v)} />
                  </label>
                </section>

                <div className="divider" />

                <section className="space-y-3">
                  <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider">Amenities</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {AMENITIES_LIST.map(a => (
                      <label key={a} className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-[13px] font-medium transition-all border ${form.amenities.includes(a) ? 'bg-[#1A1A18] text-white border-[#1A1A18]' : 'bg-white text-[#6B6B67] border-[#E8E8E6] hover:border-[#D4D4D0]'}`}>
                        <Checkbox checked={form.amenities.includes(a)} onCheckedChange={() => toggleAmenity(a)} className={form.amenities.includes(a) ? 'border-white' : ''} />{a}
                      </label>
                    ))}
                  </div>
                </section>

                <button type="submit" disabled={submitting} className="btn btn-dark w-full justify-center py-3.5 text-[14px] mt-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating listing...</> : 'Continue → Add Photos'}
                </button>
              </form>
            </div>
          )}

          {step === 'photos' && roomId && (
            <div className="card-lg overflow-hidden">
              <div className="px-7 py-5 border-b border-[#E8E8E6] flex items-center gap-3">
                <Camera className="w-5 h-5 text-[#6B6B67]" />
                <div><h2 className="font-display text-[#1A1A18] text-[1.4rem]">Add Photos</h2>
                  <p className="text-[13px] text-[#6B6B67] mt-0.5">Listings with photos get 3× more enquiries</p></div>
              </div>
              <div className="p-7">
                <ImageUpload roomId={roomId} />
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep('done')} className="btn btn-outline flex-1 justify-center py-3 text-[13px]">Skip for now</button>
                  <button onClick={() => setStep('done')} className="btn btn-dark flex-1 justify-center py-3 text-[13px]">Done →</button>
                </div>
              </div>
            </div>
          )}

          {step === 'done' && roomId && (
            <div className="card-lg p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-display text-[#1A1A18] text-[1.6rem] mb-2">Room Listed!</h2>
              <p className="text-[13px] text-[#6B6B67] mb-8">Your room is now live and visible to tenants.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/owner/add"><span className="btn btn-outline px-5 py-3 text-[13px]">Add Another</span></Link>
                <Link href={`/room/${roomId}`}><span className="btn btn-outline px-5 py-3 text-[13px]">View Listing</span></Link>
                <Link href="/owner"><span className="btn btn-dark px-5 py-3 text-[13px]">Go to Dashboard</span></Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
