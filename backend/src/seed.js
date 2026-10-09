import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

const SEED_CATEGORIES = [
  {
    name: 'Sports T-Shirts',
    slug: 'sports-t-shirts',
    description: 'High-performance athletic moisture-wicking and seamless t-shirts engineered for peak endurance.',
    isActive: true,
  },
  {
    name: 'Track Pants',
    slug: 'track-pants',
    description: 'Ergonomic tapered jogger track pants with water-repellent flex weave and zippered storage.',
    isActive: true,
  },
  {
    name: 'Sports Caps',
    slug: 'sports-caps',
    description: 'Laser-perforated breathable headwear with sweat-absorbent athletic bands.',
    isActive: true,
  },
];

const SEED_PRODUCTS = [
  {
    title: 'Pro-Vent Mesh Seamless Tee',
    categorySlug: 'sports-t-shirts',
    description: 'Engineered with AeroVent™ 4-way micro-cooling mesh and zero-abrasion seam technology. Stress-tested by marathon athletes for uncompromising heat expulsion.',
    price: 1899,
    discountPrice: 1499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 25,
    isActive: true,
  },
  {
    title: 'Apex Aerodynamic Compression Top',
    categorySlug: 'sports-t-shirts',
    description: 'Graduated compression panels support key muscle tendons, reducing micro-vibrations and accelerating recovery during high-exertion training sessions.',
    price: 2299,
    discountPrice: 1799,
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 18,
    isActive: true,
  },
  {
    title: 'Kinetic Swift-Dry Training Shirt',
    categorySlug: 'sports-t-shirts',
    description: 'Ultralight polymer construction expels sweat 4x faster than standard cotton, keeping the core regulated under extreme cardiovascular load.',
    price: 1299,
    discountPrice: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 32,
    isActive: true,
  },
  {
    title: 'Velocity Tapered Track Pant 2.0',
    categorySlug: 'track-pants',
    description: 'Ultrasonic bonded seam joints eliminate friction. Features articulated knee articulation, waterproof zip lock pockets, and ankle zip gussets.',
    price: 2999,
    discountPrice: 2499,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 14,
    isActive: true,
  },
  {
    title: 'HydroShield Storm Flex Pants',
    categorySlug: 'track-pants',
    description: 'DWR water-repellent flex weave repels road spray and sudden downpours while preserving 4-way mechanical stretch.',
    price: 3499,
    discountPrice: 2899,
    sizes: ['M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 12,
    isActive: true,
  },
  {
    title: 'AeroVent Laser-Perforated Cap',
    categorySlug: 'sports-caps',
    description: 'Hundreds of laser-cut micro vents promote immediate evaporative cooling across the crown. Curved anti-glare brim for outdoor sports.',
    price: 1199,
    discountPrice: 899,
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 40,
    isActive: true,
  },
  {
    title: 'Shadow Stealth Running Cap',
    categorySlug: 'sports-caps',
    description: 'Featherlight 52-gram construction with reflective 3M accents for maximum visibility during dusk and dawn marathon training.',
    price: 999,
    discountPrice: 799,
    sizes: ['M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 22,
    isActive: true,
  },
  {
    title: 'Pulse Elite Compression Long Sleeve',
    categorySlug: 'sports-t-shirts',
    description: 'Full-arm graduated compression weave with thermal balance zones. Keeps body temperature optimized in chilled training conditions.',
    price: 2499,
    discountPrice: 2099,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    ],
    stock: 16,
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await connectDB();

    console.log('[Seed] Clearing existing products & categories...');
    await Product.deleteMany({});
    await Category.deleteMany({});

    console.log('[Seed] Inserting categories...');
    const insertedCategories = await Category.insertMany(SEED_CATEGORIES);
    console.log(`[Seed] Created ${insertedCategories.length} categories.`);

    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    console.log('[Seed] Inserting products...');
    const productsToInsert = SEED_PRODUCTS.map((prod) => {
      const categoryId = categoryMap[prod.categorySlug];
      const slug = prod.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      return {
        title: prod.title,
        slug,
        category: categoryId,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        sizes: prod.sizes,
        images: prod.images,
        stock: prod.stock,
        isActive: prod.isActive,
      };
    });

    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`[Seed] Successfully inserted ${insertedProducts.length} athletic products into MongoDB Atlas!`);

    await mongoose.connection.close();
    console.log('[Seed] Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
