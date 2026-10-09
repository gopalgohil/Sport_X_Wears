/**
 * High-performance Higher-Order Function wrapper for Express async controllers.
 * Catches unhandled promise rejections and forwards them to the centralized errorHandler.
 *
 * @param {Function} executionHandler - Async request handler function (req, res, next)
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (executionHandler) => (req, res, next) => {
  Promise.resolve(executionHandler(req, res, next)).catch(next);
};

export default asyncHandler;
