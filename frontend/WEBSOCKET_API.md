# WebSocket API Documentation

## Kết nối WebSocket

**Endpoint**: `ws://localhost:8080/ws` (hoặc `/ws` trên server của bạn)

**Authentication**: Cần gửi JWT token trong header khi upgrade connection

**Headers**:
```
Authorization: Bearer <access_token>
```

---

## Message Format

Tất cả messages đều có format JSON:

```json
{
  "type": "message_type",
  "conversation_id": "string",
  "sender_id": "string",
  "message": "string",
  "created_at": 1234567890
}
```

---

## 1. Events từ Client → Server

### 1.1. Join Conversation
Khi user mở một conversation để chat

**Gửi**:
```json
{
  "type": "join_conversation",
  "conversation_id": "conv_123",
  "sender_id": "user_456"
}
```

**Nhận lại**:
```json
{
  "type": "join_success",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "created_at": 1234567890
}
```

---

### 1.2. Send Message
Gửi tin nhắn mới trong conversation

**Gửi**:
```json
{
  "type": "new_message",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "message": "Hello world!",
  "created_at": 1234567890
}
```

**Lưu ý**:
- Message sẽ được lưu vào database tự động
- Message sẽ được broadcast đến tất cả participants trong conversation

---

### 1.3. Logout
Ngắt kết nối WebSocket

**Gửi**:
```json
{
  "type": "logout"
}
```

---

## 2. Events từ Server → Client

### 2.1. User Online
Khi có user online (kể cả chính mình khi vừa connect)

**Nhận**:
```json
{
  "type": "user_online",
  "sender_id": "user_789",
  "created_at": 1234567890
}
```

**Xử lý**:
- Thêm `user_789` vào danh sách online users
- Update UI hiển thị trạng thái online

---

### 2.2. User Offline
Khi có user offline

**Nhận**:
```json
{
  "type": "user_offline",
  "sender_id": "user_789",
  "created_at": 1234567890
}
```

**Xử lý**:
- Xóa `user_789` khỏi danh sách online users
- Update UI hiển thị trạng thái offline

---

### 2.3. New Conversation
Khi có người tạo conversation mới với bạn

**Nhận**:
```json
{
  "type": "new_conversation",
  "conversation_id": "conv_999",
  "sender_id": "user_123",
  "created_at": 1234567890
}
```

**Xử lý**:
- Fetch thông tin conversation mới từ API
- Thêm conversation vào danh sách
- Hiển thị notification cho user

---

### 2.4. New Message
Khi có tin nhắn mới trong conversation bạn đã join

**Nhận**:
```json
{
  "type": "new_message",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "message": "Hello!",
  "created_at": 1234567890
}
```

**Xử lý**:
- Nếu đang mở conversation này: hiển thị message ngay lập tức
- Nếu không: hiển thị notification + badge số tin nhắn chưa đọc

---

### 2.5. Join Success
Confirmation khi join conversation thành công

**Nhận**:
```json
{
  "type": "join_success",
  "conversation_id": "conv_123",
  "sender_id": "user_456",
  "created_at": 1234567890
}
```

**Xử lý**:
- Đánh dấu đã join conversation thành công
- Có thể bắt đầu gửi/nhận messages

---

## 3. Flow sử dụng

### 3.1. Khi User Login
```
1. Connect WebSocket với JWT token
2. Server tự động gửi danh sách online users (nhiều messages "user_online")
3. Frontend update UI hiển thị users online
```

### 3.2. Khi User mở Conversation
```
1. Frontend gửi: { type: "join_conversation", conversation_id: "...", sender_id: "..." }
2. Server gửi lại: { type: "join_success", ... }
3. Frontend ready để nhận/gửi messages
```

### 3.3. Khi User gửi Message
```
1. Frontend gửi: { type: "new_message", conversation_id: "...", message: "...", ... }
2. Server lưu vào DB
3. Server broadcast đến tất cả participants
4. Tất cả participants nhận: { type: "new_message", ... }
```

### 3.4. Khi User tạo Conversation mới
```
1. Frontend gọi API POST /conversations (không phải WebSocket)
2. Server tạo conversation, lưu DB
3. Server tự động gửi WebSocket: { type: "new_conversation", ... } đến recipient
4. Recipient nhận notification real-time
```

---

## 4. Error Handling

### Connection Errors
- Nếu JWT invalid → WebSocket connection bị reject (401)
- Nếu connection drop → Frontend nên auto-reconnect

### Message Errors
- Nếu format sai → Server log error, skip message
- Nếu conversation không tồn tại → Broadcast skip

---

## 5. Heartbeat (Ping/Pong)

Server tự động gửi ping mỗi **54 giây** (pingPeriod)

Client **không cần** xử lý gì, browser WebSocket API tự động reply pong

Nếu **60 giây** (pongWait) không nhận pong → Server ngắt connection

---

## 6. Code Example (Frontend)

```javascript
// Kết nối
const ws = new WebSocket('ws://localhost:8080/ws', [], {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Nhận messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch(message.type) {
    case 'user_online':
      addOnlineUser(message.sender_id);
      break;

    case 'user_offline':
      removeOnlineUser(message.sender_id);
      break;

    case 'new_conversation':
      fetchConversationDetails(message.conversation_id);
      showNotification('New conversation!');
      break;

    case 'new_message':
      if (currentConversationId === message.conversation_id) {
        displayMessage(message);
      } else {
        incrementUnreadCount(message.conversation_id);
      }
      break;

    case 'join_success':
      console.log('Joined conversation:', message.conversation_id);
      break;
  }
};

// Gửi message
function sendMessage(conversationId, text) {
  ws.send(JSON.stringify({
    type: 'new_message',
    conversation_id: conversationId,
    sender_id: myUserId,
    message: text,
    created_at: Date.now() / 1000
  }));
}

// Join conversation
function joinConversation(conversationId) {
  ws.send(JSON.stringify({
    type: 'join_conversation',
    conversation_id: conversationId,
    sender_id: myUserId
  }));
}
```

---

## 7. Lưu ý quan trọng

1. **Join trước khi chat**: Phải gửi `join_conversation` trước khi có thể nhận messages
2. **Typo**: Backend đang dùng `message` (sai chính tả) thay vì `message`
3. **Timestamp**: `created_at` là Unix timestamp (seconds, không phải milliseconds)
4. **Broadcast**: Messages chỉ gửi đến users đã join conversation
5. **Online status**: Tự động broadcast khi connect/disconnect, không cần client gửi
