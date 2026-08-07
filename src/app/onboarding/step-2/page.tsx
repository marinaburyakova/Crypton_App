'use client';

import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackEvent } from '../../../lib/analytics'; // ИСПРАВЛЕНО: Добавлен импорт trackEvent с маленькой буквы

const schema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Введите корректный номер телефона в формате +79991234567'),
});

export default function Step2Page() {
  const { setPhone, nextStep } = useOnboardingStore();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: { phone: string }) => {
    try {
      // Делаем запрос к нашему бэкенд-роуту
      const response = await fetch('/api/auth/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone }),
      });

      if (!response.ok) throw new Error('Ошибка при отправке SMS');

      setPhone(data.phone);
      trackEvent('onboarding_step_2_phone_submit');
      nextStep();
      router.push('/dashboard');
    } catch (err) {
      // ИСПРАВЛЕНО: Переменная err теперь используется (выводится в консоль для дебага)
      console.error('[SMS Submit Error]:', err);
      alert('Не удалось отправить код. Попробуйте позже.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="max-w-md w-full space-y-6"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Укажите ваш телефон</h1>
        <p className="text-sm text-muted-foreground">Это необходимо для безопасного входа в FinFlow.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Input 
            {...register('phone')} 
            type="tel" 
            placeholder="+79991234567" 
            autoFocus 
            className="h-12 text-base"
          />
          {errors.phone && <p className="text-destructive text-xs">{errors.phone.message as string}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base">
          {isSubmitting ? 'Проверка...' : 'Продолжить'}
        </Button>
      </form>
    </motion.div>
  );
}
