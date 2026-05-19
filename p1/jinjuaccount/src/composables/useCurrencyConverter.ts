import { ref, onMounted, onUnmounted } from 'vue'
import type { ExchangeRate, CurrencyCode } from '@/types'

const exchangeRates = ref<ExchangeRate>({
  base: 'CNY',
  rates: {
    CNY: 1,
    USD: 0.14,
    JPY: 21.5,
    EUR: 0.13,
    GBP: 0.11,
  },
  lastUpdated: new Date().toISOString(),
})

let updateInterval: number | null = null

export function useCurrencyConverter() {
  const currencies: CurrencyCode[] = ['CNY', 'USD', 'JPY', 'EUR', 'GBP']

  const currencySymbols: Record<CurrencyCode, string> = {
    CNY: '¥',
    USD: '$',
    JPY: '¥',
    EUR: '€',
    GBP: '£',
  }

  function convert(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    const inBase = amount / exchangeRates.value.rates[from]
    return inBase * exchangeRates.value.rates[to]
  }

  function toBaseCurrency(amount: number, from: CurrencyCode): number {
    return convert(amount, from, exchangeRates.value.base as CurrencyCode)
  }

  function formatCurrency(amount: number, currency: CurrencyCode = 'CNY'): string {
    const symbol = currencySymbols[currency]
    return `${symbol}${amount.toFixed(2)}`
  }

  function updateExchangeRates() {
    const variation = () => 1 + (Math.random() - 0.5) * 0.02
    exchangeRates.value.rates = {
      CNY: 1,
      USD: exchangeRates.value.rates.USD * variation(),
      JPY: exchangeRates.value.rates.JPY * variation(),
      EUR: exchangeRates.value.rates.EUR * variation(),
      GBP: exchangeRates.value.rates.GBP * variation(),
    }
    exchangeRates.value.lastUpdated = new Date().toISOString()
  }

  function startAutoUpdate() {
    if (updateInterval === null) {
      updateInterval = window.setInterval(updateExchangeRates, 60000)
    }
  }

  function stopAutoUpdate() {
    if (updateInterval !== null) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }

  onMounted(() => {
    startAutoUpdate()
  })

  onUnmounted(() => {
    stopAutoUpdate()
  })

  return {
    exchangeRates,
    currencies,
    currencySymbols,
    convert,
    toBaseCurrency,
    formatCurrency,
    updateExchangeRates,
  }
}
