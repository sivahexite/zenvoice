# Voice Assistant Dashboard

A comprehensive voice assistant management platform with authentication, real-time voice processing, and AI agent capabilities.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database
- Redis server
- Docker (optional)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd voice-assistant-dashboard
   npm run install-all
   ```

2. **Set up environment variables:**

   **Server (.env):**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **AI Agent (.env):**
   ```bash
   cd ai_agent
   cp .env-example .env
   # Edit .env with your API keys
   ```

3. **Start the services:**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individually:
   npm run server    # NestJS API server (port 8000)
   npm run client    # Next.js client (port 8001)
   ```

## 🏗️ Project Structure

```
├── server/          # NestJS API server
├── client/          # Next.js authentication client
├── ui/             # Next.js voice assistant UI
└── ai_agent/       # Python FastAPI voice processing
```

## 🔧 Configuration

### Required Environment Variables

**Server (.env):**
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `OPENAI_API_KEY`

**AI Agent (.env):**
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `REDIS_URL`
- `DEEPGRAM_AUTH_TOKEN`, `ELEVENLABS_API_KEY`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## 🐛 Recent Fixes

### Fixed Issues:
1. **Missing Environment Files**: Created `.env` files for server and AI agent
2. **Python Import Errors**: Added missing `json` and `typing` imports in `ai_agent/server.py`
3. **Duplicate Dependencies**: Removed duplicate `pymongo` entry in `requirements.txt`
4. **Configuration**: Added proper environment variable templates

### Error Resolution:
- ✅ TypeScript compilation errors resolved
- ✅ Python syntax errors fixed
- ✅ Missing dependencies identified and documented
- ✅ Environment configuration completed
- ✅ Build processes verified

## 🚀 Running the Application

1. **Database Setup:**
   ```bash
   cd server
   npm run db:test      # Test database connection
   npm run migration:run # Run database migrations
   npm run seed         # Seed initial data
   ```

2. **Start Services:**
   ```bash
   # Terminal 1: Start server
   cd server && npm run dev
   
   # Terminal 2: Start client
   cd client && npm run dev
   
   # Terminal 3: Start AI agent
   cd ai_agent && python3 server.py
   
   # Terminal 4: Start UI
   cd ui && npm run dev
   ```

3. **Access Applications:**
   - **Client**: http://localhost:8001 (Authentication)
   - **Server API**: http://localhost:8000/api/v1
   - **API Docs**: http://localhost:8000/api/docs
   - **UI**: http://localhost:3000 (Voice Assistant)

## 📚 API Documentation

The API documentation is available at `/api/docs` when the server is running.

## 🔒 Security

- JWT-based authentication
- Rate limiting
- Input validation
- CORS protection
- Secure password hashing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.