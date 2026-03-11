'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const supabase = getSupabase()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    let role = 'citizen'
    for (let i = 0; i < 5; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const { data: prof } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      if (prof?.role) { role = prof.role; break }
    }
    if (role === 'admin') router.replace('/admin')
    else if (role === 'owner') router.replace('/owner')
    else router.replace('/browse')
  }

  return (
    <div className="min-h-screen flex" style={{background:'var(--bg)'}}>
      {/* Left panel — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#1A1A18]">
          <div className="absolute inset-0 opacity-40" style={{backgroundImage:'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80)',backgroundSize:'cover',backgroundPosition:'center'}}/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A18] via-transparent to-transparent"/>
        </div>
        <div className="relative h-full flex flex-col justify-end p-12">
          <div className="flex items-center gap-2.5 mb-auto mt-10">
            <div className="w-8 h-8 rounded-[10px] bg-white/15 backdrop-blur flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="font-display text-white text-[18px]">LinkMate</span>
          </div>
          <div>
            <h2 className="font-display text-white text-[2rem] mb-2">Your perfect room<br/>is waiting.</h2>
            <p className="text-white/50 text-[14px]">Join 1,800+ happy tenants across India.</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-[10px] bg-[#1A1A18] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="font-display text-[18px] text-[#1A1A18]">LinkMate</span>
          </div>

          <h1 className="font-display text-[#1A1A18] mb-1" style={{fontSize:'1.9rem'}}>Welcome back</h1>
          <p className="text-[14px] text-[#6B6B67] mb-8">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[13px] mb-5">
              <AlertCircle className="w-4 h-4 shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="field"/>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#1A1A18] mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="field pr-10"/>
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A8A4] hover:text-[#6B6B67]">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-dark w-full justify-center py-3 mt-2 text-[14px]">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#6B6B67] mt-6">
            No account?{' '}
            <Link href="/auth/signup" className="font-semibold text-[#1A1A18] hover:opacity-70 transition-opacity">Sign up free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
