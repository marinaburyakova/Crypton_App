'use client';

import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { step, prevStep } = useOnboardingStore();
  const router = useRouter();

  // Всего 3 шага внутри папки onboarding (1: Цель, 2: Телефон, 3: Ожидание/Переход)
  const progressValue = (step / 3) * 100;

  const handleBack = () => {
    prevStep();
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-between p-4 md:p-8">
      <header className="max-w-md w-full mx-auto flex items-center gap-4 mb-6">
        {step > 1 && (
          <button onClick={handleBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition" aria-label="Назад">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <Progress value={progressValue} suppressHydrationWarning className="h-2 w-full transition-all duration-300" />
        <span className="text-xs font-medium text-slate-500 min-w-10 text-right">Шаг {step}/3</span>
      </header>
      
      <main className="flex-1 flex items-center justify-center w-full">
        {children}
      </main>
    </div>
  );
}
