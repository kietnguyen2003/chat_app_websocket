import { AuthenticatedUser, Conversation, Message, User, AuthTokens } from '../types';
import { API_BASE_URL } from '../constants';

interface ApiResponse<T> {
  status: 'success' | 'fail';
  message: string;
  data: T | null;
}

interface findUserByPhoneResponse{
    email: string,
    name: string,
    phone: string
}

interface AuthApiResponse {
  user: {
    user_id: string;
    name: string;
  };
  token: {
    access_token: string;
    refresh_token: string;
  };
}

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data: ApiResponse<T> = await response.json();

  if (data.status === 'fail' || !response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data.data as T;
};

// --- AUTH API ---
export const login = async (username: string, password: string): Promise<AuthenticatedUser> => {

  const authData = await apiRequest<AuthApiResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return {
    user: {
      user_id: authData.user.user_id,
      username: username,
      name: authData.user.name
    },
    token: authData.token,
  };
};

export const register = async (username: string, email: string, password: string, phone: string, name:string): Promise<AuthenticatedUser> => {

  const authData = await apiRequest<AuthApiResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, phone, email, password, name }),
  });

  return {
    user: {
      user_id: authData.user.user_id,
      username: username,
      phone: phone,
      name: authData.user.name
    },
    token: authData.token,
  };
};


export const findUserByPhone = async (phone: string, token: string): Promise<User> => {

  const userData = await apiRequest<findUserByPhoneResponse>('/user/find-by-phone', {
    method: 'POST',
    body: JSON.stringify({ phone }),
    headers: { Authorization: `Bearer ${token}` },
  });

  // Backend chỉ trả về email, avatar, phone
  // Tạo user_id và username tạm từ phone
  return {
    user_id: phone, // Dùng phone làm ID tạm
    username: userData.email.split('@')[0], // Lấy phần trước @ của email làm username
    phone: userData.phone,
    name: 'user',
  };
};

interface ConversationAPIResponse {
  conversation_id: string;
  participant: Array<{
    _id: string;
    name: string;
  }>;
}

export const getConversations = async (token: string, currentUserId: string, currentUsername?: string): Promise<Conversation[]> => {

  try {
    const data = await apiRequest<{ conversation_list: ConversationAPIResponse[] }>('/user/conversation', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });


    if (!data.conversation_list || data.conversation_list.length === 0) {
      return [];
    }

    // Chuyển đổi từ API response sang frontend Conversation format
    const conversationPromises = data.conversation_list.map(async (conv) => {
      try {
        // Lấy messages để có last_message
        const messagesData = await getMessages(conv.conversation_id, token);


        // Map participants từ backend với real user_id
        const participants: User[] = conv.participant.map((p) => ({
          user_id: p._id,
          username: p.name, // Use name as username for display
          name: p.name
        }));


        // Tìm tên của conversation partner (không phải current user)
        const conversationName = conv.participant.find(p => p._id !== currentUserId)?.name
          || conv.participant[0]?.name
          || 'Unknown';


        return {
          id: conv.conversation_id,
          participants: participants,
          name: conversationName,
          last_message: messagesData?.messeages && messagesData.messeages.length > 0
            ? messagesData.messeages[messagesData.messeages.length - 1]
            : undefined
        } as Conversation;
      } catch (error) {
        console.error(`Failed to fetch messages for conversation ${conv.conversation_id}:`, error);
        // Vẫn trả về conversation ngay cả khi không lấy được messages
        const participants: User[] = conv.participant.map((p) => ({
          user_id: p._id,
          username: p.name, // Use name as username for display
          name: p.name
        }));

        const conversationName = conv.participant.find(p => p._id !== currentUserId)?.name
          || conv.participant[0]?.name
          || 'Unknown';

        return {
          id: conv.conversation_id,
          participants: participants,
          name: conversationName,
          last_message: undefined
        } as Conversation;
      }
    });

    const conversations = await Promise.all(conversationPromises);
    return conversations.filter((c): c is Conversation => c !== null);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return [];
  }
};

export const logout = async (userID: string, refreshToken: string): Promise<void> => {

  await apiRequest<null>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ userID, refresh_token: refreshToken }),
  });
};

export const refreshToken = async (userID: string, refreshToken: string): Promise<AuthenticatedUser> => {

  const authData = await apiRequest<AuthApiResponse>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ userID, refresh_token: refreshToken }),
  });

  return {
    user: {
      user_id: authData.user.user_id,
      username: '', // Backend không trả về username trong refresh
      name: authData.user.name
    },
    token: authData.token,
  };
};

// --- CHAT API ---
export const createConversation = async (friend_phone: string, token: string): Promise<{id: string}> => {

  const data = await apiRequest<{ conversation_id: string }>('/chat/conversation', {
    method: 'POST',
    body: JSON.stringify({ friend_phone }),
    headers: { Authorization: `Bearer ${token}` },
  });

  // Backend trả về conversation_id, chuyển thành id cho frontend
  return { id: data.conversation_id };
};

export const getMessages = async (conversationId: string, token: string): Promise<{ conversation_id: string; messeages: Message[] }> => {

  const data = await apiRequest<{ conversation_id: string; messeages: Message[] }>(
    `/chat/conversation/${conversationId}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return data;
};

export const sendMessage = async (conversation_id: string, messeage: string, token: string): Promise<{ messeage: string; created_at: number }> => {

  const data = await apiRequest<{ messeage: string; created_at: number }>('/chat/send', {
    method: 'POST',
    body: JSON.stringify({ conversation_id, messeage }),
    headers: { Authorization: `Bearer ${token}` },
  });

  return data;
};
