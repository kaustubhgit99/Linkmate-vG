'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, LayoutDashboard, LogOut, Heart, Plus, Shield } from 'lucide-react'
import { useAuth } from '@/lib/hooks'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const onHero = pathname === '/'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const handleSignOut = async () => { await signOut(); router.push('/') }
  const dashLink = profile?.role === 'admin' ? '/admin' : profile?.role === 'owner' ? '/owner' : '/browse'
  const initial = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  // Nav style: on hero = transparent → white on scroll; on other pages = always white
  const navBg = onHero
    ? scrolled ? 'bg-white/95 backdrop-blur-md border-b border-[#E8E8E6] shadow-[0_1px_8px_rgba(0,0,0,0.06)]' : 'bg-transparent border-b border-transparent'
    : 'bg-white border-b border-[#E8E8E6]'
  const logoColor = onHero && !scrolled ? 'text-white' : 'text-[#1A1A18]'
  const linkColor = onHero && !scrolled ? 'text-white/80 hover:text-white' : 'text-[#6B6B67] hover:text-[#1A1A18]'
  const activeLink = onHero && !scrolled ? 'text-white font-semibold' : 'text-[#1A1A18] font-semibold'

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[62px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-[10px] bg-[#1A1A18] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className={`font-display text-[18px] transition-colors ${logoColor}`}>LinkMate</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {[{ href:'/', label:'Home' }, { href:'/browse', label:'Find a Room' }].map(l => (
            <Link key={l.href} href={l.href}
              className={`btn btn-ghost text-[13px] transition-colors ${pathname === l.href ? activeLink : linkColor}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!loading && (user ? (
            <>
              {profile?.role === 'owner' && (
                <Link href="/owner/add" className="hidden sm:flex">
                  <span className="btn btn-dark text-[13px] py-[8px] px-[16px]">
                    <Plus className="w-3.5 h-3.5"/> List Room
                  </span>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-[#1A1A18] text-white text-[13px] font-semibold flex items-center justify-center hover:opacity-80 transition-opacity">
                    {initial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-2xl border-[#E8E8E6] shadow-lg p-1.5 bg-white">
                  <div className="px-3 py-2 mb-1">
                    <p className="font-semibold text-[13px] text-[#1A1A18] truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-[11px] text-[#A8A8A4] capitalize">{profile?.role}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={dashLink} className="flex items-center gap-2 text-[13px] rounded-xl px-3 py-2 cursor-pointer">
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#A8A8A4]"/> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {profile?.role === 'citizen' && (
                    <DropdownMenuItem asChild>
                      <Link href="/browse/favorites" className="flex items-center gap-2 text-[13px] rounded-xl px-3 py-2 cursor-pointer">
                        <Heart className="w-3.5 h-3.5 text-[#A8A8A4]"/> Saved Rooms
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'owner' && (
                    <DropdownMenuItem asChild>
                      <Link href="/owner/add" className="flex items-center gap-2 text-[13px] rounded-xl px-3 py-2 cursor-pointer">
                        <Plus className="w-3.5 h-3.5 text-[#A8A8A4]"/> Add Room
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 text-[13px] rounded-xl px-3 py-2 cursor-pointer">
                        <Shield className="w-3.5 h-3.5 text-[#A8A8A4]"/> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-[#E8E8E6]"/>
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-[13px] rounded-xl px-3 py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                    <LogOut className="w-3.5 h-3.5"/> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <span className={`btn btn-ghost text-[13px] transition-colors ${onHero && !scrolled ? 'text-white/80 hover:text-white' : ''}`}>Sign In</span>
              </Link>
              <Link href="/auth/signup">
                <span className="btn btn-dark text-[13px] py-[8px] px-[18px]">Get Started</span>
              </Link>
            </div>
          ))}
          <button onClick={() => setOpen(!open)} className={`md:hidden p-2 rounded-xl transition-colors ${onHero && !scrolled ? 'text-white hover:bg-white/10' : 'text-[#6B6B67] hover:bg-[#F5F5F4]'}`}>
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.18}}
            className="md:hidden bg-white border-t border-[#E8E8E6] px-5 py-3 space-y-1 shadow-lg">
            {[{ href:'/', label:'Home' }, { href:'/browse', label:'Find a Room' }].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${pathname === l.href ? 'bg-[#F5F5F4] text-[#1A1A18] font-semibold' : 'text-[#6B6B67] hover:bg-[#F5F5F4] hover:text-[#1A1A18]'}`}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashLink} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-[14px] font-medium text-[#6B6B67] hover:bg-[#F5F5F4] hover:text-[#1A1A18]">Dashboard</Link>
                {profile?.role === 'owner' && <Link href="/owner/add" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl text-[14px] font-medium text-[#6B6B67] hover:bg-[#F5F5F4]">List a Room</Link>}
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link href="/auth/login" className="flex-1" onClick={() => setOpen(false)}>
                  <span className="btn btn-outline w-full text-[13px] justify-center py-3">Sign In</span>
                </Link>
                <Link href="/auth/signup" className="flex-1" onClick={() => setOpen(false)}>
                  <span className="btn btn-dark w-full text-[13px] justify-center py-3">Get Started</span>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
