import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/db/schema'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Телефон обязателен' }, { status: 400 })
    }

    // ЗАПРОС К БАЗЕ ДАННЫХ
    await db
      .insert(users)
      .values({ phone: phone, kycStatus: 'PENDING' })
      .onDuplicateKeyUpdate({ set: { createdAt: new Date() } })

    console.log(
      `[SERVER] УСПЕХ: Телефон ${phone} записан в MySQL внутри Docker!`,
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SMS API Error]:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
