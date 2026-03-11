'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES, ROOM_TYPES } from '@/lib/utils'

function BrowseContent() {
  const sp = useSearchParams()
  const { user } = useAuth()
  const supabase = useRef(getSupabase()).current
  const [all, setAll] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [city, setCity] = useState(sp.get('city') || '')
  const [type, setType] = useState('')
  const [avail, setAvail] = useState('')
  const [minP, setMinP] = useState('')
  const [maxP, setMaxP] = useState('')
  const [advanced, setAdvanced] = useState(false)

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(full_name,phone)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const d = data || []
        setAll(d); setFiltered(city ? d.filter((r:any) => r.city === city) : d); setLoading(false)
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let r = [...all]
    if (search) { const s = search.toLowerCase(); r = r.filter(x => x.title?.toLowerCase().includes(s) || x.location?.toLowerCase().includes(s) || x.city?.toLowerCase().includes(s)) }
    if (city) r = r.filter(x => x.city === city)
    if (type) r = r.filter(x => x.room_type === type)
    if (avail === 'true') r = r.filter(x => x.is_available)
    if (avail === 'false') r = r.filter(x => !x.is_available)
    if (minP) r = r.filter(x => x.rent_price >= Number(minP))
    if (maxP) r = r.filter(x => x.rent_price <= Number(maxP))
    setFiltered(r)
  }, [search, city, type, avail, minP, maxP, all])

  const hasFilters = search || city || type || avail || minP || maxP
  const clearAll = () => { setSearch(''); setCity(''); setType(''); setAvail(''); setMinP(''); setMaxP('') }

  return (
    <div className="min-h-screen" style={{background:'var(--bg)'}}>
      <Navbar/>
      <div className="pt-[62px] max-w-7xl mx-auto px-5 py-8">
        <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="mb-7">
          <h1 className="font-display text-[#1A1A18]" style={{fontSize:'clamp(1.6rem,3vw,2.2rem)'}}>Browse Rooms</h1>
          <p className="text-[13px] text-[#6B6B67] mt-1">{loading ? 'Loading...' : `${filtered.length} room${filtered.length!==1?'s':''} found`}</p>
        </motion.div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-[#E8E8E6] p-4 mb-7" style={{boxShadow:'var(--shadow-sm)'}}>
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-40">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A8A4]"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                className="field pl-9 py-2.5 text-[13px]"/>
            </div>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="field py-2.5 text-[13px] w-auto min-w-[130px]">
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={() => setAdvanced(!advanced)}
              className={`btn py-2.5 px-4 rounded-xl border text-[13px] transition-colors ${advanced ? 'border-[#1A1A18] bg-[#1A1A18] text-white' : 'border-[#E8E8E6] bg-white text-[#6B6B67] hover:border-[#D4D4D0]'}`}>
              <SlidersHorizontal className="w-4 h-4"/> Filters
            </button>
            {hasFilters && (
              <button onClick={clearAll} className="btn btn-ghost py-2.5 px-3 text-[13px] text-[#6B6B67]">
                <X className="w-3.5 h-3.5"/> Clear
              </button>
            )}
          </div>
          {advanced && (
            <div className="mt-4 pt-4 border-t border-[#E8E8E6] grid grid-cols-2 sm:grid-cols-4 gap-3">
              <select value={type} onChange={e => setType(e.target.value)} className="field py-2.5 text-[13px]">
                <option value="">All Types</option>
                {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Min Price (₹)" value={minP} onChange={e => setMinP(e.target.value)} className="field py-2.5 text-[13px]"/>
              <input type="number" placeholder="Max Price (₹)" value={maxP} onChange={e => setMaxP(e.target.value)} className="field py-2.5 text-[13px]"/>
              <select value={avail} onChange={e => setAvail(e.target.value)} className="field py-2.5 text-[13px]">
                <option value="">Any Status</option>
                <option value="true">Available</option>
                <option value="false">Occupied</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array(9).fill(0).map((_,i) => <RoomCardSkeleton key={i}/>)}</div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r,i) => <RoomCard key={r.id} room={r} userId={user?.id} index={i}/>)}
          </div>
        ) : (
          <div className="text-center py-24 text-[#6B6B67]">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold text-[#1A1A18] text-[16px] mb-2">No rooms found</h3>
            <p className="text-[13px]">Try adjusting or clearing your filters.</p>
            {hasFilters && <button className="btn btn-outline mt-5 px-6 py-2.5 text-[13px]" onClick={clearAll}>Clear Filters</button>}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg)'}}><div className="w-8 h-8 border-2 border-[#1A1A18] border-t-transparent rounded-full animate-spin"/></div>}>
      <BrowseContent/>
    </Suspense>
  )
}
