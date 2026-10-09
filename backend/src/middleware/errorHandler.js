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

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const responsePayload = {
    success: false,
    message: error.message || 'Internal Server Error',
    ...(error.errors && { errors: error.errors }),
    ...(!isProduction && { stack: error.stack }),
  };

  if (!isProduction && statusCode === 500) {
    console.error(`[Unhandled Server Error]`, err);
  }

  res.status(statusCode).json(responsePayload);
};

export default errorHandler;
