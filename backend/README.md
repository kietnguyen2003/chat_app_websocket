# Chat App Backend

A robust Go-based REST API backend for a real-time chat application with user authentication, conversation management, and messaging system, built using clean architecture principles.

## 🚀 Features

- **User Authentication**: Complete auth system with JWT tokens
- **Real-time Messaging**: Send and receive messages in conversations
- **Conversation Management**: Create and manage chat conversations
- **User Discovery**: Find users by phone number
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **MongoDB Integration**: NoSQL database for scalable data storage
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Secure Password Handling**: bcrypt encryption for user passwords
- **JWT Token Management**: Access and refresh token system
- **Registry Pattern**: Centralized MongoDB collection management

## 🛠 Tech Stack

- **Language**: Go 1.24.4
- **Web Framework**: Gin
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
│   │   ├── messeage/
│   │   │   ├── messeage.go    # Message domain logic
│   │   │   └── entity.go      # Message entities
│   │   └── user/
│   │       ├── user.go        # User domain logic
│   │       └── entity.go      # User entities
│   ├── infrastructure/
│   │   └── database/
│   │       ├── base.go        # Base database utilities
│   │       ├── models.go      # MongoDB models
│   │       ├── registry/
│   │       │   └── registry.go # Collection registry pattern
│   │       ├── mongo_user_repository.go
│   │       ├── mongo_conversation_repository.go
│   │       └── mongo_messeage_repository.go
│   └── interface/
│       └── http/
│           ├── auth_handle.go # Authentication HTTP handlers
│           ├── chat_handle.go # Chat HTTP handlers
│           ├── user_handle.go # User HTTP handlers
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

### Authentication Endpoints

#### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Create a new user account

**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "email": "string",
  "role": "user" // optional, defaults to "user", can be "admin"
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
      "role": "user"
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
      "role": "user"
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
      "role": "user"
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
    "user_id": "string",
    "username": "string",
    "phone": "string"
  }
}
```

### Chat Endpoints

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
    "id": "conversation_id_string"
  }
}
```

#### Send Message
- **Endpoint**: `POST /chat/send`
- **Description**: Send a message in a conversation
- **Headers**: `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "conversation_id": "string",
  "messeage": "string"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "messeage": "string",
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
    "messeages": [
      {
        "sender_id": "string",
        "messeage": "string",
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
  "role": "user|admin",
  "refresh_token": "string", // bcrypt hashed
  "refresh_token_expiry": "int64",
  "conversations": ["ObjectId"], // Array of conversation IDs
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Conversation Collection
```json
{
  "_id": "ObjectId",
  "participants": ["ObjectId"], // Array of user IDs
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Message Collection
```json
{
  "_id": "ObjectId",
  "conversation_id": "ObjectId",
  "sender": "ObjectId", // User ID who sent the message
  "messeage": "string", // Message content
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
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com","phone":"1234567890"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Find user by phone (requires authentication)
curl -X POST http://localhost:8080/user/find-by-phone \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"phone":"1234567890"}'

# Create conversation (requires authentication)
curl -X POST http://localhost:8080/chat/conversation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"friend_phone":"0987654321"}'

# Send message (requires authentication)
curl -X POST http://localhost:8080/chat/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-access-token>" \
  -d '{"conversation_id":"your-conversation-id","messeage":"Hello, how are you?"}'

# Get conversation messages (requires authentication)
curl -X GET http://localhost:8080/chat/conversation/your-conversation-id \
  -H "Authorization: Bearer <your-access-token>"
```

## 📝 Development

### Adding New Features

1. Define domain entities and interfaces in `internal/domain/[feature]/`
2. Create business logic and use cases in `internal/application/[feature]/`
3. Implement database repositories in `internal/infrastructure/database/`
4. Add HTTP handlers in `internal/interface/http/`
5. Register routes and dependency injection in `initial/router.go`
6. Update models and DTOs in `internal/application/models.go`

### Code Style

- Follow Go conventions
- Use meaningful variable names
- Add error handling for all operations
- Validate input data

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