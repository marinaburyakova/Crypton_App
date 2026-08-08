import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  decimal,
} from 'drizzle-orm/mysql-core'

// Таблица пользователей (остается прежней для онбординга)
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  kycStatus: varchar('kyc_status', { length: 20 }).default('PENDING'),
  createdAt: timestamp('created_at').defaultNow(),
})

// КРИПТО-ТАБЛИЦА: Транзакции токенов
export const transactions = mysqlTable('transactions', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 18, scale: 6 }).notNull(), // Повышенная точность для крипты
  tokenSymbol: varchar('token_symbol', { length: 10 }).notNull(), // 'USDT', 'TON', 'BTC'
  network: varchar('network', { length: 20 }).notNull(), // 'TRON', 'TON-Network', 'Ethereum'
  type: varchar('type', { length: 20 }).notNull(), // 'receive' (получение), 'send' (отправка), 'swap' (обмен)
  txHash: varchar('tx_hash', { length: 80 }), // Хэш транзакции в блокчейне для прозрачности
  status: varchar('status', { length: 20 }).default('SUCCESS'), // 'SUCCESS', 'PENDING', 'FAILED'
  createdAt: timestamp('created_at').defaultNow(),
})

// ТАБЛИЦА БАЛАНСОВ: Хранит баланс каждого токена для пользователя
export const balances = mysqlTable('balances', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenSymbol: varchar('token_symbol', { length: 10 }).notNull(), // 'USDT', 'TON', 'BTC', 'SOL'
  amount: decimal('amount', { precision: 18, scale: 6 })
    .notNull()
    .default('0.000000'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
})
