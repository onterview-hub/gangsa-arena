'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FaqPage() {
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadFaqs()
  }, [])

  const loadFaqs = async () => {
    const { data } = await supabase
      .from('faq')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
    setFaqs(data || [])
    setLoading(false)
  }

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  const defaultFaqs = [
    {
      id: '1',
      question: '강사 등록은 무료인가요?',
      answer: '네, 강사 등록은 완전 무료입니다. 프로필을 등록하고 기업의 연락을 받을 수 있어요. 프리미엄 멤버십(월 5,500원)을 통해 상단에 노출되고 배지를 받을 수 있습니다.'
    },
    {
      id: '2',
      question: '연락처 열람 비용은 얼마인가요?',
      answer: '강사 연락처 열람 시 1,000 마일리지가 차감됩니다. 마일리지는 대시보드에서 충전하실 수 있어요. 열람 후 환불은 불가합니다.'
    },
    {
      id: '3',
      question: 'PDF 제안서 다운로드는 누가 가능한가요?',
      answer: '기업 회원만 PDF 다운로드가 가능합니다. 비회원이나 강사 회원은 다운로드가 제한됩니다.'
    },
    {
      id: '4',
      question: '섭외 수수료는 어떻게 되나요?',
      answer: '플랫폼 수수료는 강사료의 20%입니다. 강의 의뢰 등록 시 자동으로 계산해드려요.'
    },
    {
      id: '5',
      question: '프리미엄 강사 혜택은 무엇인가요?',
      answer: '프리미엄 강사(월 5,500원)는 검색 결과 상단에 노출되고, 프로필에 프리미엄 배지가 표시됩니다. 홈 화면 프리미엄 강사 섹션에도 노출됩니다.'
    },
  ]

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs

  return (
    <main style={{ background: '#F7F8FA', minHeight: '100vh', fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');

        .faq-item {
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .faq-item:hover {
          box-shadow: 0 4px 14px rgba(15,23,42,0.06);
        }
        .faq-q:hover {
          background: #F8FAFC;
        }
      `}</style>

      {/* 서브 히어로 */}
      <section style={{
        background: 'radial-gradient(ellipse 700px 320px at 50% -20%, rgba(96,165,250,0.5), transparent 60%), linear-gradient(180deg, #0B1E4D 0%, #1E3A8A 100%)',
        padding: '48px 20px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', marginBottom: '8px', letterSpacing: '-0.4px' }}>
          ❓ 자주 묻는 질문
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(226,232,255,0.8)' }}>궁금한 점을 확인해보세요</p>
      </section>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px 60px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>로딩 중...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayFaqs.map(faq => (
              <div key={faq.id} className="faq-item" style={{
                background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
                borderRadius: '14px', overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}>
                <div onClick={() => toggleFaq(faq.id)} className="faq-q" style={{
                  padding: '17px 22px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      color: '#fff', background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                      fontSize: '13px', fontWeight: '800', width: '24px', height: '24px',
                      borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>Q</span>
                    <span style={{ fontSize: '14.5px', fontWeight: '700', color: '#0F172A' }}>
                      {faq.question}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px', color: '#94A3B8',
                    transform: openId === faq.id ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s', flexShrink: 0
                  }}>
                    ∨
                  </span>
                </div>
                {openId === faq.id && (
                  <div style={{
                    padding: '0 22px 18px',
                    borderTop: '0.5px solid rgba(0,0,0,0.06)'
                  }}>
                    <div style={{
                      paddingTop: '14px', fontSize: '13.5px',
                      color: '#475569', lineHeight: '1.7'
                    }}>
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}