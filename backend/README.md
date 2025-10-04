# Chat App Backend

A robust Go-based REST API backend for a real-time chat application with user authentication, conversation management, and messaging system, built using clean architecture principles.

## 🚀 Features

- **User Authentication**: Complete auth system with JWT tokens (login, register, refresh, logout)
- **Real-time Messaging**: Send and receive messages in conversations via WebSocket
- **WebSocket Support**: Real-time bidirectional communication for instant messaging
- **Online/Offline Status**: Track user online/offline status in real-time
- **Conversation Management**: Create conversations with participants tracking
- **User Discovery**: Find users by phone number
- **Conversation List**: Retrieve all conversations with participant names
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **MongoDB Integration**: NoSQL database for scalable data storage
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Secure Password Handling**: bcrypt encryption for user passwords
- **JWT Token Management**: Access and refresh token system with 24-hour expiration
- **Registry Pattern**: Centralized MongoDB collection management

## 🛠 Tech Stack

- **Language**: Go 1.24.4
- **Web Framework**: Gin
- **WebSocket**: Gorilla WebSocket
- **Database**: MongoDB
- **Authentication**: JWT (golang-jwt/jwt/v5)
- **Password Hashing**: bcrypt
- **Configuration**: godotenv

## 📁 Project Structure

```
backend/
├── cmd/
│   └── main.go                 # Application entry point
├── initial/
│   ├── config.go              # Configuration management
│   ├── dbconnect.go           # Database connection setup
│   └── router.go              # Route definitions and dependency injection
├── internal/
│   ├── application/
│   │   ├── auth/
│   │   │   └── auth.go        # Authentication business logic
│   │   ├── chat/
│   │   │   └── chat.go        # Chat business logic
│   │   ├── user/
│   │   │   └── user.go        # User business logic
│   │   └── models.go          # Application DTOs and models
│   ├── domain/
│   │   ├── conversation/
│   │   │   ├── conversation.go # Conversation domain logic
│   │   │   └── entity.go      # Conversation entities
│   │   ├── message/
│   │   │   ├── message.go    # Message domain logic
│   │   │   └── entity.go      # Message entities
│   │   └── user/
│   │       ├── user.go        # User domain logic
│   │       └── entity.go      # User entities
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── base.go        # Base database utilities
│   │   │   ├── models.go      # MongoDB models
│   │   │   ├── registry/
│   │   │   │   └── registry.go # Collection registry pattern
│   │   │   ├── mongo_user_repository.go
│   │   │   ├── mongo_conversation_repository.go
│   │   │   └── mongo_message_repository.go
│   │   └── websocket/
│   │       └── hub.go         # WebSocket hub and client management
│   └── interface/
│       └── http/
│           ├── auth_handle.go # Authentication HTTP handlers
│           ├── chat_handle.go # Chat HTTP handlers
│           ├── user_handle.go # User HTTP handlers
│           ├── web_socket_handle.go # WebSocket handlers
│           └── middleware/    # HTTP middlewares
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── go.mod                     # Go module dependencies
└── go.sum                     # Go module checksums
```

## 🚀 Getting Started

### Prerequisites

- Go 1.24.4 or higher
- MongoDB Atlas account (or local MongoDB installation)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd backend
```

2. Install dependencies:
```bash
go mod download
```

3. Create a `.env` file in the root directory:
```env
PORT=8080
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key
```

4. Run the application:
```bash
go run cmd/main.go
```

The server will start on `http://localhost:8080`

## 📡 API Endpoints

All API endpoints return responses in the following format:

```json
{
  "status": "success" | "fail",
  "message": "string",
  "data": object | null
}
```

### WebSocket Endpoint

#### Connect to WebSocket
- **Endpoint**: `WS /ws`
- **Description**: Establish WebSocket connection for real-time messaging
- **Headers**: `Authorization: Bearer <access_token>`

**Connection Flow**:
1. Client connects to WebSocket endpoint with JWT token
2. Server upgrades HTTP connection to WebSocket
3. Client is registered in the Hub
4. Client receives list of currently online users
5. All other clients are notified that this user is now online

**Message Types**:

**1. Join Conversation** (Client → Server):
```json
{
  "type": "join_conversation",
  "conversation_id": "string"
}
```

**2. Send Message** (Client → Server):
```json
{
  "type": "new_message",
  "conversation_id": "string",
  "sender_id": "string",
  "message": "string",
  "created_at": 1234567890
}
```

**3. Receive Message** (Server → Client):
```json
{
  "type": "new_message",
  "conversation_id": "string",
  "sender_id": "string",
  "message": "string",
  "created_at": 1234567890
}
```

**4. User Online Notification** (Server → Client):
```json
{
  "type": "user_online",
  "sender_id": "user_id",
  "created_at": 1234567890
}
```

**5. User Offline Notification** (Server → Client):
```json
{
  "type": "user_offline",
  "sender_id": "user_id",
  "created_at": 1234567890
}
```

**Features**:
- Automatic ping/pong heartbeat every 54 seconds
- Connection timeout after 60 seconds of inactivity
- Buffered message channels (256 messages)
- Concurrent message broadcasting
- Thread-safe client management

### Authentication Endpoints

All authentication endpoints are public (no authentication required).

#### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Create a new user account

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "name": "string",
  "phone": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Register successful",
  "data": {
    "user": {
      "user_id": "string",
      "name": "string",
      "conversations": []
    },
    "token": {
      "access_token": "jwt-token-string",
      "refresh_token": "refresh-token-string"
    }
  }
}
```

**Error Response** (400):
```json
{
  "status": "fail",
  "message": "Error message",
  "data": null
}
```

#### Login User
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get tokens

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "user_id": "string",
      "name": "string",
      "conversations": ["conversation_id_1", "conversation_id_2"]
    },
    "token": {
      "access_token": "jwt-token-string",
      "refresh_token": "refresh-token-string"
    }
  }
}
```

#### Refresh Token
- **Endpoint**: `POST /auth/refresh`
- **Description**: Get new access token using refresh token

**Request Body**:
```json
{
  "userID": "string",
  "refresh_token": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "RefreshToken successful",
  "data": {
    "user": {
      "user_id": "string",
      "name": "string",
      "conversations": ["conversation_id_1", "conversation_id_2"]
    },
    "token": {
      "access_token": "new-jwt-token-string",
      "refresh_token": "new-refresh-token-string"
    }
  }
}
```

#### Logout User
- **Endpoint**: `POST /auth/logout`
- **Description**: Invalidate user session

**Request Body**:
```json
{
  "userID": "string",
  "refresh_token": "string"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Logout successful",
  "data": null
}
```

### User Endpoints

All user endpoints require authentication via Bearer token in the Authorization header.

#### Find User by Phone
- **Endpoint**: `POST /user/find-by-phone`
- **Description**: Find a user by their phone number
- **Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "phone": "string"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "User found",
  "data": {
    "email": "string",
    "name": "string",
    "phone": "string"
  }
}
```

#### Get Conversation List
- **Endpoint**: `GET /user/conversation`
- **Description**: Get all conversations with participants for the authenticated user
- **Headers**: `Authorization: Bearer <access_token>`

**Request Body**: None (GET request)

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Conversation list retrieved successfully",
  "data": {
    "conversation_list": [
      {
        "conversation_id": "string",
        "participant": ["username1", "username2"]
      }
    ]
  }
}
```

**Note**: Each conversation includes the conversation ID and an array of participant usernames.


### Chat Endpoints

All chat endpoints require authentication via Bearer token in the Authorization header.

#### Create Conversation
- **Endpoint**: `POST /chat/conversation`
- **Description**: Create a new conversation between users
- **Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "friend_phone": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Conversation created successfully",
  "data": {
    "conversation_id": "string"
  }
}
```

**Note**: The conversation will automatically include both participants (current user and friend) with their IDs and usernames stored in the database.

#### Send Message
- **Endpoint**: `POST /chat/send`
- **Description**: Send a message in a conversation
- **Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "conversation_id": "string",
  "message": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "message": "string",
    "created_at": 1234567890
  }
}
```

#### Get Conversation Messages
- **Endpoint**: `GET /chat/conversation/:id`
- **Description**: Get all messages in a conversation
- **Headers**: `Authorization: Bearer <access_token>`

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Messages retrieved successfully",
  "data": {
    "conversation_id": "string",
    "messages": [
      {
        "sender_id": "string",
        "message": "string",
        "created_at": 1234567890
      }
    ]
  }
}
```

## 🏗 Architecture

This project follows **Clean Architecture** principles:

- **Domain Layer** (`internal/domain/`): Contains business entities and interfaces
- **Application Layer** (`internal/application/`): Contains business logic and use cases
- **Infrastructure Layer** (`internal/infrastructure/`): Contains database implementations
- **Interface Layer** (`internal/interface/`): Contains HTTP handlers and external interfaces

## 🔐 Security Features

- **Password Encryption**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure access tokens with 24-hour expiration
- **Refresh Tokens**: Long-lived tokens for obtaining new access tokens
- **CORS Protection**: Configured for frontend at `http://localhost:3000`
- **Input Validation**: Request validation on all endpoints

## 🗄 Database Schema

### User Collection
```json
{
  "_id": "ObjectId",
  "username": "string",
  "password": "string", // bcrypt hashed
  "email": "string",
  "phone": "string",
  "name": "string",
  "refresh_token": "string", // bcrypt hashed
  "refresh_token_expiry": "int64",
  "conversations": ["ObjectId"], // Array of conversation IDs
  "create_at": "timestamp",
  "update_at": "timestamp"
}
```

### Conversation Collection
```json
{
  "_id": "ObjectId",
  "participant": [
    {
      "_id": "ObjectId", // User ID
      "name": "string"   // Username
    }
  ],
  "created_at": "timestamp",
  "update_at": "timestamp"
}
```

### Message Collection
```json
{
  "_id": "ObjectId",
  "conversation_id": "ObjectId",
  "sender": "ObjectId", // User ID who sent the message
  "message": "string", // Message content
  "created_at": "timestamp"
}
```

## 🔧 Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8080` |
| `DATABASE_URL` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |

## 🧪 Testing

To test the API endpoints, you can use tools like:

- **Postman**: Import the endpoints and test manually
- **curl**: Command line testing
- **httpie**: User-friendly HTTP client

Example curl commands:

```bash
# Register a new user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123","email":"john@example.com","name":"John Doe","phone":"0123456789"}'

# Login with credentials
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"secure123"}'

# Refresh access token
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"userID":"user_id_from_login","refresh_token":"refresh_token_from_login"}'

# Logout
curl -X POST http://localhost:8080/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"userID":"user_id","refresh_token":"refresh_token"}'

# Find user by phone number (requires authentication)
curl -X POST http://localhost:8080/user/find-by-phone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"phone":"0987654321"}'

# Get all conversations with participants (requires authentication)
curl -X GET http://localhost:8080/user/conversation \
  -H "Authorization: Bearer <your-access-token>"

# Create a new conversation (requires authentication)
curl -X POST http://localhost:8080/chat/conversation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"friend_phone":"0987654321"}'

# Send a message in a conversation (requires authentication)
curl -X POST http://localhost:8080/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"conversation_id":"65f1a2b3c4d5e6f7g8h9i0j1","message":"Hello, how are you?"}'

# Get all messages in a conversation (requires authentication)
curl -X GET http://localhost:8080/chat/conversation/65f1a2b3c4d5e6f7g8h9i0j1 \
  -H "Authorization: Bearer <your-access-token>"
```

**WebSocket Example (JavaScript)**:
```javascript
// Connect to WebSocket
const token = "your-access-token";
const ws = new WebSocket(`ws://localhost:8080/ws?token=${token}`);

// Listen for connection open
ws.onopen = () => {
  console.log("Connected to WebSocket");

  // Join a conversation
  ws.send(JSON.stringify({
    type: "join_conversation",
    conversation_id: "conversation_id_here"
  }));
};

// Listen for messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case "new_message":
      console.log(`New message from ${data.sender_id}: ${data.message}`);
      break;
    case "user_online":
      console.log(`User ${data.sender_id} is now online`);
      break;
    case "user_offline":
      console.log(`User ${data.sender_id} is now offline`);
      break;
  }
};

// Send a message
const sendMessage = (conversationId, message) => {
  ws.send(JSON.stringify({
    type: "new_message",
    conversation_id: conversationId,
    sender_id: "your_user_id",
    message: message,
    created_at: Date.now()
  }));
};

// Handle connection close
ws.onclose = () => {
  console.log("Disconnected from WebSocket");
};

// Handle errors
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};
```

## 📝 Development

### API Workflow

**1. Authentication Flow:**
```
Register → Login → Get Access Token → Use Token for API calls → Refresh when expired → Logout
```

**2. Chat Flow (REST API):**
```
Login → Find User by Phone → Create Conversation → Send Messages → Get Messages
```

**3. Chat Flow (WebSocket - Real-time):**
```
Login → Connect to WebSocket → Join Conversation → Send/Receive Messages in Real-time
```

**4. Conversation List Flow:**
```
Login → Get Conversation List (with participants) → Select Conversation → Get Messages
```

**5. Online Status Tracking:**
```
Connect to WebSocket → Receive Online Users List → Get Real-time Online/Offline Notifications
```

### Adding New Features

1. Define domain entities and interfaces in `internal/domain/[feature]/`
2. Create business logic and use cases in `internal/application/[feature]/`
3. Implement database repositories in `internal/infrastructure/database/`
4. Add HTTP handlers in `internal/interface/http/`
5. Register routes and dependency injection in `initial/router.go`
6. Update models and DTOs in `internal/application/models.go`

### Code Style

- Follow Go conventions and idiomatic patterns
- Use meaningful variable names
- Add comprehensive error handling for all operations
- Validate and sanitize all input data
- Write clear comments for complex logic

## 🚀 Deployment

1. Build the application:
```bash
go build -o main cmd/main.go
```

2. Set environment variables on your server
3. Run the binary:
```bash
./main
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.