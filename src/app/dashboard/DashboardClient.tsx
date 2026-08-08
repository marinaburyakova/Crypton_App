'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowUpRight, ArrowDownLeft, X, QrCode, Copy, 
  TrendingUp, Activity, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import { createTransaction } from './actions';

// Данные для графика
const chartData = [
  { name: 'Пн', income: 400 },
  { name: 'Вт', income: 300 },
  { name: 'Ср', income: 500 },
  { name: 'Чт', income: 700 },
  { name: 'Пт', income: 600 },
  { name: 'Сб', income: 800 },
  { name: 'Вс', income: 900 },
];

// Опишите структуру вашей транзакции
interface Transaction {
  id: number;
  userId: number;
  amount: string;
  tokenSymbol: string; // Вместо token_symbol
  network: string;
  type: string;
  txHash: string | null; // Вместо tx_hash
  status: string | null;
  createdAt: Date | null;
  created_at: string; // Для отформатированного времени
}
// Исправленный компонент DashboardClient
export default function DashboardClient({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | null>(null);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayTransactions = initialTransactions.length > 0 ? initialTransactions : [];

  const closeModal = () => setActiveModal(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !recipient) return;

    setIsSubmitting(true);
    const result = await createTransaction({
      amount: amount,
      tokenSymbol: 'TON',
      network: 'TON Network',
      type: 'SEND'
    });

    setIsSubmitting(false);
    if (result.success) {
      setActiveModal(null);
      setAmount('');
      setRecipient('');
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* ВЕРХНЯЯ ПАНЕЛЬ: ИНДИКАТОР СЕТИ И ПРОФИЛЬ */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">TON Mainnet</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-fuchsia-500 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
              M
            </div>
          </div>
        </div>

        {/* КАРТОЧКА БАЛАНСА */}
        <Card className="p-6 sm:p-8 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 border-none text-white space-y-4 shadow-[0_0_30px_rgba(139,92,246,0.4)] relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          
          <p className="text-xs text-indigo-100 font-medium tracking-wide uppercase">Доступный баланс</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">$2,450.85</h2>
          
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md">
            <Button 
              onClick={() => setActiveModal('send')} 
              className="w-full bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md text-white border border-white/10 gap-2 h-11 rounded-xl transition-all font-semibold active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4 text-cyan-400" /> Отправить
            </Button>
            <Button 
              onClick={() => setActiveModal('receive')} 
              className="w-full bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md text-white border border-white/10 gap-2 h-11 rounded-xl transition-all font-semibold active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Получить
            </Button>
          </div>
        </Card>

        {/* БЛОК ГРАФИКА */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-500" /> Аналитика недели
            </h3>
            <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-md h-48 sm:h-56 lg:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ИСТОРИЯ АКТИВНОСТЕЙ */}
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            История активностей
          </h3>
          
          <div className="space-y-2.5">
            {displayTransactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tx.id * 0.05 }} // теперь tx.id точно number
                className="flex items-center justify-between p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border shrink-0 ${
                    tx.type === 'RECEIVE' 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                  }`}>
                    {tx.type === 'RECEIVE' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold tracking-tight">
                      {tx.type === 'RECEIVE' ? 'Получено' : 'Отправлено'}
                    </p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 flex-wrap">
                      {tx.created_at} • <span className="font-mono text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors truncate">{tx.txHash}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1 shrink-0 ml-2">
                  <p className={`text-sm font-black tracking-tight ${
                    tx.type === 'RECEIVE' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.type === 'RECEIVE' ? '+' : '-'}{tx.amount} {tx.tokenSymbol}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {tx.status === 'SUCCESS' ? (
                      <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> OK
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <AlertCircle className="w-2.5 h-2.5" /> Сбой
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* МОДАЛЬНЫЕ ОКНА */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <Button 
                onClick={closeModal} 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* КОНТЕНТ: ОТПРАВИТЬ */}
              {activeModal === 'send' && (
                <form onSubmit={handleSend} className="space-y-4">
                  <h3 className="text-2xl font-bold">Отправить активы</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1.5">Адрес получателя</label>
                      <input 
                        type="text" 
                        placeholder="Введите адрес TON" 
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-1.5">Сумма перевода</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        required
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Отправка...' : 'Подтвердить транзакцию'}
                    </Button>
                  </div>
                </form>
              )}

              {/* КОНТЕНТ: ПОЛУЧИТЬ */}
              {activeModal === 'receive' && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Получить средства</h3>
                  <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                    <p className="text-sm text-yellow-400 font-medium flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>Принимайте только токены в сети TON Network. Перевод других валют приведет к их безвозвратной потере.</span>
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-6 text-center space-y-3">
                    <div className="w-32 h-32 mx-auto bg-linear-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      <QrCode className="w-16 h-16 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400">Ваш адрес для получения</p>
                      <p className="text-sm font-mono text-cyan-400 break-all">UQBl3M7sAx_99zX_dK91v9Z2pX</p>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-2">
                        <Copy className="w-3 h-3" /> Копировать
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}