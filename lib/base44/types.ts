export type Base44User = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string | null;
  avatar_url?: string | null;
};

export type Base44Agent = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'disabled';
  description?: string | null;
  channels?: {
    type: 'chat' | 'email' | 'whatsapp' | 'widget' | string;
    enabled: boolean;
  }[];
  settings?: Record<string, unknown>;
};

export type Base44ConversationParticipant = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  metadata?: Record<string, unknown>;
};

export type Base44Message = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  sender_id?: string | null;
  sender_type?: string | null;
  sender_name?: string | null;
  content: string;
  created_at: string;
  metadata?: Record<string, unknown>;
};

export type Base44Conversation = {
  id: string;
  agent_id: string;
  subject?: string | null;
  status: 'open' | 'closed' | 'pending' | 'snoozed' | string;
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent' | string;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
  participants?: Base44ConversationParticipant[];
  messages?: Base44Message[];
  metadata?: Record<string, unknown>;
};

export type Base44LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: Base44User;
};

export type Base44Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  next_page?: number | null;
  prev_page?: number | null;
};
