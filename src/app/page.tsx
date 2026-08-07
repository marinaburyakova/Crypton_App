'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, TrendingUp, Landmark } from 'lucide-react';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function WelcomePage() {
  const router = useRouter();
  const { reset } = useOnboardingStore();

  const handleStart = () => {
    reset(); // Сбрасываем стейт перед началом нового флоу
    router.push('/onboarding/step-1');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between p-4 md:p-8">
      {/* Шапка */}
      <header className="max-w-5xl w-full mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Landmark className="w-6 h-6 text-primary" />
          <span>FinFlow</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border shadow-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Защита данных по стандарту PCI DSS</span>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 my-auto">
        {/* Левая колонка: Оффер и CTA */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 space-y-6 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Новое поколение финтеха</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-slate-50">
            Управляйте деньгами <br />
            <span className="bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              проще и быстрее
            </span>
          </h1>
          
          <p className="text-base text-muted-foreground max-w-md mx-auto lg:mx-0">
            Умный кошелек, трекер расходов и инвестиции в одном безопасном приложении. Начните прямо сейчас без долгой бумажной рутины.
          </p>

          <div className="pt-2">
            <Button 
              onClick={handleStart} 
              size="lg" 
              className="h-14 px-8 text-base font-medium gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto group"
            >
              Открыть счет бесплатно
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Правая колонка: Продуктовые преимущества */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex-1 w-full max-w-sm grid grid-cols-1 gap-4"
        >
          <Card className="p-4 flex items-start gap-4 border shadow-sm bg-white dark:bg-slate-800">
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Быстрый старт за 1 минуту</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Вход по номеру телефона, доступ к демо-режиму сразу.</p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-4 border shadow-sm bg-white dark:bg-slate-800">
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Персонализация интерфейса</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Приложение адаптируется под ваши финансовые цели.</p>
            </div>
          </Card>

          <Card className="p-4 flex items-start gap-4 border shadow-sm bg-white dark:bg-slate-800">
            <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Отложенный KYC</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Изучайте функции приложения до загрузки документов.</p>
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Подвал */}
      <footer className="max-w-5xl w-full mx-auto text-center py-4 border-t text-xs text-muted-foreground mt-8">
        © {new Date().getFullYear()} FinFlow. Все права защищены. Лицензия ЦБ РФ №0000.
      </footer>
    </div>
  );
}
