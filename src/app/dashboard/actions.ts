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

    // используем camelCase свойства, которые требует схема Drizzle
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


export async function seedTransactions() {
  const tokens = ['USDT', 'BTC', 'ETH', 'SOL'];
  const networks = ['TRC-20', 'Bitcoin', 'ERC-20', 'Solana'];
  const types: ('SEND' | 'RECEIVE')[] = ['SEND', 'RECEIVE'];
  
  const mockTransactions = [];
  
  // Генерируем 50 транзакций за последние 30 дней
  for (let i = 0; i < 20; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - randomDaysAgo);
    
    // Случайное время в течение дня
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    const txHash = '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    mockTransactions.push({
      userId: 1,
      amount: (Math.random() * 500 + 10).toFixed(2), // Суммы от $10 до $510
      tokenSymbol: tokens[Math.floor(Math.random() * tokens.length)],
      network: networks[Math.floor(Math.random() * networks.length)],
      type: types[Math.floor(Math.random() * types.length)],
      txHash: txHash,
      status: 'SUCCESS',
      createdAt: date // Разные даты для красивого таймлайна на графике
    });
  }

  // Массовая вставка в MySQL через Drizzle
  await db.insert(transactions).values(mockTransactions);
  
  return { success: true };
}
