<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookStore } from '@/stores/book'
import { useRouter } from 'vue-router'
import type { Book } from '@/types'

const router = useRouter()
const bookStore = useBookStore()

const searchQuery = ref('')
const showAddModal = ref(false)
const filterStatus = ref<string>('all')

const newBook = ref({
  title: '',
  author: '',
  description: '',
  tags: [] as string[],
  readStatus: 'want' as Book['readStatus'],
  isbn: '',
  pages: 0
})
const newTag = ref('')

const filteredBooks = computed(() => {
  let result = bookStore.books
  
  if (searchQuery.value) {
    result = bookStore.search(searchQuery.value)
  }
  
  if (filterStatus.value !== 'all') {
    result = result.filter(b => b.readStatus === filterStatus.value)
  }
  
  return result
})

function addTag() {
  if (newTag.value.trim() && !newBook.value.tags.includes(newTag.value.trim())) {
    newBook.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function removeTag(tag: string) {
  newBook.value.tags = newBook.value.tags.filter(t => t !== tag)
}

async function handleAddBook() {
  if (!newBook.value.title.trim()) return
  await bookStore.addBook(newBook.value)
  showAddModal.value = false
  newBook.value = {
    title: '',
    author: '',
    description: '',
    tags: [],
    readStatus: 'want',
    isbn: '',
    pages: 0
  }
}

function getStatusBadge(status: Book['readStatus']) {
  const badges = {
    want: { class: 'badge-warning', text: '想读' },
    reading: { class: 'badge-primary', text: '在读' },
    finished: { class: 'badge-success', text: '已读' }
  }
  return badges[status]
}

function goToDetail(book: Book) {
  router.push(`/books/${book.id}`)
}
</script>

<template>
  <div class="books-view">
    <div class="flex justify-between items-center mb-6">
      <h1>📖 我的书籍</h1>
      <button class="btn btn-primary" @click="showAddModal = true">+ 添加书籍</button>
    </div>

    <div class="flex gap-4 mb-6">
      <input 
        v-model="searchQuery" 
        type="text" 
        class="input" 
        placeholder="搜索书籍..."
        style="flex: 1"
      />
      <select v-model="filterStatus" class="input" style="width: 120px">
        <option value="all">全部</option>
        <option value="want">想读</option>
        <option value="reading">在读</option>
        <option value="finished">已读</option>
      </select>
    </div>

    <div class="books-grid">
      <div 
        v-for="book in filteredBooks" 
        :key="book.id" 
        class="book-card card"
        @click="goToDetail(book)"
      >
        <div class="book-cover">
          <span class="book-emoji">📕</span>
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author text-sm text-muted">{{ book.author }}</p>
          <div class="flex justify-between items-center mt-2">
            <span :class="['badge', getStatusBadge(book.readStatus).class]">
              {{ getStatusBadge(book.readStatus).text }}
            </span>
            <span class="text-sm text-muted">{{ book.tags.length }} 标签</span>
          </div>
          <div class="tags-container mt-2">
            <span v-for="tag in book.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>

      <div v-if="!filteredBooks.length" class="empty-state card text-center">
        <div class="text-4xl mb-2">📚</div>
        <p class="text-muted">暂无书籍，点击上方按钮添加第一本</p>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">添加书籍</h2>
          <button class="modal-close" @click="showAddModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-4">
            <label class="block mb-2">书名 *</label>
            <input v-model="newBook.title" type="text" class="input" placeholder="输入书名" />
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">作者</label>
            <input v-model="newBook.author" type="text" class="input" placeholder="输入作者" />
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">ISBN</label>
            <input v-model="newBook.isbn" type="text" class="input" placeholder="输入ISBN" />
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">页数</label>
            <input v-model.number="newBook.pages" type="number" class="input" placeholder="输入页数" />
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">阅读状态</label>
            <select v-model="newBook.readStatus" class="input">
              <option value="want">想读</option>
              <option value="reading">在读</option>
              <option value="finished">已读</option>
            </select>
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">简介</label>
            <textarea v-model="newBook.description" class="input textarea" rows="4"></textarea>
          </div>
          <div class="form-group mb-4">
            <label class="block mb-2">标签</label>
            <div class="flex gap-2 mb-2">
              <input v-model="newTag" type="text" class="input" placeholder="添加标签" @keyup.enter="addTag" />
              <button class="btn btn-outline" @click="addTag">添加</button>
            </div>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in newBook.tags" :key="tag" class="tag">
                {{ tag }}
                <span class="tag-remove" @click="removeTag(tag)">&times;</span>
              </span>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-6">
            <button class="btn btn-outline" @click="showAddModal = false">取消</button>
            <button class="btn btn-primary" @click="handleAddBook">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.book-cover {
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.book-emoji {
  font-size: 48px;
}

.book-title {
  font-size: 16px;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 48px;
}
</style>
