import { authorize } from './authMiddleware.js';

export const requireAdmin = authorize('admin');
