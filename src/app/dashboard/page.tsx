'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { goal, phone, isVerified, setVerified } = useOnboardingStore();
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleActionClick = () => {
    if (!isVerified) {
      setIsKycOpen(true);
    } else {
      alert('Действие успешно выполнено!');
    }
  };

  const handleStartKyc = () => {
    setIsScanning(true);
    // Симуляция OCR (распознавания документов) за 2 секунды
    setTimeout(() => {
      setIsScanning(false);
      setVerified(true);
      setIsKycOpen(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Главный экран FinFlow</h1>
          <p className="text-xs text-muted-foreground">Режим: {goal || 'Стандартный'} • Тел: {phone || 'Не указан'}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {isVerified ? <UserCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {isVerified ? 'Аккаунт верифицирован' : 'Требуется KYC'}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Доступный баланс</h3>
          <p className="text-3xl font-bold">$0.00</p>
          <Button onClick={handleActionClick} className="w-full bg-primary text-primary-foreground font-medium">
            Пополнить счет
          </Button>
        </Card>
        <Card className="p-6 flex flex-col justify-between border-dashed border-2 opacity-60">
          <p className="text-sm font-medium">Ваш умный виджет расходов появится здесь после первого пополнения.</p>
        </Card>
      </div>

      {/* Умное модальное окно KYC (Отложенная верификация) */}
      <Dialog open={isKycOpen} onOpenChange={setIsKycOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl">Быстрая верификация личности</DialogTitle>
            <DialogDescription>
              Для соблюдения требований ЦБ и обеспечения безопасности вашего счета, подтвердите профиль через распознавание документов.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 flex flex-col items-center justify-center">
            {isScanning ? (
              <div className="space-y-3 text-center">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-muted-foreground font-medium animate-pulse">ИИ сканирует данные паспорта...</p>
              </div>
            ) : (
              <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-center text-xs text-muted-foreground">
                Данные будут автоматически извлечены из фото. Это займет всего пару секунд.
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-center">
            <Button onClick={handleStartKyc} disabled={isScanning} className="w-full h-11">
              {isScanning ? 'Обработка...' : 'Сканировать через камеру'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
