# Deployment Guide

This guide covers how to deploy the GDPR Compliance Checker application locally and on various platforms.

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Operating System**: macOS, Linux, or Windows

### Installing Node.js

#### macOS
```bash
# Using Homebrew (recommended)
brew install node

# Or download from https://nodejs.org
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Windows
1. Download installer from [nodejs.org](https://nodejs.org)
2. Run the installer and follow the prompts
3. Verify installation in Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ComplianceCheckerRAG
```

### 2. Run Setup Script

```bash
# Make script executable (macOS/Linux)
chmod +x setup.sh

# Run setup
./setup.sh
```

### 3. Manual Setup (Alternative)

If the setup script doesn't work:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..

# Install client dependencies
cd client
npm install
cd ..

# Create environment file
cp server/env.example server/.env

# Edit server/.env and add your API key
echo "IO_INTELLIGENCE_API_KEY=io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjE5MzdhMWEwLWYyNjQtNDk5OC05YmNjLTJmOTY5MGM3ZDBjNiIsImV4cCI6NDkxMDIyODY2NH0.UpVMexZIF2vXP_ye7up5C0KC5cM7Dz6_iIebnVsRYJA18qABzdP_yZ-hJY_3WkwofWzLomkwflKrJDvM3F5myA" >> server/.env
```

### 4. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend only (port 5000)
npm run client  # Frontend only (port 3000)
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Production Deployment

### Environment Variables

Create a `.env` file in the server directory with:

```bash
# Required
IO_INTELLIGENCE_API_KEY=your_api_key_here

# Optional
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

### Build for Production

```bash
# Build the client
cd client
npm run build

# The built files will be in client/.next/
```

### Platform-Specific Deployments

#### Vercel (Recommended for Frontend)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy frontend:
   ```bash
   cd client
   vercel --prod
   ```

3. Set environment variables in Vercel dashboard

#### Heroku (Full Stack)

1. Create `Procfile` in root:
   ```
   web: cd server && npm start
   ```

2. Deploy:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   heroku create your-app-name
   heroku config:set IO_INTELLIGENCE_API_KEY=your_api_key_here
   git push heroku main
   ```

#### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### DigitalOcean App Platform

1. Create new app from GitHub repository
2. Configure build and run commands:
   - Build: `npm run install-all && cd client && npm run build`
   - Run: `cd server && npm start`
3. Set environment variables

## Docker Deployment

### Dockerfile

Create `Dockerfile` in root:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

# Build client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy server code
COPY server/ ./server/

# Copy built client
COPY --from=builder /app/client/.next ./client/.next
COPY --from=builder /app/client/public ./client/public
COPY --from=builder /app/client/package.json ./client/

EXPOSE 5000

CMD ["node", "server/index.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - IO_INTELLIGENCE_API_KEY=${IO_INTELLIGENCE_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
```

### Build and Run

```bash
# Build image
docker build -t gdpr-compliance-checker .

# Run container
docker run -p 5000:5000 -e IO_INTELLIGENCE_API_KEY=your_key gdpr-compliance-checker

# Or use docker-compose
docker-compose up --build
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port
   lsof -i :3000  # or :5000
   
   # Kill process
   kill -9 <PID>
   ```

2. **API Key Issues**
   - Verify the API key is correctly set in `.env`
   - Check for extra spaces or quotes
   - Ensure the key has proper permissions

3. **File Upload Issues**
   - Check file size limits (10MB default)
   - Verify supported file types
   - Ensure proper file permissions

4. **Memory Issues**
   - Increase Node.js memory limit:
     ```bash
     export NODE_OPTIONS="--max-old-space-size=4096"
     ```

### Logs and Debugging

```bash
# Server logs
cd server
npm run dev  # Shows detailed logs

# Check API health
curl http://localhost:5000/api/health

# Test file upload
curl -X POST -F "document=@sample.pdf" http://localhost:5000/api/upload
```

## Performance Optimization

### Production Optimizations

1. **Enable gzip compression**
2. **Use CDN for static assets**
3. **Implement caching strategies**
4. **Monitor API usage and rate limits**
5. **Use process managers like PM2**

### Monitoring

Consider implementing:
- Application monitoring (New Relic, DataDog)
- Error tracking (Sentry)
- Uptime monitoring
- API usage analytics

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **File Uploads**: Validate file types and sizes
3. **Rate Limiting**: Implement API rate limiting
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure CORS properly for your domain
