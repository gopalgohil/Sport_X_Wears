import express from 'express';
import {
  createProduct,
  getProducts,
  getProductByIdOrSlug,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { uploadProductImages } from '../config/cloudinary.js';

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(uploadProductImages, createProduct);

router
  .route('/:idOrSlug')
  .get(getProductByIdOrSlug);

router
  .route('/:id')
  .put(uploadProductImages, updateProduct)
  .delete(deleteProduct);

export default router;
