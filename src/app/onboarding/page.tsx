'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function OnboardingPage() {
  const [selected, setSelected] = useState<'instructor' | 'company' | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    // 이미 user_type 있으면 대시보드로
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type) {
      if (profile.user_type === 'instructor') router.push('/dashboard/instructor')
      else if (profile.user_type === 'company') router.push('/dashboard/company')
    }
  }

  const handleConfirm = async () => {
    if (!selected) { toast.error('회원 유형을 선택해주세요'); return }
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email || '',
        user_type: selected
      })

    if (error) {
      toast.error('저장 실패: ' + error.message)
      setLoading(false)
      return
    }

    toast.success('환영해요! 🎉')
    setTimeout(() => {
      if (selected === 'instructor') router.push('/dashboard/instructor')
      else router.push('/dashboard/company')
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#F8FAFC',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px'
    }}>
      <Toaster position="bottom-right" />

      <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: '#0F172A' }}>
        어떤 회원이신가요?
      </div>
      <div style={{ color: '#475569', fontSize: '14px', marginBottom: '36px' }}>
        한 번 선택하면 변경이 어려워요
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div onClick={() => setSelected('instructor')} style={{
          background: selected === 'instructor' ? '#EFF6FF' : '#fff',
          border: selected === 'instructor' ? '2px solid #2563EB' : '2px solid rgba(0,0,0,0.1)',
          borderRadius: '16px', padding: '32px 24px', width: '180px',
          cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎤</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>강사</div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
            프로필을 등록하고<br />기업 제안을 받으세요
          </div>
        </div>

        <div onClick={() => setSelected('company')} style={{
          background: selected === 'company' ? '#EFF6FF' : '#fff',
          border: selected === 'company' ? '2px solid #2563EB' : '2px solid rgba(0,0,0,0.1)',
          borderRadius: '16px', padding: '32px 24px', width: '180px',
          cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s'
        }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏢</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>기업</div>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
            강사를 검색하고<br />섭외 의뢰를 보내세요
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} disabled={loading} style={{
        marginTop: '32px', padding: '12px 32px',
        background: selected ? '#2563EB' : '#CBD5E1',
        color: '#fff', border: 'none', borderRadius: '12px',
        fontSize: '15px', fontWeight: '600',
        cursor: selected ? 'pointer' : 'not-allowed',
        transition: 'all 0.18s'
      }}>
        {loading ? '저장 중...' : '선택 완료'}
      </button>
    </div>
  )
}