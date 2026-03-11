'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from '@supabase/supabase-js'
import { getSupabase } from './supabase'

interface Profile {
  id: string
  email: string
  full_name: string
  role: 'citizen' | 'owner' | 'admin'
  phone?: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useRef(getSupabase()).current

  const fetchProfile = useCallback(async (uid: string): Promise<Profile | null> => {
    for (let i = 0; i < 5; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const { data, error } = await supabase.from('users').select('*').eq('id', uid).single()
      if (!error && data) return data as Profile
    }
    return null
  }, [supabase])

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (!cancelled) { setProfile(prof); setLoading(false) }
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (session?.user) {
        setUser(session.user)
        const prof = await fetchProfile(session.user.id)
        if (!cancelled) { setProfile(prof); setLoading(false) }
      } else {
        setUser(null); setProfile(null); setLoading(false)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [fetchProfile, supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }, [supabase])

  return { user, profile, loading, signOut }
}

export function useFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<string[]>([])
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    if (!userId) return
    supabase.from('favorites').select('room_id').eq('user_id', userId)
      .then(({ data }) => { if (data) setFavorites(data.map((f: any) => f.room_id)) })
  }, [userId, supabase])

  const toggleFavorite = useCallback(async (roomId: string) => {
    if (!userId) return
    const isFav = favorites.includes(roomId)
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', userId).eq('room_id', roomId)
      setFavorites(p => p.filter(id => id !== roomId))
    } else {
      await supabase.from('favorites').insert({ user_id: userId, room_id: roomId })
      setFavorites(p => [...p, roomId])
    }
  }, [userId, favorites, supabase])

  return { favorites, toggleFavorite }
}
