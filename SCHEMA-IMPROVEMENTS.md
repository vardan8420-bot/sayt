# Предложения по улучшению схемы

## ✅ Что уже есть (отлично):
- User с репутацией
- Product, Service, JobPost
- Order с AI-арбитражем и escrow
- Review, Message, CartItem, Address
- NextAuth интеграция

## 💡 Что можно добавить:

### 1. **Уведомления** (Notifications) - ВАЖНО
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  type      String   // order, message, review, dispute
  title     String
  message   String   @db.Text
  link      String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
**Зачем:** Пользователи должны знать о новых заказах, сообщениях, отзывах

### 2. **Избранное/Закладки** (Favorite/Wishlist) - ПОЛЕЗНО
```prisma
model Favorite {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  productId String?
  product   Product? @relation(...)
  serviceId String?
  service   Service? @relation(...)
  createdAt DateTime @default(now())
}
```
**Зачем:** Пользователи хотят сохранять товары для покупки позже

### 3. **Промокоды/Купоны** (Coupon) - ДЛЯ МАРКЕТИНГА
```prisma
model Coupon {
  id          String   @id @default(cuid())
  code        String   @unique
  discount    Decimal  @db.Decimal(5, 2) // процент или сумма
  discountType String  @default("percent") // percent, fixed
  minAmount   Decimal? @db.Decimal(10, 2)
  maxUses     Int?
  usedCount   Int      @default(0)
  validFrom   DateTime
  validUntil  DateTime
  active      Boolean  @default(true)
  orders      Order[]
}
```
**Зачем:** Скидки привлекают покупателей

### 4. **История просмотров** (ViewHistory) - ДЛЯ РЕКОМЕНДАЦИЙ
```prisma
model ViewHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  productId String?
  product   Product? @relation(...)
  serviceId String?
  service   Service? @relation(...)
  viewedAt  DateTime @default(now())
}
```
**Зачем:** Для рекомендаций "Вы смотрели", аналитики

### 5. **Варианты товаров** (ProductVariant) - ДЛЯ РАЗМЕРОВ/ЦВЕТОВ
```prisma
model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(...)
  name      String   // "Size", "Color"
  value     String   // "XL", "Red"
  price     Decimal? @db.Decimal(10, 2)
  stock     Int      @default(0)
}
```
**Зачем:** Товары с разными размерами, цветами, вариантами

### 6. **Комиссия платформы** (PlatformFee) - ДЛЯ БИЗНЕСА
```prisma
// Добавить в Order:
platformFee    Decimal? @db.Decimal(10, 2)
platformFeePercent Decimal? @db.Decimal(5, 2)
```
**Зачем:** Платформа должна получать комиссию с продаж

### 7. **Подписки на обновления** (Subscription) - ДЛЯ УВЕДОМЛЕНИЙ
```prisma
model Subscription {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(...)
  type      String   // product, seller, category
  targetId  String   // ID товара/продавца/категории
  email     Boolean  @default(true)
  push      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```
**Зачем:** Уведомления о снижении цены, новых товарах

---

## 🎯 Рекомендация: Добавить ТОП-3

1. **Notifications** - критично для UX
2. **Favorite** - очень популярная функция
3. **Coupon** - для маркетинга и роста продаж

Остальное можно добавить позже по мере необходимости.

