<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNoteStore } from '@/stores/note'
import { marked } from 'marked'
import type { Note } from '@/types'

const noteStore = useNoteStore()

const searchQuery = ref('')
const currentNote = ref<Note | null>(null)
const showEditor = ref(false)
const editTag = ref('')

const filteredNotes = computed(() => {
  if (!searchQuery.value) return noteStore.notes
  return noteStore.search(searchQuery.value)
})

const previewContent = computed(() => {
  if (!currentNote.value) return ''
  return marked.parse(currentNote.value.content) as string
})

function selectNote(note: Note) {
  currentNote.value = note
  showEditor.value = true
}

async function saveNote() {
  if (!currentNote.value) return
  await noteStore.updateNote(currentNote.value)
}

function createNewNote() {
  currentNote.value = {
    id: '',
    title: '新建笔记',
    content: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    references: []
  }
  showEditor.value = true
}

function addTag() {
  if (!editTag.value.trim() || !currentNote.value) return
  if (!currentNote.value.tags.includes(editTag.value.trim())) {
    currentNote.value.tags.push(editTag.value.trim())
  }
  editTag.value = ''
}

function removeTag(tag: string) {
  if (!currentNote.value) return
  currentNote.value.tags = currentNote.value.tags.filter(t => t !== tag)
}

async function handleSave() {
  if (!currentNote.value) return
  if (!currentNote.value.id) {
    await noteStore.addNote(currentNote.value)
  } else {
    await saveNote()
  }
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="notes-view">
    <div class="flex justify-between items-center mb-6">
      <h1>📝 我的笔记</h1>
      <button class="btn btn-primary" @click="createNewNote">+ 新建笔记</button>
    </div>

    <div class="notes-layout">
      <div class="notes-sidebar">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="input mb-4" 
          placeholder="搜索笔记..."
        />
        <div class="notes-list">
          <div 
            v-for="note in filteredNotes" 
            :key="note.id"
            class="note-item card"
            :class="{ active: currentNote?.id === note.id }"
            @click="selectNote(note)"
          >
            <h4 class="font-medium">{{ note.title }}</h4>
            <p class="text-xs text-muted mt-1">{{ formatDate(note.updatedAt) }}</p>
            <div class="flex flex-wrap gap-1 mt-2">
              <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
          <div v-if="!filteredNotes.length" class="empty-state text-center p-4">
            <div class="text-2xl mb-2">📝</div>
            <p class="text-sm text-muted">暂无笔记</p>
          </div>
        </div>
      </div>

      <div class="notes-main" v-if="showEditor && currentNote">
        <div class="editor-toolbar">
          <input 
            v-model="currentNote.title" 
            type="text" 
            class="note-title-input" 
            placeholder="笔记标题"
          />
          <button class="btn btn-primary" @click="handleSave">保存</button>
        </div>
        
        <div class="editor-container">
          <textarea 
            v-model="currentNote.content" 
            class="editor-textarea"
            placeholder="在这里输入笔记内容，支持 Markdown..."
          ></textarea>
          <div class="preview-panel" v-html="previewContent"></div>
        </div>

        <div class="tags-section mt-4">
          <label class="text-sm font-medium mb-2 block">标签</label>
          <div class="flex gap-2">
            <input 
              v-model="editTag" 
              type="text" 
              class="input" 
              style="width: 200px"
              placeholder="添加标签"
              @keyup.enter="addTag"
            />
            <button class="btn btn-outline" @click="addTag">添加</button>
          </div>
          <div class="flex flex-wrap gap-2 mt-2">
            <span v-for="tag in currentNote.tags" :key="tag" class="tag">
              {{ tag }}
              <span class="tag-remove" @click="removeTag(tag)">&times;</span>
            </span>
          </div>
        </div>
      </div>

      <div class="notes-main empty-editor" v-else>
        <div class="text-center">
          <div class="text-5xl mb-4">✨</div>
          <p class="text-muted">选择一个笔记或创建新笔记</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 180px);
}

.notes-sidebar {
  width: 300px;
  overflow-y: auto;
}

.notes-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-item {
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.note-item:hover,
.note-item.active {
  background: #e2e8f0;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
}

.note-title-input {
  border: none;
  font-size: 20px;
  font-weight: 600;
  outline: none;
  flex: 1;
  background: transparent;
}

.editor-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.editor-textarea,
.preview-panel {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
}

.preview-panel {
  background: #fafafa;
}

.preview-panel :deep(h1) { font-size: 24px; margin: 16px 0 8px; }
.preview-panel :deep(h2) { font-size: 20px; margin: 14px 0 7px; }
.preview-panel :deep(h3) { font-size: 18px; margin: 12px 0 6px; }
.preview-panel :deep(p) { margin: 8px 0; }
.preview-panel :deep(ul),
.preview-panel :deep(ol) { padding-left: 24px; margin: 8px 0; }
.preview-panel :deep(code) { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
.preview-panel :deep(pre) { background: #1e293b; color: #f8fafc; padding: 12px; border-radius: 8px; overflow-x: auto; }
.preview-panel :deep(blockquote) { border-left: 4px solid #3b82f6; padding-left: 12px; color: #64748b; margin: 8px 0; }

.empty-editor {
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 8px;
}
</style>
