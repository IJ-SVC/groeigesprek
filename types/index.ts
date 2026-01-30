export type ConversationType = 'groepsontwikkelgesprek' | 'inloopgesprek'

export interface ConversationTypeRecord {
  id: string
  name: ConversationType
  description?: string
  created_at: string
}

export interface Session {
  id: string
  conversation_type_id: string
  date: string
  start_time: string
  end_time?: string
  location: string
  is_online: boolean
  teams_link?: string
  facilitator: string
  facilitator_user_id?: string
  max_participants: number
  status: 'draft' | 'published' | 'cancelled'
  cancellation_reason?: string
  target_audience?: string
  notes?: string
  instructions?: string
  created_at: string
  updated_at: string
  created_by: string
  conversation_type?: ConversationTypeRecord
}

export interface Registration {
  id: string
  session_id: string
  email: string
  name: string
  department: string
  status: 'active' | 'cancelled' | 'no_show'
  cancelled_at?: string
  cancellation_token?: string
  created_at: string
  session?: Session
}

export interface Header {
  id: string
  title: string
  subtitle: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface Colleague {
  id: string
  name: string
  email: string
  photo_url?: string
  function?: string
  is_active: boolean
  available_for_spelwerkvorm?: boolean
  created_at: string
  updated_at: string
}

export interface IndividualRequest {
  id: string
  colleague_id: string
  requester_email?: string
  requester_name?: string
  message: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  colleague?: Colleague
}


