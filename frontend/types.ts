
export interface User {
  user_id: string;
  username: string;
  phone?: string;
  name: string
}

export interface UserWithPhone {
  email: string,
  avatar: string,
  phone: string
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthenticatedUser {
  user: User;
  token: AuthTokens;
}

export interface Conversation {
  id: string;
  participants: User[];
  last_message?: Message; 
  name: string;
}

export interface Message {
  sender_id: string;
  messeage: string;
  created_at: number;
}

// WebSocket message types
export type WSMessageType = 'join_conversation' | 'join_success' | 'new_message' | 'message_received' | 'user_online' | 'user_offline' | 'new_conversation';

export interface WSMessage {
  type: WSMessageType;
  conversation_id: string;
  sender_id: string;
  messeage: string;
  created_at: number;
}
