#!/bin/bash

echo "🚀 Setting up Voice Assistant Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Create environment files if they don't exist
echo "🔧 Setting up environment files..."

if [ ! -f "server/.env" ]; then
    echo "Creating server/.env..."
    cat > server/.env << EOF
# Server Configuration
NODE_ENV=development
PORT=8000

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=zenvoice

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:8001

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@voiceassistant.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback

# OpenAI Configuration (for prompt generation)
OPENAI_API_KEY=your-openai-api-key
EOF
    echo "⚠️  Please update server/.env with your actual configuration values"
fi

if [ ! -f "ai_agent/.env" ]; then
    echo "Creating ai_agent/.env..."
    cat > ai_agent/.env << EOF
DEEPGRAM_AUTH_TOKEN=your_deepgram_auth_token
ELEVENLABS_API_KEY=your_elevenlabs_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-3.5-turbo
REDIS_URL=redis://localhost:6379
WHISPER_URL=

# Twilio credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here

# Plivo credentials
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_PHONE_NUMBER=your_plivo_phone_number

# AWS Polly credentials (for text-to-speech)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_DEFAULT_REGION=us-east-1

# ambient noise
AMBIENT_NOISE_PRESETS_DIR=presets/ambient_noise

# Extraction prompt generation model
EXTRACTION_PROMPT_GENERATION_MODEL=gpt-3.5-turbo
EOF
    echo "⚠️  Please update ai_agent/.env with your actual API keys"
fi

if [ ! -f "client/.env.local" ]; then
    echo "Creating client/.env.local..."
    cat > client/.env.local << EOF
# Client Environment Variables
# This is optional - the API URL will default to localhost:8000 in development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
fi

echo "✅ Environment files created"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update the environment files with your actual configuration values"
echo "2. Start PostgreSQL and Redis services"
echo "3. Run database migrations: cd server && npm run migration:run"
echo "4. Start the application: npm run dev"
echo ""
echo "📚 For detailed instructions, see README.md"