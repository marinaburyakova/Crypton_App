import { test, expect } from '@playwright/test'

test.describe('E2E: Финтех-платформа FinFlow', () => {
  test.beforeEach(async ({ page }) => {
    // Автоматически нажимаем "ОК" на любые всплывающие окна alert(), чтобы тест не зависал
    page.on('dialog', async (dialog) => {
      console.log(`Предупреждение от приложения: ${dialog.message()}`)
      await dialog.accept()
    })

    await page.goto('http://localhost:3000/dashboard')
  })

  test('Должен успешно отображать компоненты 100vh дашборда', async ({
    page,
  }) => {
    await expect(page.locator('text=TON Mainnet')).toBeVisible()
    await expect(page.locator('text=Доступный баланс')).toBeVisible()
    await expect(
      page.locator('text=Статистика кошелька и активности'),
    ).toBeVisible()
  })

  test('Должен успешно открывать модальное окно и проводить транзакцию', async ({
    page,
  }) => {
    await page.click('button:has-text("Отправить")')

    const modalTitle = page.locator('h3:has-text("Отправить активы")')
    await expect(modalTitle).toBeVisible()

    await page.fill(
      'input[placeholder="Введите адрес TON"]',
      'UQBl3M7sAx_99zX_dK91v9Z2pX',
    )

    // 🚀 ИСПРАВЛЕНО: Отправляем минимальную сумму 0.01, чтобы гарантированно пройти лимиты базы данных
    await page.fill('input[placeholder="0.00"]', '0.01')

    // Ждем сетевого ответа от Server Action
    await Promise.all([
      page.waitForResponse((response) => response.status() === 200),
      page.click('button:has-text("Подтвердить транзакцию")'),
    ])

    // Проверяем, что модалка закрылась
    await expect(modalTitle).not.toBeVisible()

    // Проверяем обновление списка истории активностей
    const newTxRow = page.locator('text=Отправлено').first()
    await expect(newTxRow).toBeVisible({ timeout: 5000 })

    const amountText = page.locator('text=/0.01/').first()
    await expect(amountText).toBeVisible({ timeout: 5000 })
  })
})
