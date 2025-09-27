# Chat App Backend

A robust Go-based REST API backend for a chat application with user authentication, built using clean architecture principles.

## 🚀 Features

- **User Authentication**: Complete auth system with JWT tokens
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **MongoDB Integration**: NoSQL database for scalable data storage
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Secure Password Handling**: bcrypt encryption for user passwords
- **JWT Token Management**: Access and refresh token system

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
├── init/
│   ├── config.go              # Configuration management
│   ├── dbconnect.go           # Database connection setup
│   └── router.go              # Route definitions
├── internal/
│   ├── application/
│   │   └── auth/
│   │       └── auth.go        # Authentication business logic
│   ├── domain/
│   │   └── auth/
│   │       └── auth.go        # Domain entities and interfaces
│   ├── infrastructure/
│   │   └── database/
│   │       └── mongo_user_repository.go  # Database implementation
│   └── interface/
│       └── http/
│           └── auth_handle.go # HTTP handlers
├── .env                       # Environment variables
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
  "role": "user|admin",
  "refresh_token": "string", // bcrypt hashed
  "refresh_token_expiry": "int64",
  "created_at": "timestamp",
  "updated_at": "timestamp"
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
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

## 📝 Development

### Adding New Features

1. Define domain entities in `internal/domain/`
2. Create business logic in `internal/application/`
3. Implement database layer in `internal/infrastructure/`
4. Add HTTP handlers in `internal/interface/`
5. Register routes in `init/router.go`

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