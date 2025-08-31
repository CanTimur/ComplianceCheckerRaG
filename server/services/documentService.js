const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Service for processing different document types
 */
class DocumentService {
  /**
   * Extract text content from uploaded document
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} mimeType - MIME type of the file
   * @param {string} originalName - Original filename
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromDocument(fileBuffer, mimeType, originalName) {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.extractFromPDF(fileBuffer);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocx(fileBuffer);
        
        case 'application/msword':
          return await this.extractFromDoc(fileBuffer);
        
        case 'text/plain':
          return fileBuffer.toString('utf-8');
        
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error(`Error extracting text from ${originalName}:`, error);
      throw new Error(`Failed to extract text from document: ${error.message}`);
    }
  }

  /**
   * Extract text from PDF document
   */
  async extractFromPDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      throw new Error('Failed to parse PDF document');
    }
  }

  /**
   * Extract text from DOCX document
   */
  async extractFromDocx(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to parse DOCX document');
    }
  }

  /**
   * Extract text from DOC document
   */
  async extractFromDoc(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      throw new Error('Failed to parse DOC document');
    }
  }

  /**
   * Validate document content
   * @param {string} content - Document content
   * @returns {Object} Validation result
   */
  validateDocumentContent(content) {
    const minLength = 100; // Minimum characters for meaningful analysis
    const maxLength = 50000; // Maximum characters to prevent API limits
    
    if (!content || content.trim().length === 0) {
      return {
        valid: false,
        error: 'Document appears to be empty or unreadable'
      };
    }

    if (content.length < minLength) {
      return {
        valid: false,
        error: `Document too short for meaningful analysis (minimum ${minLength} characters)`
      };
    }

    if (content.length > maxLength) {
      return {
        valid: false,
        error: `Document too long for analysis (maximum ${maxLength} characters). Please split into smaller sections.`
      };
    }

    return {
      valid: true,
      wordCount: content.split(/\s+/).length,
      characterCount: content.length
    };
  }

  /**
   * Preprocess document content for better analysis
   * @param {string} content - Raw document content
   * @returns {string} Preprocessed content
   */
  preprocessContent(content) {
    // Remove excessive whitespace
    let processed = content.replace(/\s+/g, ' ');
    
    // Remove common document artifacts
    processed = processed.replace(/\f/g, ' '); // Form feeds
    processed = processed.replace(/\r\n/g, '\n'); // Normalize line endings
    processed = processed.replace(/\r/g, '\n'); // Mac line endings
    
    // Remove page numbers and headers/footers (basic patterns)
    processed = processed.replace(/Page \d+ of \d+/gi, '');
    processed = processed.replace(/^\d+\s*$/gm, ''); // Lines with just numbers
    
    return processed.trim();
  }

  /**
   * Get document metadata
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type
   * @param {number} size - File size in bytes
   * @param {string} content - Extracted content
   * @returns {Object} Document metadata
   */
  getDocumentMetadata(originalName, mimeType, size, content) {
    return {
      filename: originalName,
      mimeType: mimeType,
      sizeBytes: size,
      sizeKB: Math.round(size / 1024),
      wordCount: content.split(/\s+/).length,
      characterCount: content.length,
      uploadedAt: new Date().toISOString(),
      type: this.getDocumentType(mimeType)
    };
  }

  /**
   * Get human-readable document type
   */
  getDocumentType(mimeType) {
    const types = {
      'application/pdf': 'PDF',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
      'application/msword': 'Word Document (DOC)',
      'text/plain': 'Text Document'
    };
    
    return types[mimeType] || 'Unknown';
  }
}

module.exports = DocumentService;
