import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('cart')) || [])

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const addToCart = (product, quantity = 1) => {
    const existingItem = items.value.find(item => item.id === product.id && item.type === product.type)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      items.value.push({ ...product, quantity })
    }
    saveToLocalStorage()
  }

  const removeFromCart = (id, type) => {
    const index = items.value.findIndex(item => item.id === id && item.type === type)
    if (index > -1) {
      items.value.splice(index, 1)
    }
    saveToLocalStorage()
  }

  const updateQuantity = (id, type, quantity) => {
    const item = items.value.find(item => item.id === id && item.type === type)
    if (item) {
      item.quantity = quantity
    }
    saveToLocalStorage()
  }

  const clearCart = () => {
    items.value = []
    saveToLocalStorage()
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  return {
    items,
    totalPrice,
    totalCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
})