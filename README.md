# Chat App WebSocket

Ứng dụng chat realtime sử dụng WebSocket, được xây dựng với Go backend và React frontend.

## 📋 Tổng quan

Đây là một ứng dụng chat đầy đủ tính năng với:
- **Backend**: Go với Gin framework, MongoDB, WebSocket (Gorilla)
- **Frontend**: React với TypeScript, Vite
- **Realtime Communication**: WebSocket cho tin nhắn và trạng thái online/offline

## ✨ Tính năng chính

- ✅ Đăng ký và đăng nhập người dùng
- ✅ Xác thực JWT (Access & Refresh tokens)
- ✅ Tìm kiếm người dùng qua số điện thoại
- ✅ Tạo cuộc hội thoại 1-1
- ✅ Gửi và nhận tin nhắn realtime qua WebSocket
- ✅ Theo dõi trạng thái online/offline của người dùng
- ✅ Danh sách cuộc hội thoại với thông tin participants
- ✅ Lịch sử tin nhắn

## 🏗️ Cấu trúc dự án

```
chatapp/
├── backend/              # Go backend server
│   ├── cmd/             # Entry point
│   ├── initial/         # Config & router setup
│   ├── internal/        # Core application code
│   │   ├── application/ # Business logic
│   │   ├── domain/      # Domain entities
│   │   ├── infrastructure/  # Database & WebSocket
│   │   └── interface/   # HTTP handlers
│   ├── go.mod
│   └── README.md        # Chi tiết backend API
│
└── frontend/            # React frontend
    ├── components/      # UI components
    │   ├── auth/       # Authentication pages
    │   └── chat/       # Chat interface
    ├── context/        # React Context (Auth)
    ├── hooks/          # Custom hooks
    ├── services/       # API & WebSocket services
    ├── types.ts        # TypeScript types
    └── README.md       # Chi tiết frontend
```

## 🚀 Bắt đầu

### Yêu cầu hệ thống

- **Go**: 1.24.4 hoặc mới hơn
- **Node.js**: 16.x hoặc mới hơn
- **MongoDB**: MongoDB Atlas hoặc local instance

### 1. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
go mod download

# Tạo file .env
cat > .env << EOF
PORT=8080
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-here
EOF

# Chạy server
go run cmd/main.go
```

Server sẽ chạy tại `http://localhost:8080`

### 2. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## 📡 API Documentation

### REST API Endpoints

Xem chi tiết tại [backend/README.md](backend/README.md)

**Authentication:**
- `POST /auth/register` - Đăng ký người dùng mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới access token
- `POST /auth/logout` - Đăng xuất

**User:**
- `POST /user/find-by-phone` - Tìm user qua SĐT
- `GET /user/conversation` - Lấy danh sách cuộc hội thoại

**Chat:**
- `POST /chat/conversation` - Tạo cuộc hội thoại mới
- `POST /chat/send` - Gửi tin nhắn
- `GET /chat/conversation/:id` - Lấy lịch sử tin nhắn

### WebSocket API

**Endpoint:** `ws://localhost:8080/ws`

**Authentication:** Header `Authorization: Bearer <access_token>`

**Message Types:**

**Client → Server:**
```json
// Join conversation
{ "type": "join_conversation", "conversation_id": "...", "sender_id": "..." }

// Send message
{ "type": "new_message", "conversation_id": "...", "sender_id": "...", "message": "...", "created_at": 1234567890 }
```

**Server → Client:**
```json
// User online/offline
{ "type": "user_online", "sender_id": "...", "created_at": 1234567890 }
{ "type": "user_offline", "sender_id": "...", "created_at": 1234567890 }

// New message
{ "type": "new_message", "conversation_id": "...", "sender_id": "...", "message": "...", "created_at": 1234567890 }

// Join success
{ "type": "join_success", "conversation_id": "...", "sender_id": "...", "created_at": 1234567890 }
```

Chi tiết đầy đủ: [backend/WEBSOCKET_API.md](backend/WEBSOCKET_API.md) hoặc [frontend/WEBSOCKET_API.md](frontend/WEBSOCKET_API.md)

## 🛠️ Tech Stack

### Backend
- **Language:** Go 1.24.4
- **Framework:** Gin
- **Database:** MongoDB
- **WebSocket:** Gorilla WebSocket
- **Auth:** JWT (golang-jwt/jwt/v5)
- **Password:** bcrypt

### Frontend
- **Framework:** React 19.1.1
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS (index.css)
- **WebSocket:** Native WebSocket API

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: string,
  password: string,      // bcrypt hashed
  email: string,
  phone: string,
  name: string,
  refresh_token: string,
  refresh_token_expiry: int64,
  conversations: [ObjectId],
  created_at: timestamp,
  updated_at: timestamp
}
```

### Conversations Collection
```javascript
{
  _id: ObjectId,
  participant: [
    { _id: ObjectId, name: string }
  ],
  created_at: timestamp,
  updated_at: timestamp
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  conversation_id: ObjectId,
  sender: ObjectId,
  message: string,
  created_at: timestamp
}
```

## 🔐 Bảo mật

- Mật khẩu được hash bằng bcrypt
- JWT tokens với thời gian hết hạn (24h cho access token)
- Refresh token mechanism
- CORS được cấu hình cho frontend
- WebSocket authentication qua JWT

## 🌊 Luồng hoạt động

### 1. Authentication Flow
```
Đăng ký → Đăng nhập → Nhận Access Token → Sử dụng API → Refresh khi hết hạn → Đăng xuất
```

### 2. Chat Flow (REST)
```
Đăng nhập → Tìm user → Tạo conversation → Gửi message → Lấy lịch sử
```

### 3. Chat Flow (WebSocket - Realtime)
```
Đăng nhập → Kết nối WebSocket → Join conversation → Gửi/Nhận messages realtime
```

### 4. Online Status
```
Kết nối WS → Nhận danh sách online → Nhận thông báo online/offline realtime
```

## 🧪 Testing

### Test Backend API với curl

```bash
# Đăng ký
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"123456","email":"john@example.com","name":"John Doe","phone":"0123456789"}'

# Đăng nhập
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"123456"}'
```

### Test WebSocket (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:8080/ws', [], {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send message
ws.send(JSON.stringify({
  type: 'new_message',
  conversation_id: 'conv_id',
  sender_id: 'user_id',
  message: 'Hello!',
  created_at: Date.now() / 1000
}));
```

## 📝 Development

### Backend Development
```bash
cd backend
go run cmd/main.go
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build cho Production

**Backend:**
```bash
cd backend
go build -o main cmd/main.go
./main
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 Documentation

- [Backend API Documentation](backend/README.md)
- [WebSocket API Documentation](backend/WEBSOCKET_API.md)
- [Frontend Documentation](frontend/README.md)

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

MIT License

## 📞 Support

Nếu gặp vấn đề, vui lòng mở issue trên GitHub repository.

---

**Built with ❤️ using Go & React**
