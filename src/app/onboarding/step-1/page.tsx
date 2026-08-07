'use client';

import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Wallet, TrendingUp, ArrowLeftRight } from 'lucide-react';

const GOALS = [
  { id: 'spend', title: 'Контроль расходов', desc: 'Удобный трекер бюджета', icon: Wallet },
  { id: 'invest', title: 'Инвестиции и сбережения', desc: 'Копите под высокий процент', icon: TrendingUp },
  { id: 'transfer', title: 'Переводы и платежи', desc: 'Мгновенно и без комиссий', icon: ArrowLeftRight },
];

export default function Step1Page() {
  const { setGoal, nextStep } = useOnboardingStore();
  const router = useRouter();

  const handleSelect = (id: string) => {
    setGoal(id);
    nextStep();
    router.push('/onboarding/step-2');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-md w-full space-y-6"
    >
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-2xl font-bold tracking-tight">Какая ваша главная цель?</h1>
        <p className="text-sm text-muted-foreground">Мы настроим главный экран под ваши приоритеты.</p>
      </div>
      <div className="space-y-3">
        {GOALS.map((item) => {
          const Icon = item.icon;
          return (
            <Card 
              key={item.id} 
              onClick={() => handleSelect(item.id)}
              className="p-4 flex items-center gap-4 cursor-pointer hover:border-primary hover:shadow-md transition-all group"
            >
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10 transition-colors">
                <Icon className="w-6 h-6 text-slate-700 dark:text-slate-300 group-hover:text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-base">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
