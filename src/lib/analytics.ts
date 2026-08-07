const METRIKA_ID = 12345678;

type MetrikaGoal =
  | 'onboarding_start'
  | 'onboarding_step_1_goal_select'
  | 'onboarding_step_2_phone_submit'
  | 'dashboard_view_demo'
  | 'kyc_modal_open'
  | 'kyc_verification_success';

// Расширяем глобальный объект window, чтобы TypeScript знал про Яндекс Метрику
interface YandexMetrikaWindow extends Window {
  ym?: (id: number, action: 'reachGoal', goal: string, properties?: Record<string, unknown>) => void;
}

export const trackEvent = (goal: MetrikaGoal, properties?: Record<string, unknown>) => {
  // Логирование для разработки
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_TEST_ENV === 'true') {
    console.log(`[Яндекс.Метрика]: Достигнута цель "${goal}"`, properties || '');
  }

  // Безопасно приводим window к нашему расширенному интерфейсу без использования any
  if (typeof window !== 'undefined') {
    const customWindow = window as YandexMetrikaWindow;
    
    if (customWindow.ym) {
      customWindow.ym(METRIKA_ID, 'reachGoal', goal, properties);
    }
  }
};
