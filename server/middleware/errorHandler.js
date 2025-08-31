/**
 * Error handling middleware for the compliance checker API
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File too large',
      message: 'File size must be less than 10MB'
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF, DOC, DOCX, and TXT files are allowed'
    });
  }

  // API errors
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || 'API Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
