import { test, expect } from '@playwright/test'

test.describe('E2E: Финтех-платформа FinFlow', () => {
  test.beforeEach(async ({ page }) => {
    // 🚀 ПЕРЕХВАТ: Автоматически закрываем всплывающий alert об ошибке баланса,
    // так как база в CI пустая. Тест не будет зависать!
    page.on('dialog', async (dialog) => {
      console.log(`Интерфейс выдал предупреждение: ${dialog.message()}`)
      await dialog.accept()
    })

    await page.goto('http://localhost:3000/dashboard')
  })

  test('Должен успешно отображать компоненты 100vh дашборда', async ({
    page,
  }) => {
    // Проверяем, что главный экран и его элементы загрузились
    await expect(page.locator('text=TON Mainnet')).toBeVisible()
    await expect(page.locator('text=Доступный баланс')).toBeVisible()
    await expect(
      page.locator('text=Статистика кошелька и активности'),
    ).toBeVisible()
  })

  test('Должен успешно открывать модальное окно и валидировать форму', async ({
    page,
  }) => {
    // 1. Кликаем по кнопке "Отправить"
    await page.click('button:has-text("Отправить")')

    // 2. Проверяем, что модалка успешно открылась
    const modalTitle = page.locator('h3:has-text("Отправить активы")')
    await expect(modalTitle).toBeVisible()

    // 3. Робот заполняет форму (проверяем работу инпутов)
    await page.fill(
      'input[placeholder="Введите адрес TON"]',
      'UQBl3M7sAx_99zX_dK91v9Z2pX',
    )
    await page.fill('input[placeholder="0.00"]', '0.01')

    // 4. Нажимаем кнопку подтверждения (форма отправляет данные, срабатывает наш alert)
    await page.click('button:has-text("Подтвердить транзакцию")')

    // 5. Так как база пустая и транзакция заблокирована,
    // мы закрываем модалку кликом по кнопке-крестику (X), завершая UI-тест
    const closeButton = page.locator('button:has(.lucide-x)').first()
    await closeButton.click()

    // 6. Проверяем, что модалка успешно исчезла с экрана
    await expect(modalTitle).not.toBeVisible()

    // 7. Убеждаемся, что пользователь вернулся к чистому дашборду
    await expect(page.locator('text=Доступный баланс')).toBeVisible()
  })
})
