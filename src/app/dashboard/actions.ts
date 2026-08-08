"use server"
import { revalidatePath } from 'next/cache'
import { db } from '@/db' // укажите ваш путь к инициализации базы данных
import { transactions } from '@/db/schema' // укажите ваш путь к схеме таблиц
import { desc } from "drizzle-orm";

export async function getTransactions() {
  // Получаем транзакции, сортируя от новых к старым
  return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
}

export async function createTransaction(formData: {
  amount: string
  tokenSymbol: string
  network: string
  type: 'SEND' | 'RECEIVE'
}) {
  try {
    const mockUserId = 1

    const txHash =
      '0x' +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')

    // ИСПОРАВЛЕНО: используем camelCase свойства, которые требует схема Drizzle
    await db.insert(transactions).values({
      userId: mockUserId, // вместо user_id
      amount: formData.amount,
      tokenSymbol: formData.tokenSymbol, // вместо token_symbol
      network: formData.network,
      type: formData.type,
      txHash: txHash, // вместо tx_hash
      status: 'SUCCESS',
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Ошибка при сохранении транзакции:', error)
    return { success: false, error: 'Не удалось отправить средства' }
  }
}
