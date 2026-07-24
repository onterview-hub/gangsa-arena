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
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 900px 500px at 50% -10%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #14297A 55%, #1E3A8A 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .type-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .type-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.18);
        }
        .confirm-btn:not(:disabled) {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .confirm-btn:not(:disabled):hover {
          transform: translateY(-2px);
          filter: brightness(1.08);
        }
      `}</style>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '20px', padding: '6px 16px', fontSize: '12.5px', color: '#DCE6FF',
        marginBottom: '20px', fontWeight: 600
      }}>
        👋 강사아레나에 오신 걸 환영해요
      </div>

      <div style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px', color: '#fff', letterSpacing: '-0.3px' }}>
        어떤 회원이신가요?
      </div>
      <div style={{ color: 'rgba(226,232,255,0.75)', fontSize: '14px', marginBottom: '40px' }}>
        한 번 선택하면 변경이 어려워요
      </div>

      <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div onClick={() => setSelected('instructor')} className="type-card" style={{
          background: selected === 'instructor' ? 'linear-gradient(135deg, #fff 0%, #F0F6FF 100%)' : '#fff',
          border: selected === 'instructor' ? '2px solid #2563EB' : '2px solid transparent',
          borderRadius: '18px', padding: '36px 26px', width: '190px',
          cursor: 'pointer', textAlign: 'center',
          boxShadow: selected === 'instructor' ? '0 8px 24px rgba(37,99,235,0.25)' : '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ fontSize: '38px', marginBottom: '14px' }}>🎤</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>강사</div>
          <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px', lineHeight: '1.5' }}>
            프로필을 등록하고<br />기업 제안을 받으세요
          </div>
        </div>

        <div onClick={() => setSelected('company')} className="type-card" style={{
          background: selected === 'company' ? 'linear-gradient(135deg, #fff 0%, #F0F6FF 100%)' : '#fff',
          border: selected === 'company' ? '2px solid #2563EB' : '2px solid transparent',
          borderRadius: '18px', padding: '36px 26px', width: '190px',
          cursor: 'pointer', textAlign: 'center',
          boxShadow: selected === 'company' ? '0 8px 24px rgba(37,99,235,0.25)' : '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          <div style={{ fontSize: '38px', marginBottom: '14px' }}>🏢</div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A' }}>기업</div>
          <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '6px', lineHeight: '1.5' }}>
            강사를 검색하고<br />섭외 의뢰를 보내세요
          </div>
        </div>
      </div>

      <button onClick={handleConfirm} disabled={loading} className="confirm-btn" style={{
        marginTop: '36px', padding: '13px 36px',
        background: selected ? 'linear-gradient(135deg, #2563EB, #1D4ED8)' : 'rgba(255,255,255,0.2)',
        color: '#fff', border: 'none', borderRadius: '12px',
        fontSize: '15px', fontWeight: '700',
        cursor: selected ? 'pointer' : 'not-allowed'
      }}>
        {loading ? '저장 중...' : '선택 완료'}
      </button>
    </div>
  )
}