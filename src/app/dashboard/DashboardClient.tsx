'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  ArrowDownLeft,
  X,
  QrCode,
  Copy,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Send,
  ArrowDown,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

import { createTransaction } from './actions'

// Структура транзакции
interface Transaction {
  id: number
  userId: number
  amount: string
  tokenSymbol: string
  network: string
  type: string
  txHash: string | null
  status: string | null
  createdAt: Date | null
  created_at?: string
}

// Цвета для диаграммы
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function DashboardClient({
  initialTransactions,
  currentBalance,
  weeklyChartData,
  tonBalance,
}: {
  initialTransactions: Transaction[]
  currentBalance: number
  weeklyChartData: { name: string; income: number }[]
  tonBalance: number
}) {
  const [activeModal, setActiveModal] = useState<'send' | 'receive' | null>(
    null,
  )
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const closeModal = () => {
    setActiveModal(null)
    setAmount('')
    setRecipient('')
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !recipient) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Введите корректную сумму')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createTransaction({
        amount: amount,
        tokenSymbol: 'TON',
        network: 'TON Network',
        type: 'SEND',
      })

      if (result.success) {
        closeModal()
        // Обновляем страницу для отображения новой транзакции
        window.location.reload()
      } else {
        alert(result.error || 'Ошибка при отправке транзакции')
      }
    } catch (error) {
      alert('Произошла ошибка при отправке')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyAddress = () => {
    const address = 'UQBl3M7sAx_99zX_dK91v9Z2pX'
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Обработка данных для диаграммы
  const tokenPieData = Object.values(
    initialTransactions.reduce(
      (acc: Record<string, { name: string; value: number }>, tx) => {
        const token = tx.tokenSymbol || 'UNKNOWN'
        const amount = parseFloat(tx.amount) || 0

        if (!acc[token]) {
          acc[token] = { name: token, value: 0 }
        }
        acc[token].value += amount
        return acc
      },
      {},
    ),
  )

  // Округление сумм
  tokenPieData.forEach((item) => {
    item.value = Math.round(item.value * 100) / 100
  })

  // Фильтруем транзакции для отображения (показываем только последние 20)
  const displayTransactions = initialTransactions.slice(0, 20)

  // Форматирование даты
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (!(d instanceof Date) || isNaN(d.getTime())) return ''
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Сокращение хэша
  const shortenHash = (hash: string | null) => {
    if (!hash) return ''
    return hash.length > 10 ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : hash
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* ВЕРХНЯЯ ПАНЕЛЬ */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              TON Mainnet
            </span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white text-xs sm:text-sm"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Подключить кошелек
            </Button>
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-fuchsia-500 p-0.5">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                M
              </div>
            </div>
          </div>
        </div>

        {/* ОСНОВНАЯ СЕТКА */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* КАРТОЧКА БАЛАНСА */}
          <Card className="p-5 sm:p-6 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 border-none text-white flex flex-col justify-between shadow-[0_0_30px_rgba(139,92,246,0.3)] relative overflow-hidden group h-48 sm:h-52 lg:h-auto">
            <div className="absolute -right-10 -top-10 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/5 rounded-full blur-xl" />

            <div className="space-y-2 relative z-10">
              <p className="text-xs text-indigo-100 font-medium tracking-wide uppercase">
                Доступный баланс
              </p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                $
                {currentBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h2>
              <p className="text-[11px] text-indigo-150 font-medium opacity-90">
                ≈{' '}
                {tonBalance.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                TON
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              <Button
                onClick={() => setActiveModal('send')}
                className="w-full bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md text-white border border-white/10 gap-2 h-10 rounded-xl transition-all text-sm font-semibold active:scale-95"
              >
                <Send className="w-4 h-4" /> Отправить
              </Button>
              <Button
                onClick={() => setActiveModal('receive')}
                className="w-full bg-slate-950/40 hover:bg-slate-950/60 backdrop-blur-md text-white border border-white/10 gap-2 h-10 rounded-xl transition-all text-sm font-semibold active:scale-95"
              >
                <ArrowDown className="w-4 h-4" /> Получить
              </Button>
            </div>
          </Card>

          {/* ГРАФИК */}
          <div className="lg:col-span-2 flex flex-col h-48 sm:h-52 lg:h-auto">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-fuchsia-500" /> Аналитика
              </h3>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.4%
              </span>
            </div>
            <Card className="p-2 sm:p-3 flex-1 bg-slate-900/50 border-slate-800 backdrop-blur-md w-full min-h-0">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart
                  data={weeklyChartData}
                  margin={{ top: 5, right: 5, left: -35, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorIncome"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22d3ee"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#22d3ee"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={isMobile ? 7 : 9}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={isMobile ? 7 : 9}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      padding: '8px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* НИЖНЯЯ СЕКЦИЯ: ТРАНЗАКЦИИ И АНАЛИТИКА */}
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Статистика кошелька и активности
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ТРАНЗАКЦИИ */}
            <div className="lg:col-span-2 space-y-3 max-h-125 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {displayTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-900/20 border border-slate-900 rounded-xl">
                  <p className="mb-2">Транзакции не найдены</p>
                  <p className="text-xs text-slate-600">
                    Начните отправлять или получать токены
                  </p>
                </div>
              ) : (
                displayTransactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.5) }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 rounded-xl transition-all cursor-pointer group gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border shrink-0 ${
                          tx.type === 'RECEIVE'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : tx.type === 'SEND'
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : 'bg-slate-800/50 border-slate-700/50 text-slate-300'
                        }`}
                      >
                        {tx.type === 'RECEIVE' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : tx.type === 'SEND' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <Activity className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight capitalize">
                          {tx.type === 'RECEIVE'
                            ? 'Получено'
                            : tx.type === 'SEND'
                              ? 'Отправлено'
                              : tx.type || 'Транзакция'}
                        </p>
                        <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-1">
                          <span>
                            {formatDate(tx.createdAt || tx.created_at)}
                          </span>
                          {tx.txHash && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span className="font-mono text-[10px] text-slate-600 group-hover:text-slate-400 transition-colors truncate max-w-30 sm:max-w-none">
                                {shortenHash(tx.txHash)}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto">
                      <p
                        className={`text-sm font-black tracking-tight ${
                          tx.type === 'RECEIVE'
                            ? 'text-emerald-400'
                            : tx.type === 'SEND'
                              ? 'text-rose-400'
                              : 'text-slate-200'
                        }`}
                      >
                        {tx.type === 'RECEIVE'
                          ? '+'
                          : tx.type === 'SEND'
                            ? '-'
                            : ''}
                        {tx.amount} {tx.tokenSymbol}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        {tx.status === 'SUCCESS' ? (
                          <span className="text-[10px] font-bold text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap">
                            <CheckCircle2 className="w-2.5 h-2.5" /> OK
                          </span>
                        ) : tx.status === 'PENDING' ? (
                          <span className="text-[10px] font-bold text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap">
                            <Activity className="w-2.5 h-2.5 animate-spin" /> В
                            ожидании
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5 whitespace-nowrap">
                            <AlertCircle className="w-2.5 h-2.5" /> Ошибка
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* ДИАГРАММА */}
            <Card className="p-4 bg-slate-900/40 border-slate-900 backdrop-blur-md flex flex-col items-center justify-center min-h-75">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 text-center">
                Активы в портфеле
              </p>

              {tokenPieData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">
                    Нет данных для отображения
                  </p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col justify-between">
                  <div className="w-full h-52 sm:h-60 relative">
                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <PieChart>
                        <Pie
                          data={tokenPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 60 : 85}
                          paddingAngle={4}
                          dataKey="value"
                          label={isMobile ? false : true}
                          labelLine={false}
                        >
                          {tokenPieData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                          formatter={(value) => [`${value} отб. ед.`, 'Объем']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Легенда */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/60 mt-3">
                    {tokenPieData.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 px-2 py-1.5 bg-slate-950/30 rounded-lg"
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div className="min-w-0 flex-1 flex justify-between items-center gap-1">
                          <span className="text-xs font-bold text-slate-300 truncate">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {Math.round(item.value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* МОДАЛЬНЫЕ ОКНА */}
        <AnimatePresence>
          {activeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              >
                <Button
                  onClick={closeModal}
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-4 rounded-full bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Модалка: Отправить */}
                {activeModal === 'send' && (
                  <form
                    onSubmit={handleSend}
                    className="space-y-4"
                  >
                    <h3 className="text-2xl font-bold">Отправить активы</h3>
                    <p className="text-sm text-slate-400">
                      Убедитесь, что адрес получателя корректен
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-slate-400 block mb-1.5 font-medium">
                          Адрес получателя
                        </label>
                        <input
                          type="text"
                          placeholder="Введите адрес TON"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-400 block mb-1.5 font-medium">
                          Сумма (TON)
                        </label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          required
                          step="0.01"
                          min="0.01"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Комиссия сети</span>
                          <span className="text-cyan-400">~0.01 TON</span>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Activity className="w-4 h-4 animate-spin" />
                            Отправка...
                          </span>
                        ) : (
                          'Подтвердить транзакцию'
                        )}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Модалка: Получить */}
                {activeModal === 'receive' && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">Получить средства</h3>
                    <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20">
                      <p className="text-sm text-yellow-400 font-medium flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <span>
                          Принимайте только токены в сети TON Network. Перевод
                          других валют приведет к их безвозвратной потере.
                        </span>
                      </p>
                    </div>
                    <div className="bg-slate-800 rounded-xl p-6 text-center space-y-4">
                      <div className="w-32 h-32 mx-auto bg-linear-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <QrCode className="w-16 h-16 text-white" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-medium">
                          Ваш адрес для получения
                        </p>
                        <div className="bg-slate-950/50 p-3 rounded-xl">
                          <p className="text-sm font-mono text-cyan-400 break-all">
                            UQBl3M7sAx_99zX_dK91v9Z2pX
                          </p>
                        </div>
                        <Button
                          onClick={handleCopyAddress}
                          variant="ghost"
                          className="text-slate-400 hover:text-white gap-2 transition-colors"
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />{' '}
                              Скопировано!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Копировать адрес
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
