import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryByIdOrSlug,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { uploadBannerImage } from '../config/cloudinary.js';

const router = express.Router();

router
  .route('/')
  .get(getAllCategories)
  .post(uploadBannerImage, createCategory);

router
  .route('/:idOrSlug')
  .get(getCategoryByIdOrSlug);

router
  .route('/:id')
  .put(uploadBannerImage, updateCategory)
  .delete(deleteCategory);

export default router;
