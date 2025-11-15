import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()

export const ourFileRouter = {
  // Загрузка изображений товаров
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      // Проверка аутентификации
      // const user = await getCurrentUser()
      // if (!user) throw new UploadThingError('Unauthorized')
      return { userId: 'user-id' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // В продакшене не логируем в console
      if (process.env.NODE_ENV === 'development') {
        console.log('Upload complete for userId:', metadata.userId)
        console.log('file url', file.url)
      }
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Загрузка аватаров пользователей
  avatar: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // const user = await getCurrentUser()
      // if (!user) throw new UploadThingError('Unauthorized')
      return { userId: 'user-id' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  // Загрузка документов
  document: f({ pdf: { maxFileSize: '16MB', maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      return { userId: 'user-id' }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

