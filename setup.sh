#!/bin/bash

echo "🚀 Setting up GDPR Compliance Checker RAG Application"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
node_version=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Create environment file
echo "⚙️  Setting up environment variables..."
if [ ! -f "server/.env" ]; then
    cp server/env.example server/.env
    echo "✅ Created server/.env file"
    
    # Add the provided API key
    echo "" >> server/.env
    echo "# Your IO Intelligence API Key" >> server/.env
    echo "IO_INTELLIGENCE_API_KEY=io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjE5MzdhMWEwLWYyNjQtNDk5OC05YmNjLTJmOTY5MGM3ZDBjNiIsImV4cCI6NDkxMDIyODY2NH0.UpVMexZIF2vXP_ye7up5C0KC5cM7Dz6_iIebnVsRYJA18qABzdP_yZ-hJY_3WkwofWzLomkwflKrJDvM3F5myA" >> server/.env
    
    echo "✅ Added IO Intelligence API key to environment"
else
    echo "⚠️  server/.env already exists. Please check your API key configuration."
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo ""
echo "For more information, see README.md"
