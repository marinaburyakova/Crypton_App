'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, ArrowLeft, Wallet, Info, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

export default function CryptoSwapPage() {
  const router = useRouter();
  const { phone } = useOnboardingStore();
  
  const [fromAmount, setFromAmount] = useState('');
  const [isTonToUsdt, setIsTonToUsdt] = useState(true); // Направление обмена
  const [isSwapping, setIsSwapping] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const TON_PRICE = 5.35; // Фейковый курс TON/USDT для расчета

  // ВЫЧИСЛЕНИЕ НА ЛЕТУ (Исключает ошибку каскадного рендеринга)
  const amount = parseFloat(fromAmount);
  const toAmount = isNaN(amount) || amount <= 0 
    ? '' 
    : isTonToUsdt 
      ? (amount * TON_PRICE).toFixed(2) 
      : (amount / TON_PRICE).toFixed(4);

  // Логика смены направления обмена (реверс)
  const handleReverse = () => {
    setIsTonToUsdt(!isTonToUsdt);
    setFromAmount('');
  };

  const handleSwapSubmit = async () => {
    if (!fromAmount) return;
    
    setIsSwapping(true);
    trackEvent('kyc_modal_open'); // Для аналитики воронки обмена

    try {
      // Запрос к нашему Drizzle-бэкенду для фиксации транзакции обмена в Docker
      const response = await fetch('/api/crypto/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromToken: isTonToUsdt ? 'TON' : 'USDT',
          toToken: isTonToUsdt ? 'USDT' : 'TON',
          amount: parseFloat(fromAmount),
          phone: phone
        }),
      });

      if (!response.ok) throw new Error('Ошибка обмена');

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Ошибка при проведении транзакции блокчейна.');
    } finally {
      setIsSwapping(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm w-full text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
          <h2 className="text-2xl font-bold">Обмен успешно завершен!</h2>
          <p className="text-sm text-muted-foreground">Транзакция отправлена в блокчейн. Средства поступят в течение пары секунд.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full h-12 mt-4">Вернуться в кошелек</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-12">
      {/* ШАПКА НАВИГАЦИИ */}
      <header className="border-b bg-card px-4 py-4 sticky top-0 z-10 flex items-center gap-4">
        <Button onClick={() => router.back()} variant="ghost" size="icon" className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-bold text-lg">Обмен активов</h1>
      </header>

      <main className="max-w-md mx-auto px-4 mt-6 space-y-4">
        <div className="relative flex flex-col gap-2">
          
          {/* КАРТОЧКА: ОТДАЮ */}
          <Card className="p-4 bg-card border space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
              <span>Вы отдаете</span>
              <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Баланс: {isTonToUsdt ? '120.4 TON' : '1450.5 USDT'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="number" 
                placeholder="0.0" 
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="text-2xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto w-full"
              />
              <span className="text-lg font-bold bg-muted px-3 py-1.5 rounded-xl border shrink-0">
                {isTonToUsdt ? '💎 TON' : '💵 USDT'}
              </span>
            </div>
          </Card>

          {/* КНОПКА РЕВЕРСА (Переворот направления) */}
          <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 z-10">
            <Button onClick={handleReverse} size="icon" className="rounded-xl w-9 h-9 border shadow-md bg-background text-foreground hover:bg-muted">
              <ArrowUpDown className="w-4 h-4 text-primary" />
            </Button>
          </div>

          {/* КАРТОЧКА: ПОЛУЧАЮ */}
          <Card className="p-4 bg-card border space-y-2 mt-1">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
              <span>Вы получаете (оценка)</span>
              <span className="flex items-center gap-1"><Wallet className="w-3 h-3" /> Баланс: {isTonToUsdt ? '1450.5 USDT' : '120.4 TON'}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <Input 
                type="text" 
                placeholder="0.0" 
                value={toAmount}
                readOnly
                className="text-2xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto w-full text-primary"
              />
              <span className="text-lg font-bold bg-muted px-3 py-1.5 rounded-xl border shrink-0">
                {isTonToUsdt ? '💵 USDT' : '💎 TON'}
              </span>
            </div>
          </Card>
        </div>

        {/* ДЕТАЛИ КОМИССИИ */}
        <Card className="p-3 bg-muted/40 border text-xs space-y-2">
          <div className="flex justify-between text-muted-foreground">
            <span className="flex items-center gap-1">Курс обмена <Info className="w-3 h-3" /></span>
            <span className="font-medium text-foreground">1 TON ≈ {TON_PRICE} USDT</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Комиссия сети (Gas Fee)</span>
            <span className="font-medium text-emerald-500">Бесплатно (FinFlow Pay)</span>
          </div>
        </Card>

        {/* КНОПКА СУБМИТА */}
        <Button 
          onClick={handleSwapSubmit} 
          disabled={!fromAmount || isSwapping} 
          className="w-full h-14 text-base font-bold rounded-xl shadow-lg mt-4"
        >
          {isSwapping ? 'Отправка в блокчейн...' : 'Обменять активы'}
        </Button>
      </main>
    </div>
  );
}
