'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '검토 중', color: '#B45309', bg: '#FEF3C7' },
  confirmed: { label: '확정', color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: '거절됨', color: '#B91C1C', bg: '#FEE2E2' },
  closed: { label: '마감', color: '#64748B', bg: '#F1F5F9' },
}

// 마감일이 지났으면 상태를 '마감'으로 화면에서만 덮어씀 (DB는 그대로 둠)
function getEffectiveStatus(req: any): string {
  if (req.deadline && (req.status === 'pending' || !req.status)) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(req.deadline)
    if (deadlineDate < today) return 'closed'
  }
  return req.status || 'pending'
}

export default function RequestsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAllRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('전체 의뢰 목록 조회 오류:', error)
          setLoading(false)
          return
        }

        const list = data || []
        const instructorIds = Array.from(new Set(list.map(r => r.instructor_id).filter(Boolean)))
        let instructorMap: Record<string, any> = {}

        if (instructorIds.length > 0) {
          const { data: instructorsData } = await supabase
            .from('instructors')
            .select('id, name, photo_url')
            .in('id', instructorIds)

          instructorMap = (instructorsData || []).reduce((acc: any, inst: any) => {
            acc[inst.id] = inst
            return acc
          }, {})
        }

        const merged = list.map(r => ({
          ...r,
          instructor: r.instructor_id ? instructorMap[r.instructor_id] : null,
        }))

        setRequests(merged)
      } catch (err) {
        console.error('데이터 통신 오류:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllRequests()
  }, [supabase])

  const statusInfo = (status: string) => STATUS_LABELS[status] || { label: status || '모집 중', color: '#2563EB', bg: '#EFF6FF' }

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .req-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .req-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.08);
          border-color: rgba(37,99,235,0.25) !important;
        }
        .new-req-btn {
          transition: transform 0.15s ease, filter 0.15s ease;
        }
        .new-req-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.06);
        }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 전체 강의 의뢰 현황
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          강사분들은 조건에 맞춰 출강 제안을 하실 수 있어요
        </p>
      </section>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', color: '#475569' }}>
            총 <strong style={{ color: '#2563EB' }}>{requests.length}건</strong>의 의뢰
          </div>
          <Link href="/requests/new" className="new-req-btn" style={{
            fontSize: '13.5px', fontWeight: '700', color: '#fff',
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            padding: '10px 18px', borderRadius: '10px', textDecoration: 'none'
          }}>
            + 강의 의뢰 등록
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            강의 의뢰 목록을 불러오는 중입니다...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>등록된 강의 의뢰가 없어요</div>
            <div style={{ fontSize: '13px', color: '#94A3B8' }}>첫 강의 의뢰를 등록해보세요!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {requests.map((req) => {
              const effectiveStatus = getEffectiveStatus(req)
              const s = statusInfo(effectiveStatus)
              const isClosed = effectiveStatus === 'closed'
              return (
                <Link href={`/requests/${req.id}`} key={req.id} className="req-card" style={{
                  background: '#fff', padding: '22px', borderRadius: '16px',
                  border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  opacity: isClosed ? 0.65 : 1
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: s.color, background: s.bg, padding: '4px 10px', borderRadius: '6px' }}>
                        {s.label}
                      </span>
                      {req.instructor ? (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1E3A8A', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                          🎯 {req.instructor.name} 강사 지정
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', background: '#F1F5F9', padding: '4px 10px', borderRadius: '6px' }}>
                          전체 공개 의뢰
                        </span>
                      )}
                      {req.attachment_url && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#0F766E', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px' }}>
                          📎 첨부 있음
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                      {req.created_at ? new Date(req.created_at).toLocaleDateString('ko-KR') : ''}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
                    {req.title || '(제목 없음)'}
                  </h2>

                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                    🏢 {req.company_name || '기업명 미상'} {req.contact_person && `· 담당자 ${req.contact_person}`}
                  </div>

                  <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', color: '#334155', background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px' }}>
                    {req.schedule && <span>📅 {req.schedule}</span>}
                    {req.budget && <span>💰 {req.budget}</span>}
                    {req.phone && <span>📞 {req.phone}</span>}
                    {req.deadline && (
                      <span style={{ color: isClosed ? '#EF4444' : '#334155', fontWeight: isClosed ? 700 : 400 }}>
                        ⏰ {isClosed ? '마감됨' : `${req.deadline} 마감`}
                      </span>
                    )}
                  </div>

                  {req.description && (
                    <p style={{
                      fontSize: '13.5px', color: '#64748B', margin: '12px 0 0',
                      whiteSpace: 'pre-wrap', lineHeight: '1.6',
                      display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {req.description}
                    </p>
                  )}

                  <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#2563EB', fontWeight: 700 }}>
                    자세히 보기 →
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}