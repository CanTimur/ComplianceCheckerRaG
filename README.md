# GDPR Compliance Checker RAG

A web application that uses Retrieval Augmented Generation (RAG) to check GDPR compliance of documents and policies using the IO Intelligence API.

## Features

- 📄 Document upload and analysis
- 🔍 GDPR compliance checking with RAG
- 🤖 AI-powered recommendations using IO Intelligence API
- 📊 Compliance scoring and reporting
- 🔒 Secure document processing

## Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Node.js with Express
- **AI**: IO Intelligence API
- **Database**: In-memory storage (for demo purposes)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- IO Intelligence API key

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ComplianceCheckerRAG.git
   cd ComplianceCheckerRAG
   ```

   **Or create a new repository:**
   ```bash
   # Initialize git repository
   git init
   git add .
   git commit -m "Initial commit: GDPR Compliance Checker RAG"
   
   # Connect to GitHub (create repository on GitHub first)
   git remote add origin https://github.com/yourusername/ComplianceCheckerRAG.git
   git branch -M main
   git push -u origin main
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment file
   cp server/env.example server/.env
   
   # Edit server/.env and add your IO Intelligence API key
   # Use the provided API key: io-v2-eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvd25lciI6IjE5MzdhMWEwLWYyNjQtNDk5OC05YmNjLTJmOTY5MGM3ZDBjNiIsImV4cCI6NDkxMDIyODY2NH0.UpVMexZIF2vXP_ye7up5C0KC5cM7Dz6_iIebnVsRYJA18qABzdP_yZ-hJY_3WkwofWzLomkwflKrJDvM3F5myA
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
ComplianceCheckerRAG/
├── client/                 # Next.js frontend
│   ├── components/         # React components
│   ├── pages/             # Next.js pages
│   ├── styles/            # CSS styles
│   └── utils/             # Utility functions
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Express middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── index.js          # Server entry point
├── docs/                  # Documentation
└── README.md             # This file
```

## API Endpoints

- `POST /api/upload` - Upload document for analysis
- `POST /api/analyze` - Analyze document for GDPR compliance
- `GET /api/reports/:id` - Get compliance report
- `GET /api/health` - Health check

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `IO_INTELLIGENCE_API_KEY` | Your IO Intelligence API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
