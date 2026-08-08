'use server'
import { revalidatePath } from 'next/cache'
import { db } from '@/db' // укажите ваш путь к инициализации базы данных
import { transactions, balances } from '@/db/schema' // укажите ваш путь к схеме таблиц
import { desc, eq, and } from 'drizzle-orm'

export async function getTransactions() {
  // Получаем транзакции, сортируя от новых к старым
  return await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
}

export async function createTransaction(formData: {
  amount: string
  tokenSymbol: string
  network: string
  type: 'SEND' | 'RECEIVE'
}) {
  try {
    const mockUserId = 1
    const transferAmount = parseFloat(formData.amount) || 0

    if (transferAmount <= 0) {
      return { success: false, error: 'Сумма перевода должна быть больше нуля' }
    }

    // 1. ПРОВЕРЯЕМ ТЕКУЩИЙ БАЛАНС ТОКЕНА В БАЗЕ (Только для типа SEND)
    if (formData.type === 'SEND') {
      const [userWallet] = await db
        .select()
        .from(balances)
        .where(
          and(
            eq(balances.userId, mockUserId),
            eq(balances.tokenSymbol, formData.tokenSymbol),
          ),
        )

      const currentWalletAmount = userWallet ? parseFloat(userWallet.amount) : 0

      // Защита от ухода баланса в минус
      if (currentWalletAmount < transferAmount) {
        return {
          success: false,
          error: `Недостаточно средств. Ваш баланс: ${currentWalletAmount} ${formData.tokenSymbol}`,
        }
      }

      // 2. ОБНОВЛЯЕМ ТАБЛИЦУ БАЛАНСОВ (Вычитаем сумму)
      const newBalance = currentWalletAmount - transferAmount

      await db
        .update(balances)
        .set({ amount: newBalance.toFixed(6) }) // Сохраняем в базу строку с высокой точностью
        .where(
          and(
            eq(balances.userId, mockUserId),
            eq(balances.tokenSymbol, formData.tokenSymbol),
          ),
        )
    }

    // 3. ЗАПИСЫВАЕМ ТРАНЗАКЦИЮ В ИСТОРИЮ
    const txHash =
      '0x' +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')

    await db.insert(transactions).values({
      userId: mockUserId,
      amount: formData.amount,
      tokenSymbol: formData.tokenSymbol,
      network: formData.network,
      type: formData.type,
      txHash: txHash,
      status: 'SUCCESS',
    })

    // 4. СБРАСЫВАЕМ КЭШ СТРАНИЦЫ
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Ошибка при сохранении транзакции:', error)
    return { success: false, error: 'Не удалось отправить средства' }
  }
}

// Сначала добавьте импорт таблицы balances в самом верху actions.ts:
// import { transactions, balances } from '@/db/schema'

export async function seedTransactions() {
  'use server'

  // 1. Сначала создаем стартовые балансы для пользователя #1
  const startBalances = [
    { userId: 1, tokenSymbol: 'TON', amount: '1245.500000' },
    { userId: 1, tokenSymbol: 'USDT', amount: '2450.850000' },
    { userId: 1, tokenSymbol: 'BTC', amount: '0.045000' },
    { userId: 1, tokenSymbol: 'ETH', amount: '0.750000' },
    { userId: 1, tokenSymbol: 'SOL', amount: '12.300000' },
  ]

  // Очищаем старые балансы перед заливкой (опционально, чтобы не дублировать)
  try {
    await db.insert(balances).values(startBalances)
  } catch (e) {
    console.log('Балансы уже инициализированы', e)
  }

  // 2. Генерируем историю транзакций (наш старый рабочий код)
  const tokens = ['USDT', 'BTC', 'ETH', 'SOL', 'TON']
  const networks = ['TRC-20', 'Bitcoin', 'ERC-20', 'Solana', 'TON Network']
  const types: ('SEND' | 'RECEIVE')[] = ['SEND', 'RECEIVE']

  const mockTransactions = []
  for (let i = 0; i < 50; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 30)
    const date = new Date()
    date.setDate(date.getDate() - randomDaysAgo)
    date.setHours(
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60),
    )

    const txHash =
      '0x' +
      Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16),
      ).join('')
    const currentToken = tokens[Math.floor(Math.random() * tokens.length)]

    mockTransactions.push({
      userId: 1,
      amount: (Math.random() * 50 + 5).toFixed(2), // Уменьшили суммы до $5-$55, чтобы не уходить в минус
      tokenSymbol: currentToken,
      network: networks[Math.floor(Math.random() * networks.length)],
      type: types[Math.floor(Math.random() * types.length)],
      txHash: txHash,
      status: 'SUCCESS',
      createdAt: date,
    })
  }

  await db.insert(transactions).values(mockTransactions)
  return { success: true }
}
