/**
 * Enterprise Operational ApiError class extending native Error.
 * Encapsulates status code, operational flag, and optional error details.
 */
export class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = null, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
