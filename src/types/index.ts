export type UserType = 'instructor' | 'company' | 'admin'

export type FeeGrade = 'negotiable' | '30-50' | '50-100' | '100+'

export type RequestStatus = 'received' | 'reviewing' | 'in_progress' | 'completed' | 'cancelled'

export type MileageType = 'charge' | 'use' | 'refund'

export interface Profile {
  id: string
  user_type: UserType | null
  name: string
  email: string
  phone: string
  specialty: string
  introduction: string
  fee_grade: FeeGrade
  proposal_url: string
  is_premium: boolean
  premium_expires_at: string | null
  company_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MileageAccount {
  id: string
  user_id: string
  balance: number
  created_at: string
  updated_at: string
}

export interface MileageLog {
  id: string
  user_id: string
  amount: number
  type: MileageType
  reason: string
  balance_after: number
  created_at: string
}

export interface PhoneView {
  id: string
  company_id: string
  instructor_id: string
  cost: number
  created_at: string
}

export interface EscortRequest {
  id: string
  company_id: string
  organization_name: string
  contact_name: string
  contact_phone: string
  topic: string
  budget: number | null
  schedule: string | null
  description: string | null
  status: RequestStatus
  created_at: string
  updated_at: string
}

export interface JobOpening {
  id: string
  company_id: string
  title: string
  content: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Notice {
  id: string
  title: string
  content: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Faq {
  id: string
  question: string
  answer: string
  sort_order: number
  is_published: boolean
  created_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}