import DashboardClient from './DashboardClient'
import { getTransactions } from './actions'
import { InferSelectModel } from 'drizzle-orm'
import { transactions } from '@/db/schema' // импортируем вашу таблицу для вытягивания типа

export const dynamic = 'force-dynamic'

// Создаем строгий тип транзакции на основе схемы Drizzle
type DbTransaction = InferSelectModel<typeof transactions>

export default async function DashboardPage() {
  // Комментируем эту строку, данные уже в базе!
  // await seedTransactions();

  const dbTransactions = await getTransactions()

  // ИСПРАВЛЕНО: указали точный тип DbTransaction вместо any
  const formattedTransactions = dbTransactions.map((tx: DbTransaction) => ({
    ...tx,
    created_at: tx.createdAt
      ? new Date(tx.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Только что',
  }))

  return <DashboardClient initialTransactions={formattedTransactions} />
}
