import { test, expect } from '@playwright/test';

test.describe('Финтех Онбординг (FinFlow)', () => {
  
  test('Должен успешно проходить весь флоу до активации KYC', async ({ page }) => {
    // 1. Открытие стартового шага
    await page.goto('http://localhost:3000/onboarding/step-1');
    await expect(page.locator('h1')).toContainText('Какая ваша главная цель?');

    // 2. Выбор карточки цели "Контроль расходов"
    await page.click('text=Контроль расходов');
    
    // 3. Проверка автоматического редиректа на Шаг 2
    await page.waitForURL('http://localhost:3000/onboarding/step-2');
    await expect(page.locator('h1')).toContainText('Укажите ваш телефон');

    // 4. Валидация ошибочного ввода телефона
    await page.fill('input[type="tel"]', '123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Введите корректный номер телефона')).toBeVisible();

    // 5. Ввод корректного телефона и сабмит формы
    await page.fill('input[type="tel"]', '+79991234567');
    await page.click('button[type="submit"]');

    // 6. Проверка перехода в Демо-режим дашборда
    await page.waitForURL('http://localhost:3000/dashboard');
    await expect(page.locator('text=Требуется KYC')).toBeVisible();

    // 7. Проверка открытия отложенного модального окна KYC при клике на действие
    await page.click('text=Пополнить счет');
    await expect(page.locator('text=Быстрая верификация личности')).toBeVisible();

    // 8. Запуск симуляции ИИ-сканирования документов
    await page.click('text=Сканировать через камеру');
    await expect(page.locator('text=Аккаунт верифицирован')).toBeVisible({ timeout: 4000 });
  });
});
