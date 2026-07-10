'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CATEGORY_OPTIONS = [
  'AI',
  '취업',
  '면접',
  '챗GPT',
  '리더십',
  '진로',
  '마케팅',
  '안전·보건'
]

const FEE_OPTIONS = [
  '협의 가능',
  '30-50만원',
  '50-100만원',
  '100만원 이상'
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFees, setSelectedFees] = useState<string[]>([])
  const [headline, setHeadline] = useState('')
  const [experience, setExperience] = useState('')
  const [loading, setLoading] = useState(false)

  // 파일 선택 처리 및 미리보기 (모든 이미지 타입 지원)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  // 카테고리 토글
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // 강사료 토글
  const handleFeeToggle = (fee: string) => {
    if (selectedFees.includes(fee)) {
      setSelectedFees(selectedFees.filter((f) => f !== fee))
    } else {
      setSelectedFees([...selectedFees, fee])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !headline) {
      alert('이름과 한 줄 소개는 필수 입력 사항입니다.')
      return
    }

    if (selectedCategories.length === 0) {
      alert('대표 전문 분야를 최소 1개 이상 선택해 주세요.')
      return
    }

    setLoading(true)

    try {
      let uploadedPhotoUrl = ''

      // 1. 이미지 업로드 (PNG, JPG, JPEG, WEBP, GIF 등 지원)
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'png'
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const filePath = `profiles/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('instructor-photos')
          .upload(filePath, photoFile, {
            contentType: photoFile.type, // 파일 본래 MIME 타입 지정 (JPG, PNG, WEBP 등 연동)
            upsert: true
          })

        if (uploadError) {
          console.error('사진 업로드 실패:', uploadError)
          alert(`사진 업로드 실패: ${uploadError.message}`)
          setLoading(false)
          return
        }

        // 업로드된 이미지 Public URL 가져오기
        const { data: publicUrlData } = supabase.storage
          .from('instructor-photos')
          .getPublicUrl(filePath)

        uploadedPhotoUrl = publicUrlData.publicUrl
      }

      // 2. DB 저장
      const categoryString = selectedCategories.join(', ')
      const feeString = selectedFees.join(', ')

      const { data, error } = await supabase
        .from('instructors')
        .insert([
          {
            name: name,
            photo_url: uploadedPhotoUrl || null,
            email: email || null,
            phone: phone || null,
            category: categoryString,
            fee: feeString || null,
            headline: headline,
            experience: experience,
            bio: headline
          }
        ])
        .select()

      if (error) {
        console.error('프로필 등록 오류:', error)
        alert(`프로필 등록 실패: ${error.message}`)
      } else {
        alert('강사 프로필이 성공적으로 등록되었습니다!')
        router.push('/instructors')
        router.refresh()
      }
    } catch (err: any) {
      console.error('Catch Error:', err)
      alert(`오류가 발생했습니다: ${err.message || err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ background: '#F8FAFC', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
          ➕ 강사 프로필 등록
        </h1>
        <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '28px' }}>
          기업 및 기관 매칭을 위한 전문 강사 프로필 정보를 입력해 주세요.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 이름 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              이름 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>

          {/* 프로필 사진 파일 (JPG, PNG, WEBP 등 지원) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              프로필 사진 등록 (JPG, PNG, WEBP, GIF 지원)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="미리보기"
                  style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #CBD5E1' }}
                />
              ) : (
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#F1F5F9', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#94A3B8' }}>
                  사진 없음
                </div>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/*"
                onChange={handleFileChange}
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          {/* 이메일 & 연락처 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                이메일
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                연락처
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 대표 전문 분야 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              대표 전문 분야 (복수 선택 가능) <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCategories.includes(cat)
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: isSelected ? '700' : '500',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#fff',
                      color: isSelected ? '#2563EB' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? `✓ ${cat}` : `+ ${cat}`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 희망 강사료 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
              희망 강사료 (복수 선택 가능)
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {FEE_OPTIONS.map((fee) => {
                const isSelected = selectedFees.includes(fee)
                return (
                  <button
                    key={fee}
                    type="button"
                    onClick={() => handleFeeToggle(fee)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: isSelected ? '700' : '500',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                      background: isSelected ? '#EFF6FF' : '#fff',
                      color: isSelected ? '#2563EB' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {isSelected ? `✓ ${fee}` : `+ ${fee}`}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 한 줄 소개 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              한 줄 소개 <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="예: 생성형 AI 및 업무 생산성 혁신 전문 강사"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>

          {/* 주요 경력 */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              주요 경력 및 강의 이력
            </label>
            <textarea
              rows={5}
              placeholder="주요 출강 기관, 대표 강의 주제, 경력 사항 등을 작성해 주세요."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px',
              background: loading ? '#94A3B8' : '#2563EB',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '10px'
            }}
          >
            {loading ? '프로필 및 이미지 업로드 중...' : '강사 프로필 등록하기'}
          </button>
        </form>
      </div>
    </main>
  )
}