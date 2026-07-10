'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NoticesPage() {
  const [notices, setNotices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadNotices()
  }, [])

  const loadNotices = async () => {
    const { data } = await supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    setNotices(data || [])
    setLoading(false)
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* 헤더 */}
      <header style={{
        background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '0 20px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <Link href="/" style={{ fontSize: '18px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}>
          강사아레나
        </Link>
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <Link href="/instructors" style={{ padding: '6px 10px', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>강사검색</Link>
          <Link href="/notices" style={{ padding: '6px 10px', color: '#2563EB', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}>공지사항</Link>
          <Link href="/faq" style={{ padding: '6px 10px', color: '#475569', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
          <Link href="/login" style={{
            marginLeft: '8px', padding: '6px 14px',
            background: '#2563EB', color: '#fff',
            borderRadius: '12px', fontSize: '13px',
            textDecoration: 'none', fontWeight: '500'
          }}>로그인</Link>
        </nav>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '36px 20px' }}>
        <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>공지사항</div>
        <div style={{ fontSize: '13px', color: '#475569', marginBottom: '24px' }}>강사아레나의 새로운 소식을 확인하세요</div>

        {/* 공지 상세 모달 */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '20px'
          }} onClick={() => setSelected(null)}>
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '28px', maxWidth: '600px', width: '100%',
              maxHeight: '80vh', overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                {selected.title}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
                {new Date(selected.created_at).toLocaleDateString('ko-KR')}
              </div>
              <div style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
              <button onClick={() => setSelected(null)} style={{
                marginTop: '20px', padding: '8px 20px',
                background: '#F1F5F9', border: 'none',
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
              }}>닫기</button>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>로딩 중...</div>
        ) : notices.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px',
            background: '#fff', borderRadius: '16px',
            border: '0.5px solid rgba(0,0,0,0.1)',
            color: '#94A3B8', fontSize: '14px'
          }}>
            등록된 공지사항이 없어요
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notices.map(notice => (
              <div key={notice.id} onClick={() => setSelected(notice)} style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px', padding: '16px 20px',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#0F172A', marginBottom: '4px' }}>
                  {notice.title}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {new Date(notice.created_at).toLocaleDateString('ko-KR')} · 관리자
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}