import { ref } from 'vue'
import type { Notification } from '@/types'

export function useNotification() {
  const notifications = ref<Notification[]>([])
  const permission = ref<NotificationPermission>('default')

  async function requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false
    }
    permission.value = await Notification.requestPermission()
    return permission.value === 'granted'
  }

  function showBrowserNotification(title: string, body: string, data?: any) {
    if (permission.value !== 'granted') return
    
    const notification = new Notification(title, {
      body,
      icon: '/vite.svg',
      data
    })

    notification.onclick = () => {
      window.focus()
      if (data?.url) {
        window.location.href = data.url
      }
    }
  }

  function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(36),
      createdAt: new Date()
    }
    notifications.value.unshift(newNotification)
    
    showBrowserNotification(
      '画板集 Pro',
      notification.content
    )
  }

  function markAsRead(id: string) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => n.read = true)
  }

  function clearNotifications() {
    notifications.value = []
  }

  const unreadCount = () => notifications.value.filter(n => !n.read).length

  return {
    notifications,
    permission,
    requestPermission,
    showBrowserNotification,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    unreadCount
  }
}
