<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCardStore } from '@/stores/card'
import { useBoardStore } from '@/stores/board'
import { useCommentStore } from '@/stores/comment'
import { useUserStore } from '@/stores/user'
import { Heart, Share2, Download, MessageCircle, Send, ArrowLeft, ExternalLink } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const cardStore = useCardStore()
const boardStore = useBoardStore()
const commentStore = useCommentStore()
const userStore = useUserStore()

const cardId = computed(() => route.params.id as string)
const card = computed(() => cardStore.getCardById(cardId.value))
const board = computed(() => boardStore.getBoardById(card.value?.boardId || ''))
const owner = computed(() => userStore.getUserById(board.value?.ownerId || ''))
const comments = computed(() => commentStore.getCommentsByCard(cardId.value))

const newComment = ref('')
const isLiked = ref(false)
const showShareMenu = ref(false)

function toggleLike() {
  if (!userStore.currentUser) return
  isLiked.value = !isLiked.value
  cardStore.toggleLike(cardId.value, userStore.currentUser.id)
}

function submitComment() {
  if (!newComment.value.trim() || !userStore.currentUser) return
  
  commentStore.createComment(
    cardId.value,
    userStore.currentUser.id,
    newComment.value
  )
  newComment.value = ''
}

function goBack() {
  router.back()
}

function getMentionedUser(username: string) {
  return Array.from(userStore.users.values()).find(
    u => u.username.toLowerCase().includes(username.toLowerCase())
  )
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <button
          @click="goBack"
          class="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>返回</span>
        </button>
      </div>
    </div>

    <div v-if="card" class="max-w-7xl mx-auto px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            <img
              :src="card.imageUrl"
              :alt="card.title"
              class="w-full object-contain bg-gray-100 dark:bg-gray-900"
            />
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <button
                  @click="toggleLike"
                  class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
                  :class="isLiked ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
                >
                  <Heart class="w-5 h-5" :class="isLiked ? 'fill-current' : ''" />
                  <span>{{ card.likes.length }}</span>
                </button>
                <button class="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Share2 class="w-5 h-5" />
                  <span>分享</span>
                </button>
                <button class="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Download class="w-5 h-5" />
                  <span>下载</span>
                </button>
              </div>
            </div>

            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ card.title }}</h1>
            <p class="text-gray-600 dark:text-gray-400 mb-4">{{ card.description }}</p>

            <div class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="tag in card.tags"
                :key="tag"
                class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                #{{ tag }}
              </span>
            </div>

            <div v-if="card.sourceUrl" class="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <ExternalLink class="w-4 h-4" />
              <a :href="card.sourceUrl" target="_blank" class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                {{ card.sourceUrl }}
              </a>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div v-if="board" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">所属画板</h3>
            <div class="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" @click="$router.push(`/board/${board.id}`)">
              <img
                :src="board.cover"
                :alt="board.title"
                class="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 class="font-medium text-gray-900 dark:text-white">{{ board.title }}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ board.cardIds.length }} 张图片</p>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              评论 ({{ comments.length }})
            </h3>

            <div class="flex items-start space-x-3 mb-6">
              <img
                :src="userStore.currentUser?.avatar"
                :alt="userStore.currentUser?.username"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <textarea
                  v-model="newComment"
                  placeholder="写下你的评论... @用户名可以提及用户"
                  rows="3"
                  class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div class="flex justify-end mt-3">
                  <button
                    @click="submitComment"
                    :disabled="!newComment.trim()"
                    class="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <Send class="w-4 h-4" />
                    <span>发送</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-4 max-h-96 overflow-y-auto">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="flex space-x-3"
              >
                <img
                  :src="userStore.getUserById(comment.userId)?.avatar"
                  :alt="userStore.getUserById(comment.userId)?.username"
                  class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div class="flex-1">
                  <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-medium text-gray-900 dark:text-white">
                        {{ userStore.getUserById(comment.userId)?.username }}
                      </span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">
                        {{ new Date(comment.createdAt).toLocaleDateString('zh-CN') }}
                      </span>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300 text-sm">{{ comment.content }}</p>
                  </div>

                  <div v-if="comment.replies.length > 0" class="mt-3 ml-4 space-y-3">
                    <div
                      v-for="replyId in comment.replies"
                      :key="replyId"
                      class="flex space-x-3"
                    >
                      <img
                        :src="userStore.getUserById(commentStore.getCommentById(replyId)?.userId || '')?.avatar"
                        class="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <div class="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span class="font-medium text-sm text-gray-900 dark:text-white">
                          {{ userStore.getUserById(commentStore.getCommentById(replyId)?.userId || '')?.username }}
                        </span>
                        <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">
                          {{ commentStore.getCommentById(replyId)?.content }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
