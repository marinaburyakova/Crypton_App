import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createTransaction } from './actions'

// Объявляем шпионов через vi.hoisted, чтобы они поднялись наверх вместе с моком
const { mockInsert, mockValues, mockUpdate, mockSet } = vi.hoisted(() => {
  const spyWhere = vi.fn().mockReturnThis()
  const spySet = vi.fn().mockReturnValue({ where: spyWhere }) // .set() теперь возвращает объект с методом .where
  
  return {
    mockWhere: spyWhere,
    mockSet: spySet,
    mockUpdate: vi.fn().mockReturnValue({ set: spySet }),
    mockInsert: vi.fn().mockReturnThis(),
    mockValues: vi.fn().mockResolvedValue({ success: true }),
  }
})

// Изолируем вызовы ядра Next.js
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Имитируем Drizzle ORM со строгим отслеживанием цепочек методов
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() => [
      { id: 1, userId: 1, tokenSymbol: 'TON', amount: '500.000000' } // Исходный баланс 500 TON
    ]),
    insert: mockInsert,
    values: mockValues,
    update: mockUpdate,
  }
}))

describe('Бэкенд: Server Actions (createTransaction)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks() // Сбрасываем счетчики вызовов перед каждым тестом
  })

  it('должен выдать ошибку, если сумма перевода равна нулю или отрицательная', async () => {
    const result = await createTransaction({
      amount: '0',
      tokenSymbol: 'TON',
      network: 'TON Network',
      type: 'SEND'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Сумма перевода должна быть больше нуля')
  })

  it('должен выдать ошибку, если сумма перевода превышает текущий баланс пользователя', async () => {
    const result = await createTransaction({
      amount: '600', // 600 > 500
      tokenSymbol: 'TON',
      network: 'TON Network',
      type: 'SEND'
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Недостаточно средств')
  })

  it('должен обновить строку баланса в MySQL при успешной отправке', async () => {
    const result = await createTransaction({
      amount: '100', // 500 - 100 = 400
      tokenSymbol: 'TON',
      network: 'TON Network',
      type: 'SEND'
    })

    expect(result.success).toBe(true)
    
    // Проверяем, что Drizzle вызвал команду обновления таблицы балансов
    expect(mockUpdate).toHaveBeenCalled()
    // Проверяем, что в базу ушло строго вычисленное новое значение: 400.000000
    expect(mockSet).toHaveBeenCalledWith({ amount: '400.000000' })
  })

  it('должен создать новую запись в таблице транзакций при успешном переводе', async () => {
    const result = await createTransaction({
      amount: '50',
      tokenSymbol: 'TON',
      network: 'TON Network',
      type: 'SEND'
    })

    expect(result.success).toBe(true)
    // Проверяем цепочку методов insert().values() для истории активностей
    expect(mockInsert).toHaveBeenCalled()
    expect(mockValues).toHaveBeenCalled()
  })
})