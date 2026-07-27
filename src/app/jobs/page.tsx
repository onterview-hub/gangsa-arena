'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function JobsListPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('job_openings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('구인공고 조회 오류:', error)
        setLoading(false)
        return
      }

      const list = data || []
      const companyIds = Array.from(new Set(list.map(j => j.company_id).filter(Boolean)))
      let companyMap: Record<string, any> = {}

      if (companyIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', companyIds)
        companyMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = p
          return acc
        }, {})
      }

      setJobs(list.map(j => ({ ...j, company: companyMap[j.company_id] })))
      setLoading(false)
    }
    fetchJobs()
  }, [supabase])

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        .job-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; display: block; text-decoration: none; color: inherit; }
        .job-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15,23,42,0.08); border-color: rgba(37,99,235,0.25) !important; }
      `}</style>

      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 구인공고
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          기업이 직접 올린 강사 모집 공고예요. 지원하면 기업에게 바로 전달돼요
        </p>
      </section>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 20px 60px' }}>
        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
          총 <strong style={{ color: '#2563EB' }}>{jobs.length}건</strong>의 공고
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            공고를 불러오는 중입니다...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>등록된 구인공고가 없어요</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {jobs.map(job => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="job-card" style={{
                background: '#fff', padding: '22px', borderRadius: '16px',
                border: '0.5px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803D', background: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
                    모집중
                  </span>
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString('ko-KR') : ''}
                  </span>
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>
                  {job.title}
                </h2>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                  🏢 {job.company?.name || '기업명 미상'}
                </div>
                <p style={{
                  fontSize: '13.5px', color: '#64748B', margin: 0,
                  whiteSpace: 'pre-wrap', lineHeight: '1.6',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                }}>
                  {job.content}
                </p>
                <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#2563EB', fontWeight: 700 }}>
                  자세히 보기 →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}