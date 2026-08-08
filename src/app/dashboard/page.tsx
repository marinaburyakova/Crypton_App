import DashboardClient from './DashboardClient';
import { getTransactions } from './actions';

// Это серверный компонент по умолчанию
export default async function DashboardPage() {
  // Прямой запрос в базу данных MySQL при загрузке страницы
  const dbTransactions = await getTransactions();

  // Форматируем данные, если даты из БД приходят в виде объектов Date
  const formattedTransactions = dbTransactions.map(tx => ({
    ...tx,
    created_at: tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Только что'
  }));

  return <DashboardClient initialTransactions={formattedTransactions} />;
}
