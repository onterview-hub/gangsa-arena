'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [applicants, setApplicants] = useState<Record<string, any[]>>({})
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('job_openings')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: false })

    setJobs(data || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('제목과 내용을 입력해주세요')
      return
    }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editId) {
      const { error } = await supabase
        .from('job_openings')
        .update({ title: form.title, content: form.content })
        .eq('id', editId)
      if (error) { toast.error('수정 실패: ' + error.message) }
      else { toast.success('수정됐어요!'); setEditId(null); setForm({ title: '', content: '' }) }
    } else {
      const { error } = await supabase
        .from('job_openings')
        .insert([{ company_id: user.id, title: form.title, content: form.content, is_active: true }])
      if (error) { toast.error('등록 실패: ' + error.message) }
      else { toast.success('공고가 등록됐어요!'); setForm({ title: '', content: '' }) }
    }
    setSaving(false)
    loadJobs()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 이 공고를 삭제할까요? 지원 내역도 함께 삭제돼요.')) return
    const { error } = await supabase.from('job_openings').delete().eq('id', id)
    if (error) { toast.error('삭제 실패: ' + error.message) }
    else { toast.success('삭제됐어요'); loadJobs() }
  }

  const handleEdit = (job: any) => {
    setEditId(job.id)
    setForm({ title: job.title, content: job.content })
    window.scrollTo(0, 0)
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('job_openings').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error('변경 실패: ' + error.message) }
    else { toast.success(current ? '마감 처리했어요' : '다시 모집중으로 바꿨어요'); loadJobs() }
  }

  const toggleApplicants = async (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null)
      return
    }
    setExpandedJobId(jobId)

    if (!applicants[jobId]) {
      const { data: apps } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      const list = apps || []
      const instructorIds = Array.from(new Set(list.map(a => a.instructor_id)))
      let instMap: Record<string, any> = {}

      if (instructorIds.length > 0) {
        const { data: insts } = await supabase
          .from('instructors')
          .select('id, name, photo_url, phone, email, category')
          .in('id', instructorIds)
        instMap = (insts || []).reduce((acc: any, i: any) => { acc[i.id] = i; return acc }, {})
      }

      setApplicants(prev => ({ ...prev, [jobId]: list.map(a => ({ ...a, instructor: instMap[a.instructor_id] })) }))
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ color: '#94A3B8' }}>로딩 중...</div>
    </div>
  )

  return (
    <div style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toaster position="bottom-right" />
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        .submit-btn:not(:disabled) { transition: transform 0.15s ease, filter 0.15s ease; }
        .submit-btn:not(:disabled):hover { transform: translateY(-2px); filter: brightness(1.06); }
        .job-row { transition: background 0.12s ease; }
        .job-row:hover { background: #F8FAFC; }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center', position: 'relative'
      }}>
        <Link href="/dashboard/company" style={{ position: 'absolute', left: '20px', top: '48px', fontSize: '13px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 600 }}>
          ← 대시보드
        </Link>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          📋 구인공고 관리
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>
          강사를 공개 모집하고 지원자를 확인해보세요
        </p>
      </section>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 등록/수정 폼 */}
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: '16px', padding: '26px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '14.5px', fontWeight: '800', marginBottom: '16px', color: '#0F172A' }}>
            {editId ? '✏️ 공고 수정' : '📝 공고 등록'}
          </div>
          <input type="text" placeholder="공고 제목" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }} />
          <textarea placeholder="모집 조건, 강의 내용, 일정 등을 입력하세요" value={form.content}
            onChange={e => setForm({ ...form, content: e.target.value })}
            rows={4}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: '16px' }} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSubmit} disabled={saving} className="submit-btn" style={{
              padding: '11px 22px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1
            }}>
              {saving ? '저장 중...' : editId ? '수정 완료' : '등록'}
            </button>
            {editId && (
              <button onClick={() => { setEditId(null); setForm({ title: '', content: '' }) }} style={{
                padding: '11px 22px', background: '#F1F5F9', color: '#475569',
                border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer'
              }}>취소</button>
            )}
          </div>
        </div>

        {/* 공고 목록 */}
        <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', marginBottom: '14px' }}>
          등록된 공고 ({jobs.length})
        </div>

        {jobs.length === 0 ? (
          <div style={{ background: '#fff', padding: '48px', textAlign: 'center', color: '#94A3B8', fontSize: '14px', borderRadius: '16px', border: '0.5px solid rgba(0,0,0,0.08)' }}>
            등록된 공고가 없어요
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobs.map(job => (
              <div key={job.id} style={{ background: '#fff', borderRadius: '14px', border: '0.5px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div className="job-row" style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>
                      {job.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {job.created_at ? new Date(job.created_at).toLocaleDateString('ko-KR') : ''}
                      <span style={{
                        padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                        background: job.is_active ? '#DCFCE7' : '#F1F5F9',
                        color: job.is_active ? '#166534' : '#64748B'
                      }}>
                        {job.is_active ? '모집중' : '마감'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                    <button onClick={() => toggleApplicants(job.id)} style={{
                      padding: '7px 12px', background: '#EFF6FF', border: 'none',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#2563EB', cursor: 'pointer'
                    }}>
                      👥 지원자 {expandedJobId === job.id ? '접기' : '보기'}
                    </button>
                    <button onClick={() => handleToggleActive(job.id, job.is_active)} style={{
                      padding: '7px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
                    }}>{job.is_active ? '마감하기' : '재모집'}</button>
                    <button onClick={() => handleEdit(job)} style={{
                      padding: '7px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0',
                      borderRadius: '8px', fontSize: '12px', cursor: 'pointer'
                    }}>수정</button>
                    <button onClick={() => handleDelete(job.id)} style={{
                      padding: '7px 12px', background: '#FEF2F2', border: 'none',
                      borderRadius: '8px', fontSize: '12px', color: '#DC2626', cursor: 'pointer'
                    }}>삭제</button>
                  </div>
                </div>

                {expandedJobId === job.id && (
                  <div style={{ borderTop: '1px solid #F1F5F9', padding: '16px 20px', background: '#F8FAFC' }}>
                    {!applicants[job.id] ? (
                      <div style={{ fontSize: '13px', color: '#94A3B8' }}>불러오는 중...</div>
                    ) : applicants[job.id].length === 0 ? (
                      <div style={{ fontSize: '13px', color: '#94A3B8' }}>아직 지원자가 없어요</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {applicants[job.id].map(app => (
                          <div key={app.id} style={{ background: '#fff', padding: '14px 16px', borderRadius: '10px', border: '0.5px solid rgba(0,0,0,0.06)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <Link href={`/instructors/${app.instructor?.id}`} style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', textDecoration: 'none' }}>
                                {app.instructor?.name || '알 수 없음'} 강사 →
                              </Link>
                              <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                                {new Date(app.created_at).toLocaleDateString('ko-KR')} 지원
                              </span>
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: app.message ? '6px' : 0 }}>
                              {app.instructor?.category && `${app.instructor.category} · `}
                              📞 {app.instructor?.phone || '미기재'} · ✉️ {app.instructor?.email || '미기재'}
                            </div>
                            {app.message && (
                              <div style={{ fontSize: '12.5px', color: '#334155', background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                                {app.message}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}