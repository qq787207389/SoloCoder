<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookStore } from '@/stores/book'
import { useNoteStore } from '@/stores/note'
import { answerQuestion, recommendBooks } from '@/utils/ai'
import type { Note } from '@/types'

const route = useRoute()
const router = useRouter()
const bookStore = useBookStore()
const noteStore = useNoteStore()

const book = computed(() => bookStore.getBookById(route.params.id as string))
const bookNotes = computed(() => noteStore.notes.filter(n => n.bookId === book.value?.id))
const similarBooks = computed(() => {
  if (!book.value) return []
  return recommendBooks(book.value, bookStore.books, 4)
})

const question = ref('')
const answer = ref('')
const loadingAnswer = ref(false)
const showAddNoteModal = ref(false)

const newNote = ref<Partial<Note>>({
  title: '',
  content: '',
  tags: []
})
const newNoteTag = ref('')

async function handleAskQuestion() {
  if (!question.value.trim() || !book.value) return
  loadingAnswer.value = true
  try {
    answer.value = await answerQuestion(question.value, book.value.description)
  } finally {
    loadingAnswer.value = false
  }
}

function addNoteTag() {
  if (newNoteTag.value.trim() && !newNote.value.tags?.includes(newNoteTag.value.trim())) {
    newNote.value.tags?.push(newNoteTag.value.trim())
    newNoteTag.value = ''
  }
}

function removeNoteTag(tag: string) {
  newNote.value.tags = newNote.value.tags?.filter(t => t !== tag)
}

async function handleAddNote() {
  if (!newNote.value.title?.trim() || !book.value) return
  await noteStore.addNote({
    title: newNote.value.title,
    content: newNote.value.content || '',
    tags: newNote.value.tags || [],
    bookId: book.value.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    references: []
  })
  showAddNoteModal.value = false
  newNote.value = { title: '', content: '', tags: [] }
}

async function updateStatus(status: 'want' | 'reading' | 'finished') {
  if (!book.value) return
  await bookStore.updateBook({ ...book.value, readStatus: status })
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="book-detail-view" v-if="book">
    <button class="btn btn-outline mb-4" @click="goBack">← 返回</button>

    <div class="grid grid-cols-2 gap-6">
      <div class="card">
        <div class="book-detail-cover">
          <span class="text-6xl">📕</span>
        </div>
        <h1 class="book-title mt-4 mb-2">{{ book.title }}</h1>
        <p class="text-muted mb-4">{{ book.author }}</p>
        
        <div class="mb-4">
          <span class="text-sm">阅读状态：</span>
          <div class="flex gap-2 mt-2">
            <button 
              class="btn btn-sm" 
              :class="book.readStatus === 'want' ? 'btn-warning' : 'btn-outline'"
              @click="updateStatus('want')"
            >想读</button>
            <button 
              class="btn btn-sm" 
              :class="book.readStatus === 'reading' ? 'btn-primary' : 'btn-outline'"
              @click="updateStatus('reading')"
            >在读</button>
            <button 
              class="btn btn-sm" 
              :class="book.readStatus === 'finished' ? 'btn-success' : 'btn-outline'"
              @click="updateStatus('finished')"
            >已读</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="tag in book.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div v-if="book.description" class="book-description">
          <h3 class="mb-2">简介</h3>
          <p class="text-sm text-muted">{{ book.description }}</p>
        </div>
      </div>

      <div class="card">
        <h3 class="mb-4">🤖 AI 问答</h3>
        <div class="mb-4">
          <input 
            v-model="question" 
            type="text" 
            class="input mb-2" 
            placeholder="关于这本书有什么问题？"
            @keyup.enter="handleAskQuestion"
          />
          <button 
            class="btn btn-primary w-full" 
            @click="handleAskQuestion"
            :disabled="loadingAnswer"
          >
            {{ loadingAnswer ? '思考中...' : '提问' }}
          </button>
        </div>
        <div v-if="answer" class="ai-answer">
          <p class="text-sm whitespace-pre-line">{{ answer }}</p>
        </div>
      </div>
    </div>

    <div class="card mt-6">
      <div class="flex justify-between items-center mb-4">
        <h3>📝 相关笔记 ({{ bookNotes.length }})</h3>
        <button class="btn btn-primary" @click="showAddNoteModal = true">+ 添加笔记</button>
      </div>
      <div v-if="bookNotes.length" class="notes-list">
        <div v-for="note in bookNotes" :key="note.id" class="note-item card mb-3">
          <h4 class="font-medium">{{ note.title }}</h4>
          <p class="text-sm text-muted mt-1 line-clamp-2">{{ note.content }}</p>
          <div class="flex gap-2 mt-2">
            <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
      <p v-else class="text-muted">暂无相关笔记</p>
    </div>

    <div v-if="similarBooks.length" class="card mt-6">
      <h3 class="mb-4">✨ 相似书籍</h3>
      <div class="grid grid-cols-4 gap-4">
        <div v-for="similar in similarBooks" :key="similar.id" class="similar-book text-center">
          <div class="text-4xl mb-2">📘</div>
          <div class="text-sm font-medium">{{ similar.title }}</div>
          <div class="text-xs text-muted">{{ similar.author }}</div>
        </div>
      </div>
    </div>

    <div v-if="showAddNoteModal" class="modal-overlay" @click.self="showAddNoteModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">添加笔记</h2>
          <button class="modal-close" @click="showAddNoteModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-4">
            <label class="block mb-2">标题</label>
            <input v-model="newNote.title" type="text" class="input" placeholder="输入笔记标题" />
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">内容</label>
            <textarea v-model="newNote.content" class="input textarea" rows="6" placeholder="输入笔记内容"></textarea>
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">标签</label>
            <div class="flex gap-2 mb-2">
              <input v-model="newNoteTag" type="text" class="input" placeholder="添加标签" @keyup.enter="addNoteTag" />
              <button class="btn btn-outline" @click="addNoteTag">添加</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in newNote.tags" :key="tag" class="tag">
                {{ tag }}
                <span class="tag-remove" @click="removeNoteTag(tag)">&times;</span>
              </span>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn btn-outline" @click="showAddNoteModal = false">取消</button>
            <button class="btn btn-primary" @click="handleAddNote">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-detail-cover {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-title {
  font-size: 24px;
}

.book-description {
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
}

.ai-answer {
  padding: 16px;
  background: #dbeafe;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.note-item {
  padding: 16px;
  background: var(--bg-light);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.similar-book {
  padding: 16px;
  background: var(--bg-light);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.similar-book:hover {
  background: #e2e8f0;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}
</style>
