import { httpClient } from './http-client'

// Example API endpoints that will automatically handle 401 errors
export const api = {
  // Chat endpoints (example for future use)
  async getMessages(chatId: string) {
    return httpClient.get(`/chat/${chatId}/messages`)
  },

  async sendMessage(chatId: string, message: string) {
    return httpClient.post(`/chat/${chatId}/messages`, { message })
  },

  async getChatRooms() {
    return httpClient.get('/chat/rooms')
  },

  // User endpoints
  async getUserProfile() {
    return httpClient.get('/user/profile')
  },

  async updateUserProfile(data: any) {
    return httpClient.put('/user/profile', data)
  },

  // Any protected endpoint
  async getProtectedData() {
    return httpClient.get('/protected/data')
  },
}

export default api