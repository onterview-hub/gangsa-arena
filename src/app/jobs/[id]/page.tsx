'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'

export default function JobDetailPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const supabase = createClient()

  const [job, setJob] = useState<any>(null)
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myInstructor, setMyInstructor] = useState<any>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id) return
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    const { data: jobData, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !jobData) {
      setLoading(false)
      return
    }
    setJob(jobData)

    if (jobData.company_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', jobData.company_id)
        .maybeSingle()
      setCompany(profileData)
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      const { data: instData } = await supabase
        .from('instructors')
        .select('*')
        .eq('email', session.user.email)
        .maybeSingle()

      if (instData) {
        setMyInstructor(instData)
        const { data: appData } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', id)
          .eq('instructor_id', instData.id)
          .maybeSingle()
        setAlreadyApplied(!!appData)
      }
    }

    setLoading(false)
  }

  const handleApply = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('로그인이 필요해요')
      router.push('/login')
      return
    }
    if (!myInstructor) {
      toast.error('먼저 강사 프로필을 등록해주세요')
      return
    }

    setApplying(true)
    const { error } = await supabase
      .from('job_applications')
      .insert({ job_id: id, instructor_id: myInstructor.id, message })

    if (error) {
      toast.error('지원 실패: ' + error.message)
      setApplying(false)
      return
    }

    toast.success('지원이 완료됐어요!')
    setAlreadyApplied(true)
    setApplying(false)
  }

  if (loading) {
    return (
      <main style={{ background: '#F7F8FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '14px', color: '#94A3B8' }}>불러오는 중입니다...</p>
      </main>
    )
  }

  if (!job) {
    return (
      <main style={{ background: '#F7F8FA', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>공고를 찾을 수 없습니다.</h2>
        <Link href="/jobs" style={{ color: '#2563EB', fontWeight: '700', fontSize: '13.5px', textDecoration: 'none' }}>← 목록으로</Link>
      </main>
    )
  }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        .link-btn { transition: opacity 0.15s ease; }
        .link-btn:hover { opacity: 0.75; }
        .apply-btn:not(:disabled) { transition: transform 0.15s ease, filter 0.15s ease; }
        .apply-btn:not(:disabled):hover { transform: translateY(-2px); filter: brightness(1.06); }
      `}</style>

      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 구인공고 상세
        </h1>
      </section>

      <div style={{ maxWidth: '720px', margin: '-36px auto 0', padding: '0 20px 60px' }}>
        <Link href="/jobs" className="link-btn" style={{ display: 'inline-block', margin: '20px 0 12px', fontSize: '13.5px', color: '#fff', textDecoration: 'none', fontWeight: 600 }}>
          ← 목록으로
        </Link>

        <div style={{ background: '#fff', padding: '32px', borderRadius: '20px', boxShadow: '0 16px 40px rgba(15,23,42,0.12)', border: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#15803D', background: '#DCFCE7', padding: '5px 12px', borderRadius: '8px' }}>
            모집중
          </span>

          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '16px 0 10px', lineHeight: 1.4 }}>
            {job.title}
          </h1>

          <div style={{ fontSize: '13.5px', color: '#475569', marginBottom: '24px' }}>
            🏢 {company?.name || '기업명 미상'} · {job.created_at ? new Date(job.created_at).toLocaleDateString('ko-KR') + ' 등록' : ''}
          </div>

          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>모집 내용</h3>
            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {job.content}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F1F5F9', margin: '24px 0' }} />

          {/* 지원 영역 */}
          {alreadyApplied ? (
            <div style={{ background: '#EFF6FF', padding: '16px 18px', borderRadius: '12px', fontSize: '13.5px', color: '#1E3A8A', fontWeight: 700, textAlign: 'center' }}>
              ✅ 이미 지원한 공고예요. 기업의 연락을 기다려주세요!
            </div>
          ) : myInstructor ? (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>
                지원 메시지 (선택)
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                rows={3} placeholder="간단한 자기소개나 지원 동기를 남겨보세요"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '14px' }} />
              <button onClick={handleApply} disabled={applying} className="apply-btn" style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
                border: 'none', borderRadius: '12px', fontSize: '14.5px', fontWeight: '700',
                cursor: applying ? 'default' : 'pointer', opacity: applying ? 0.7 : 1
              }}>
                {applying ? '지원 중...' : '📩 이 공고에 지원하기'}
              </button>
            </div>
          ) : (
            <div style={{ background: '#FEF3C7', padding: '16px 18px', borderRadius: '12px', fontSize: '13.5px', color: '#92400E', fontWeight: 600, textAlign: 'center' }}>
              강사 프로필을 먼저 등록해야 지원할 수 있어요.{' '}
              <Link href="/dashboard/instructor" style={{ color: '#92400E', textDecoration: 'underline', fontWeight: 800 }}>
                강사 프로필 등록하러 가기
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}