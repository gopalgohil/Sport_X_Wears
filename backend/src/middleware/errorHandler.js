import ApiError from '../utils/ApiError.js';

/**
 * 404 Catch-All Middleware for undefined API routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Centralized Enterprise Error Handler Middleware.
 * Standardizes API responses, sanitizes internal database details, and masks stack traces in production.
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const message = `Duplicate value entered for field: ${fields.join(', ')}`;
    error = new ApiError(409, message, err.keyValue);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = new ApiError(400, 'Validation Error', errors);
  }

  // Handle JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  // Handle JWT expired token
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired, please log in again');
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Selected image is too large. Maximum allowed size is 15MB per file.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Too many files uploaded. Maximum 5 images allowed.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = `Unexpected file field: ${err.field || 'unknown'}`;
    }
    error = new ApiError(400, message);
  }

  console.error('[Unhandled Server Error]:', err);

  const statusCode = error.statusCode || (typeof error.status === 'number' ? error.status : 500);

  const responsePayload = {
    success: false,
    message: err.message || error.message || 'Internal Server Error',
    errorType: err.name || 'Error',
    details: err.details || null,
    stack: err.stack,
  };

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
