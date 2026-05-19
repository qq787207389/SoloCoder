import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { generateId } from '@/utils'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const users = ref<Map<string, User>>(new Map())
  const isLoading = ref(false)

  const isAuthenticated = computed(() => currentUser.value !== null)

  function initMockUsers() {
    const mockUsers: User[] = [
      {
        id: 'user1',
        username: '设计师小明',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer',
        email: 'designer@example.com',
        bio: '热爱设计，收集灵感',
        followers: ['user2', 'user3'],
        following: ['user2'],
        createdAt: new Date('2024-01-01')
      },
      {
        id: 'user2',
        username: '摄影师小红',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=photographer',
        email: 'photo@example.com',
        bio: '用镜头记录世界',
        followers: ['user1'],
        following: ['user1', 'user3'],
        createdAt: new Date('2024-01-15')
      },
      {
        id: 'user3',
        username: '插画师阿花',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=illustrator',
        email: 'art@example.com',
        bio: '画画使我快乐',
        followers: ['user2'],
        following: ['user1'],
        createdAt: new Date('2024-02-01')
      }
    ]

    mockUsers.forEach(user => {
      users.value.set(user.id, user)
    })

    currentUser.value = mockUsers[0]
  }

  async function login(username: string, _password: string): Promise<boolean> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = Array.from(users.value.values()).find(
      u => u.username.toLowerCase() === username.toLowerCase()
    )
    
    if (user) {
      currentUser.value = user
      isLoading.value = false
      return true
    }
    
    isLoading.value = false
    return false
  }

  function logout() {
    currentUser.value = null
  }

  async function register(username: string, email: string, password: string): Promise<boolean> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))

    const newUser: User = {
      id: generateId(),
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      followers: [],
      following: [],
      createdAt: new Date()
    }

    users.value.set(newUser.id, newUser)
    currentUser.value = newUser
    isLoading.value = false
    return true
  }

  function followUser(userId: string) {
    if (!currentUser.value) return
    
    const targetUser = users.value.get(userId)
    if (!targetUser) return

    if (!currentUser.value.following.includes(userId)) {
      currentUser.value.following.push(userId)
      targetUser.followers.push(currentUser.value.id)
    }
  }

  function unfollowUser(userId: string) {
    if (!currentUser.value) return
    
    const targetUser = users.value.get(userId)
    if (!targetUser) return

    currentUser.value.following = currentUser.value.following.filter(id => id !== userId)
    targetUser.followers = targetUser.followers.filter(id => id !== currentUser.value!.id)
  }

  function getUserById(userId: string): User | undefined {
    return users.value.get(userId)
  }

  function searchUsers(query: string): User[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(users.value.values()).filter(
      user => 
        user.username.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    currentUser,
    users,
    isLoading,
    isAuthenticated,
    initMockUsers,
    login,
    logout,
    register,
    followUser,
    unfollowUser,
    getUserById,
    searchUsers
  }
})
