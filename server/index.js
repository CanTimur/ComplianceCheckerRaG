const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const complianceController = require('./controllers/complianceController');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
    }
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'GDPR Compliance Checker API is running',
    timestamp: new Date().toISOString()
  });
});

// Compliance checking routes
app.post('/api/upload', upload.single('document'), complianceController.uploadDocument);
app.post('/api/analyze', complianceController.analyzeCompliance);
app.get('/api/reports/:id', complianceController.getReport);
app.get('/api/models', complianceController.getAvailableModels);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist.`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  
  // Validate environment variables
  if (!process.env.IO_INTELLIGENCE_API_KEY) {
    console.warn('⚠️  Warning: IO_INTELLIGENCE_API_KEY not set in environment variables');
  }
});
