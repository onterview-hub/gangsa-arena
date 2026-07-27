'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_EMAILS = ['sketchon@daum.net']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
        router.push('/')
        return
      }
      setAllowed(true)
      setChecked(true)
    }
    checkAdmin()
  }, [])

  if (!checked) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F8FA' }}>
        <p style={{ color: '#94A3B8', fontSize: '14px' }}>권한 확인 중입니다...</p>
      </div>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}