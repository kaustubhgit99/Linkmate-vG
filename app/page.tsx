'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, ShieldCheck, Zap, Star, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES } from '@/lib/utils'

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1800&q=85',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=85',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800&q=85',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=85',
]

export default function HomePage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [heroIdx, setHeroIdx] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(full_name,phone)')
      .eq('is_available', true).order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => { if (data) setRooms(data); setLoading(false) })
  }, [supabase])

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMGS.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>

      {/* ── HERO ── */}
      <section className="relative h-[100svh] min-h-[580px] max-h-[900px] overflow-hidden">
        {HERO_IMGS.map((src, i) => (
          <div key={src} className={`absolute inset-0 transition-opacity duration-1200 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={src} alt="" fill className="object-cover" priority={i === 0} sizes="100vw"/>
          </div>
        ))}
        <div className="absolute inset-0 img-overlay"/>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center">
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.65}}>
            <div className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-md text-white text-[12px] font-semibold px-4 py-1.5 rounded-full mb-8 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              2,400+ verified rooms across India
            </div>
          </motion.div>

          <motion.h1 initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:0.1,duration:0.65}}
            className="font-display text-white leading-[1.06] mb-5"
            style={{fontSize:'clamp(2.4rem, 6vw, 5rem)'}}>
            Find your next home<br/><em>away from home.</em>
          </motion.h1>

          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2,duration:0.6}}
            className="text-white/65 mb-10 max-w-lg"
            style={{fontSize:'clamp(0.95rem, 2vw, 1.1rem)'}}>
            Discover verified rooms, connect with trusted owners, and move in with confidence.
          </motion.p>

          {/* Search */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.6}}
            className="w-full max-w-xl">
            <div className="search-bar p-1.5">
              <div className="flex items-center flex-1 px-4 gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-[#A8A8A4] shrink-0"/>
                <input list="cities-list" value={city} onChange={e => setCity(e.target.value)}
                  placeholder="Search by city or area..."
                  className="flex-1 bg-transparent outline-none text-[14px] text-[#1A1A18] placeholder-[#A8A8A4] py-2 min-w-0"/>
                <datalist id="cities-list">{CITIES.map(c => <option key={c} value={c}/>)}</datalist>
              </div>
              <button onClick={() => router.push(`/browse${city ? `?city=${encodeURIComponent(city)}` : ''}`)}
                className="btn btn-dark shrink-0 rounded-full px-5 py-3 text-[13px]">
                <Search className="w-4 h-4"/> Search
              </button>
            </div>
            {/* Quick cities */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
              <span className="text-white/40 text-[12px]">Popular:</span>
              {['Mumbai','Bangalore','Delhi','Pune','Hyderabad'].map(c => (
                <button key={c} onClick={() => router.push(`/browse?city=${c}`)}
                  className="text-white/55 hover:text-white text-[12px] transition-colors">{c}</button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Slideshow dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}/>
          ))}
        </div>

        <motion.div animate={{y:[0,6,0]}} transition={{repeat:Infinity,duration:2.4}}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 z-10">
          <ChevronDown className="w-5 h-5"/>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-[#E8E8E6]">
        <div className="max-w-5xl mx-auto px-5 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[{v:'2,400+',l:'Rooms Listed'},{v:'1,800+',l:'Happy Tenants'},{v:'20+',l:'Cities'},{v:'600+',l:'Verified Owners'}].map((s,i)=>(
            <motion.div key={s.l} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}>
              <div className="font-display text-[2rem] sm:text-[2.4rem] text-[#1A1A18]">{s.v}</div>
              <div className="text-[13px] text-[#6B6B67] mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section className="py-16 px-5 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-widest mb-1">Featured</p>
            <h2 className="font-display text-[#1A1A18]" style={{fontSize:'clamp(1.6rem,3vw,2.2rem)'}}>Latest Rooms</h2>
            <p className="text-[14px] text-[#6B6B67] mt-1">Handpicked spaces just for you</p>
          </div>
          <Link href="/browse" className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#1A1A18] hover:opacity-70 transition-opacity">
            View All <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_,i) => <RoomCardSkeleton key={i}/>)}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((r,i) => <RoomCard key={r.id} room={r} userId={user?.id} index={i}/>)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#6B6B67]">
            <div className="text-5xl mb-4">🏠</div>
            <p className="font-semibold text-[#1A1A18]">No rooms yet</p>
            <p className="text-[13px] mt-1 mb-5">Be the first to list one!</p>
            <Link href="/auth/signup"><span className="btn btn-dark px-6 py-3">List a Room</span></Link>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/browse"><span className="btn btn-dark px-8 py-3.5 text-[14px]">Browse All Rooms <ArrowRight className="w-4 h-4"/></span></Link>
        </div>
      </section>

      {/* ── WHY LINKMATE ── */}
      <section className="bg-white py-16 px-5 border-y border-[#E8E8E6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-widest mb-2">Why us</p>
            <h2 className="font-display text-[#1A1A18]" style={{fontSize:'clamp(1.6rem,3vw,2.2rem)'}}>Why Choose LinkMate?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: ShieldCheck, title:'Verified Listings', desc:'Every listing is reviewed by our team to ensure safety and accuracy for our community.', tag:'Safety' },
              { icon: Star, title:'Trusted Owners', desc:'Connect directly with verified property owners. No middlemen, no hidden fees.', tag:'Trust' },
              { icon: Zap, title:'Instant Connect', desc:'Send enquiries directly to owners and get replies fast — all from one place.', tag:'Speed' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
                className="card-lg p-7">
                <div className="w-11 h-11 rounded-xl bg-[#F5F5F4] border border-[#E8E8E6] flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5 text-[#1A1A18]"/>
                </div>
                <span className="badge badge-gray mb-3">{f.tag}</span>
                <h3 className="font-semibold text-[#1A1A18] text-[15px] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[#6B6B67] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-widest mb-2">Process</p>
          <h2 className="font-display text-[#1A1A18]" style={{fontSize:'clamp(1.6rem,3vw,2.2rem)'}}>How LinkMate Works</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {n:'01',t:'Search & Filter',d:'Find rooms by city, price, type and amenities in seconds.'},
            {n:'02',t:'View & Enquire',d:'Explore photos and details. Send a direct enquiry to the owner.'},
            {n:'03',t:'Move In',d:'Get a reply from the owner and move into your perfect room.'},
          ].map((s,i)=>(
            <motion.div key={s.n} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.12}} className="text-center">
              <div className="font-display text-[3rem] text-[#E8E8E6] mb-2">{s.n}</div>
              <h3 className="font-semibold text-[15px] text-[#1A1A18] mb-2">{s.t}</h3>
              <p className="text-[13px] text-[#6B6B67] leading-relaxed">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-5 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden" style={{boxShadow:'var(--shadow-lg)'}}>
            <Image src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80" alt="" width={1400} height={400} className="w-full h-60 sm:h-72 object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/30 flex items-center px-8 sm:px-12">
              <div className="max-w-md">
                <h2 className="font-display text-white mb-2" style={{fontSize:'clamp(1.4rem,3vw,2rem)'}}>Ready to find your room?</h2>
                <p className="text-white/65 text-[13px] mb-6">Join LinkMate and discover thousands of verified rooms across India.</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auth/signup"><span className="btn btn-dark px-6 py-3 text-[13px]" style={{background:'white',color:'#1A1A18'}}>Get Started Free</span></Link>
                  <Link href="/browse"><span className="btn px-6 py-3 text-[13px] text-white border border-white/30 rounded-full hover:bg-white/10 transition-colors">Browse Rooms</span></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#E8E8E6]">
        <div className="max-w-7xl mx-auto px-5 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-[10px] bg-[#1A1A18] flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <span className="font-display text-[17px] text-[#1A1A18]">LinkMate</span>
              </div>
              <p className="text-[13px] text-[#6B6B67] leading-relaxed">Finding your perfect room shouldn&apos;t be hard. LinkMate connects you with verified owners.</p>
            </div>
            {[
              { title:'Quick Links', links:[['Find a Room','/browse'],['List a Room','/auth/signup'],['Sign In','/auth/login']] },
              { title:'Company', links:[['About Us','#'],['Safety Tips','#'],['Contact','#']] },
              { title:'Cities', links:CITIES.slice(0,5).map(c => [c, `/browse?city=${c}`]) },
            ].map(col => (
              <div key={col.title}>
                <p className="text-[11px] font-bold text-[#A8A8A4] uppercase tracking-wider mb-4">{col.title}</p>
                {col.links.map(([l, h]) => (
                  <Link key={l} href={h} className="block text-[13px] text-[#6B6B67] hover:text-[#1A1A18] transition-colors py-1">{l}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8E8E6] pt-6 text-center text-[12px] text-[#A8A8A4]">
            © 2024 LinkMate Technologies. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
