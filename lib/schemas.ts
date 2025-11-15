import { z } from 'zod'

// Схема для создания товара
export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be at most 5000 characters'),
  price: z.number().positive('Price must be positive'),
  images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).max(20).optional(),
  location: z.string().optional(),
  stock: z.number().int().min(0).default(1),
  published: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
})

// Схема для создания услуги
export const createServiceSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  price: z.number().positive().nullable().optional(),
  priceType: z.enum(['FIXED', 'HOURLY', 'PROJECT']).default('FIXED'),
  category: z.string(),
  tags: z.array(z.string()).max(10),
  portfolioImages: z.array(z.string().url()).max(20),
  deliveryTime: z.number().int().positive().optional(),
  published: z.boolean().default(false),
  metaTitle: z.string().max(60).optional(),
  metaDesc: z.string().max(160).optional(),
})

// Схема для создания вакансии
export const createJobPostSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10).max(5000),
  requirements: z.array(z.string()).min(1),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().default('USD'),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  published: z.boolean().default(false),
})

// Схема для обновления товара
export const updateProductSchema = createProductSchema.partial()

// Схема для добавления в корзину
export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive().min(1).max(100).default(1),
})

// Схема для обновления корзины
export const updateCartSchema = z.object({
  quantity: z.number().int().positive().min(1).max(100),
})

// Схема для создания заказа
export const createOrderSchema = z.object({
  productId: z.string().optional(),
  cartItemIds: z.array(z.string()).optional(),
  shippingAddressId: z.string().min(1).optional(),
  couponCode: z.string().optional(),
})

// Схема для создания отзыва
export const createReviewSchema = z.object({
  productId: z.string().optional(),
  targetId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(5000).optional(),
  images: z.array(z.string().url()).max(5).optional(),
}).refine((data) => data.productId || data.targetId, {
  message: 'Product ID or target user ID is required',
})

// Схема для добавления в избранное
export const addToFavoritesSchema = z.object({
  productId: z.string().optional(),
  serviceId: z.string().optional(),
}).refine((data) => data.productId || data.serviceId, {
  message: 'Product ID or Service ID is required',
})

// Схема для обновления уведомлений
export const updateNotificationsSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
  markAllAsRead: z.boolean().optional(),
})

// Типы для TypeScript
export type CreateProductInput = z.infer<typeof createProductSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type CreateJobPostInput = z.infer<typeof createJobPostSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>

