import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  decimal,
} from 'drizzle-orm/mysql-core'

//таблица пользователей
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  kycStatus: varchar('kyc_status', { length: 20 }).default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Транзакции кошелька
export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  // Связываем трансляцию с id пользователя
  userId: int('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(), // Сумма перевода (например 1500.50)
  type: varchar('type', { length: 20 }).notNull(), // 'deposit' (пополнение) или 'transfer' (перевод)
  status: varchar('status', { length: 20 }).default('PENDING'), // 'SUCCESS', 'PENDING', 'FAILED'
  createdAt: timestamp('created_at').defaultNow(),
})
