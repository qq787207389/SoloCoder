import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Note, KnowledgeGraph, GraphNode, GraphEdge } from '@/types'
import { noteDB } from '@/utils/db'
import { buildNoteIndex, searchNotes, addNoteToIndex, updateNoteInIndex } from '@/utils/search'

export const useNoteStore = defineStore('note', () => {
  const notes = ref<Note[]>([])
  const loading = ref(false)
  const currentNote = ref<Note | null>(null)

  async function loadNotes() {
    loading.value = true
    try {
      notes.value = await noteDB.getAll()
      buildNoteIndex(notes.value)
    } finally {
      loading.value = false
    }
  }

  async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) {
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const noteToSave = JSON.parse(JSON.stringify(newNote))
    await noteDB.add(noteToSave)
    notes.value.push(newNote)
    addNoteToIndex(newNote)
    return newNote
  }

  async function updateNote(note: Note) {
    const index = notes.value.findIndex(n => n.id === note.id)
    if (index !== -1) {
      note.updatedAt = Date.now()
      notes.value[index] = note
      const noteToSave = JSON.parse(JSON.stringify(note))
      await noteDB.update(noteToSave)
      updateNoteInIndex(note)
    }
  }

  async function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    await noteDB.delete(id)
  }

  function getNotesByBookId(bookId: string) {
    return notes.value.filter(n => n.bookId === bookId)
  }

  function search(query: string): Note[] {
    const ids = searchNotes(query)
    return ids.map(id => notes.value.find(n => n.id === id)!).filter(Boolean)
  }

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    notes.value.forEach(note => note.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet)
  })

  function generateKnowledgeGraph(books: { id: string; title: string; author: string; tags: string[] }[]): KnowledgeGraph {
    const nodes: GraphNode[] = []
    const edges: GraphEdge[] = []
    const nodeIds = new Set<string>()

    books.forEach(book => {
      if (!nodeIds.has(book.id)) {
        nodes.push({ id: book.id, label: book.title, type: 'book' })
        nodeIds.add(book.id)
      }

      const authorId = `author-${book.author}`
      if (!nodeIds.has(authorId)) {
        nodes.push({ id: authorId, label: book.author, type: 'author' })
        nodeIds.add(authorId)
      }
      edges.push({ source: book.id, target: authorId, type: 'written-by' })

      book.tags.forEach(tag => {
        const tagId = `tag-${tag}`
        if (!nodeIds.has(tagId)) {
          nodes.push({ id: tagId, label: tag, type: 'tag' })
          nodeIds.add(tagId)
        }
        edges.push({ source: book.id, target: tagId, type: 'tagged-with' })
      })
    })

    notes.value.forEach(note => {
      const noteId = `note-${note.id}`
      if (!nodeIds.has(noteId)) {
        nodes.push({ id: noteId, label: note.title, type: 'note' })
        nodeIds.add(noteId)
      }

      if (note.bookId) {
        edges.push({ source: noteId, target: note.bookId, type: 'about' })
      }

      note.tags.forEach(tag => {
        const tagId = `tag-${tag}`
        if (!nodeIds.has(tagId)) {
          nodes.push({ id: tagId, label: tag, type: 'tag' })
          nodeIds.add(tagId)
        }
        edges.push({ source: noteId, target: tagId, type: 'tagged-with' })
      })

      note.references.forEach(refId => {
        if (nodeIds.has(refId)) {
          edges.push({ source: noteId, target: refId, type: 'references' })
        }
      })
    })

    return { nodes, edges }
  }

  function setCurrentNote(note: Note | null) {
    currentNote.value = note
  }

  return {
    notes,
    loading,
    currentNote,
    allTags,
    loadNotes,
    addNote,
    updateNote,
    deleteNote,
    getNotesByBookId,
    search,
    generateKnowledgeGraph,
    setCurrentNote
  }
})
