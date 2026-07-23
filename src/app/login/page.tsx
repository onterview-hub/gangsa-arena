'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [magicMode, setMagicMode] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single()

      toast.success('로그인 성공!')
      setTimeout(() => {
        if (!profile?.user_type) {
          window.location.href = '/onboarding'
        } else if (profile.user_type === 'instructor') {
          window.location.href = '/dashboard/instructor'
        } else if (profile.user_type === 'company') {
          window.location.href = '/dashboard/company'
        } else {
          window.location.href = '/'
        }
      }, 800)
    } catch (err: any) {
      toast.error('로그인 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      toast.success('가입 확인 이메일을 발송했어요! 이메일을 확인해주세요 📧')
    } catch (err: any) {
      toast.error('회원가입 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('이메일을 입력해주세요'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
      toast.success('로그인 링크를 이메일로 발송했어요 📧')
    } catch (err: any) {
      toast.error('발송 실패: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (err: any) {
      toast.error('카카오 로그인 실패: ' + err.message)
    }
  }

  const handleNaverLogin = () => {
    window.location.href = '/api/auth/naver/login'
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Toaster position="bottom-right" />
      <div style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '36px 32px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#2563EB', marginBottom: '4px' }}>강사아레나</div>
          <div style={{ fontSize: '13px', color: '#475569' }}>강사와 기업을 연결하는 전문 플랫폼</div>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button onClick={handleKakaoLogin} style={{
            padding: '12px', background: '#FEE500', border: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            💬 카카오로 시작하기
          </button>
          <button onClick={handleNaverLogin} style={{
            padding: '12px', background: '#03C75A', border: 'none',
            borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            N 네이버로 시작하기
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 20px' }}>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }}></div>
          <span style={{ fontSize: '12px', color: '#94A3B8' }}>또는 이메일로</span>
          <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }}></div>
        </div>

        <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '10px', padding: '4px', marginBottom: '24px' }}>
          <button onClick={() => { setMode('login'); setMagicMode(false) }} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            background: mode === 'login' ? '#fff' : 'transparent',
            color: mode === 'login' ? '#2563EB' : '#475569',
            boxShadow: mode === 'login' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}>로그인</button>
          <button onClick={() => { setMode('signup'); setMagicMode(false) }} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
            background: mode === 'signup' ? '#fff' : 'transparent',
            color: mode === 'signup' ? '#2563EB' : '#475569',
            boxShadow: mode === 'signup' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
          }}>회원가입</button>
        </div>

        {magicMode ? (
          <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이메일</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '12px', background: '#2563EB', color: '#fff', border: 'none',
              borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              {loading ? '발송 중...' : '✉️ 매직링크 발송'}
            </button>
            <button type="button" onClick={() => setMagicMode(false)} style={{
              padding: '10px', background: 'none', border: 'none', fontSize: '13px', color: '#475569', cursor: 'pointer'
            }}>← 비밀번호로 로그인</button>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>이메일</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>비밀번호</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? '8자 이상 입력' : '비밀번호 입력'}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '12px', background: '#2563EB', color: '#fff', border: 'none',
              borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>
              {loading ? (mode === 'login' ? '로그인 중...' : '가입 중...') : (mode === 'login' ? '로그인' : '회원가입')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }}></div>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>또는</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.1)' }}></div>
            </div>

            <button type="button" onClick={() => setMagicMode(true)} style={{
              padding: '11px', background: '#F8FAFC', border: '0.5px solid rgba(0,0,0,0.18)',
              borderRadius: '10px', fontSize: '13px', color: '#475569', cursor: 'pointer', fontWeight: '500'
            }}>
              ✉️ 이메일 매직링크로 로그인
            </button>
          </form>
        )}
      </div>
    </main>
  )
}