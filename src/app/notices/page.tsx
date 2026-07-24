'use client'

import { useState, useEffect } from 'react'
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
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .notice-item {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .notice-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(15,23,42,0.08);
          border-color: rgba(37,99,235,0.25) !important;
        }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📢 공지사항
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>강사아레나의 새로운 소식을 확인하세요</p>
      </section>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 공지 상세 모달 */}
        {selected && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(11,30,77,0.55)',
            zIndex: 1000, display: 'flex', alignItems: 'center',
            justifyContent: 'center', padding: '20px'
          }} onClick={() => setSelected(null)}>
            <div style={{
              background: '#fff', borderRadius: '18px',
              padding: '32px', maxWidth: '600px', width: '100%',
              maxHeight: '80vh', overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: '19px', fontWeight: '800', marginBottom: '8px', color: '#0F172A' }}>
                {selected.title}
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
                {new Date(selected.created_at).toLocaleDateString('ko-KR')}
              </div>
              <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {selected.content}
              </div>
              <button onClick={() => setSelected(null)} style={{
                marginTop: '24px', padding: '9px 22px',
                background: '#F1F5F9', border: 'none',
                borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
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
            border: '0.5px solid rgba(0,0,0,0.08)',
            color: '#94A3B8', fontSize: '14px'
          }}>
            등록된 공지사항이 없어요
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notices.map(notice => (
              <div key={notice.id} onClick={() => setSelected(notice)} className="notice-item" style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '14px', padding: '18px 22px',
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A', marginBottom: '5px' }}>
                  📌 {notice.title}
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