// src/app/dashboard/page.tsx
import DashboardClient from './DashboardClient';
import { getTransactions } from './actions';
import { InferSelectModel } from 'drizzle-orm';
import { transactions } from '@/db/schema';

export const dynamic = 'force-dynamic';

type DbTransaction = InferSelectModel<typeof transactions>;

export default async function DashboardPage() {
  // await seedTransactions(); 
  // 1. Получаем транзакции из базы данных
  const dbTransactions = await getTransactions();

  // 2. РАСЧЕТ ДЛЯ ВЕРХНЕГО ГРАФИКА (Аналитика недели по реальным данным)
  const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  // Инициализируем массив дней недели нулевыми значениями
  const weeklyAnalyticsMap: Record<string, number> = {
    'Пн': 0, 'Вт': 0, 'Ср': 0, 'Чт': 0, 'Пт': 0, 'Сб': 0, 'Вс': 0
  };

  // Суммируем доходы (RECEIVE) по дням недели
  dbTransactions.forEach(tx => {
    if (tx.createdAt && tx.type === 'RECEIVE' && tx.status === 'SUCCESS') {
      const date = new Date(tx.createdAt);
      const dayName = daysOfWeek[date.getDay()]; // Получаем 'Пн', 'Вт' и т.д.
      weeklyAnalyticsMap[dayName] += parseFloat(tx.amount) || 0;
    }
  });

  // Превращаем карту в массив, который ожидает Recharts AreaChart
  const dynamicChartData = Object.keys(weeklyAnalyticsMap).map(day => ({
    name: day,
    income: Math.round(weeklyAnalyticsMap[day]) // Округляем для красоты графика
  }));

  // 3. РАСЧЕТ БАЛАНСА (Пока оставляем старую схему, на следующем шаге переведем на мультивалютность)
  const STARTING_BALANCE = 15000; // Увеличим стартовый баланс, чтобы уйти от минуса
  const totalSpent = dbTransactions
    .filter(tx => tx.type === 'SEND' && tx.status === 'SUCCESS')
    .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
  const calculatedBalance = STARTING_BALANCE - totalSpent;

  // 4. Форматируем даты для списка активностей
  const formattedTransactions = dbTransactions.map((tx: DbTransaction) => ({
    ...tx,
    created_at: tx.createdAt 
      ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : 'Только что'
  }));

  return (
    <DashboardClient 
      initialTransactions={formattedTransactions} 
      currentBalance={calculatedBalance}
      weeklyChartData={dynamicChartData}
    />
  );
}
