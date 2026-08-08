// src/app/dashboard/page.tsx
import DashboardClient from './DashboardClient';
import { getTransactions } from './actions';
import { db } from '@/db'; // Импортируем инстанс бд для прямого запроса балансов
import { transactions, balances } from '@/db/schema'; // Добавили импорт таблицы balances
import { InferSelectModel, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type DbTransaction = InferSelectModel<typeof transactions>;

export default async function DashboardPage() {
  const dbTransactions = await getTransactions();

  // 1. ЗАПРОС БАЛАНСОВ ТОКЕНОВ НАПРЯМУЮ ИЗ БАЗЫ
  const userBalances = await db
    .select()
    .from(balances)
    .where(eq(balances.userId, 1)); // Берем кошельки нашего тестового пользователя

  // 2. УСЛОВНЫЕ КУРСЫ КРИПТОВАЛЮТ К ДОЛЛАРУ ДЛЯ РАСЧЕТА ОБЩЕГО БАЛАНСА
  const CRYPTO_PRICES: Record<string, number> = {
    'TON': 5.50,
    'USDT': 1.00,
    'BTC': 68000,
    'ETH': 3500,
    'SOL': 140
  };

  // Вычисляем общий баланс портфеля в долларах
  let totalBalanceInUSD = 0;
  let tonAmount = 0;

  userBalances.forEach(wallet => {
    const amount = parseFloat(wallet.amount) || 0;
    const price = CRYPTO_PRICES[wallet.tokenSymbol] || 0;
    
    // Суммируем всё в общую долларовую копилку
    totalBalanceInUSD += amount * price;

    // Отдельно сохраняем количество TON для подписи под балансом
    if (wallet.tokenSymbol === 'TON') {
      tonAmount = amount;
    }
  });

  // 3. РАСЧЕТ ДЛЯ ВЕРХНЕГО ГРАФИКА
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const weeklyAnalyticsMap: Record<string, number> = {
    'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0
  };

  dbTransactions.forEach(tx => {
    if (tx.createdAt && tx.type === 'RECEIVE' && tx.status === 'SUCCESS') {
      const date = new Date(tx.createdAt);
      const dayName = daysOfWeek[date.getDay()]; 
      weeklyAnalyticsMap[dayName] += parseFloat(tx.amount) || 0;
    }
  });

  const dynamicChartData = Object.keys(weeklyAnalyticsMap).map(day => ({
    name: day,
    income: Math.round(weeklyAnalyticsMap[day]) 
  }));

  // 4. Форматируем даты для списка транзакций
  const formattedTransactions = dbTransactions.map((tx: DbTransaction) => ({
    ...tx,
    created_at: tx.createdAt 
      ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'Только что'
  }));

  return (
    <DashboardClient 
      initialTransactions={formattedTransactions} 
      currentBalance={totalBalanceInUSD} // Передаем суммарный долларовый баланс
      tonBalance={tonAmount} //Передаем точное количество TON для подписи
      weeklyChartData={dynamicChartData} 
    />
  );
}
