const { v4: uuidv4 } = require('uuid');
const IOIntelligenceService = require('../services/ioIntelligenceService');
const DocumentService = require('../services/documentService');
const { asyncHandler } = require('../middleware/errorHandler');

// In-memory storage for demo purposes
// In production, use a proper database
const reports = new Map();
const documents = new Map();

const ioService = new IOIntelligenceService();
const documentService = new DocumentService();

/**
 * Upload and process document
 */
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please select a document to upload'
    });
  }

  const { originalname, mimetype, size, buffer } = req.file;
  const documentId = uuidv4();

  try {
    // Extract text content from document
    const content = await documentService.extractTextFromDocument(buffer, mimetype, originalname);
    
    // Validate content
    const validation = documentService.validateDocumentContent(content);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid document content',
        message: validation.error
      });
    }

    // Preprocess content
    const processedContent = documentService.preprocessContent(content);
    
    // Get document metadata
    const metadata = documentService.getDocumentMetadata(originalname, mimetype, size, processedContent);

    // Store document information
    documents.set(documentId, {
      id: documentId,
      content: processedContent,
      metadata: metadata,
      uploadedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      documentId: documentId,
      metadata: metadata,
      message: 'Document uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      error: 'Document processing failed',
      message: error.message
    });
  }
});

/**
 * Analyze document for GDPR compliance
 */
const analyzeCompliance = asyncHandler(async (req, res) => {
  const { documentId } = req.body;

  if (!documentId) {
    return res.status(400).json({
      error: 'Missing document ID',
      message: 'Please provide a document ID for analysis'
    });
  }

  const document = documents.get(documentId);
  if (!document) {
    return res.status(404).json({
      error: 'Document not found',
      message: 'The specified document could not be found'
    });
  }

  try {
    const reportId = uuidv4();
    
    // Start analysis (this will be returned immediately)
    res.json({
      success: true,
      reportId: reportId,
      status: 'processing',
      message: 'Analysis started. Use the report ID to check progress.'
    });

    // Perform analysis in background
    const analysisResult = await ioService.analyzeGDPRCompliance(
      document.content, 
      document.metadata.filename
    );

    // Generate improvement suggestions
    const improvements = await ioService.generateImprovementSuggestions(analysisResult);

    // Store the complete report
    reports.set(reportId, {
      id: reportId,
      documentId: documentId,
      documentName: document.metadata.filename,
      analysis: analysisResult,
      improvements: improvements,
      status: 'completed',
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Store error report
    reports.set(reportId, {
      id: reportId,
      documentId: documentId,
      status: 'failed',
      error: error.message,
      createdAt: new Date().toISOString()
    });
  }
});

/**
 * Get compliance report
 */
const getReport = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      error: 'Missing report ID',
      message: 'Please provide a report ID'
    });
  }

  const report = reports.get(id);
  if (!report) {
    return res.status(404).json({
      error: 'Report not found',
      message: 'The specified report could not be found'
    });
  }

  res.json({
    success: true,
    report: report
  });
});

/**
 * Get available AI models
 */
const getAvailableModels = asyncHandler(async (req, res) => {
  try {
    const models = await ioService.getAvailableModels();
    
    res.json({
      success: true,
      models: models,
      defaultModel: ioService.defaultModel
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      error: 'Failed to fetch models',
      message: error.message
    });
  }
});

/**
 * Get system statistics (for debugging/monitoring)
 */
const getSystemStats = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    stats: {
      documentsProcessed: documents.size,
      reportsGenerated: reports.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = {
  uploadDocument,
  analyzeCompliance,
  getReport,
  getAvailableModels,
  getSystemStats
};
