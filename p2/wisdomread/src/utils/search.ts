import lunr from 'lunr'
import { Book, Note } from '@/types'

let bookIndex: lunr.Index | null = null
let noteIndex: lunr.Index | null = null

export function buildBookIndex(books: Book[]) {
  bookIndex = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('author')
    this.field('description')
    this.field('tags')

    books.forEach(book => {
      this.add({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        tags: book.tags.join(' ')
      })
    })
  })
  return bookIndex
}

export function buildNoteIndex(notes: Note[]) {
  noteIndex = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('content')
    this.field('tags')

    notes.forEach(note => {
      this.add({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags.join(' ')
      })
    })
  })
  return noteIndex
}

export function searchBooks(query: string): string[] {
  if (!bookIndex) return []
  return bookIndex.search(query).map(result => result.ref)
}

export function searchNotes(query: string): string[] {
  if (!noteIndex) return []
  return noteIndex.search(query).map(result => result.ref)
}

export function addBookToIndex(book: Book) {
  if (!bookIndex) return
  bookIndex.add({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    tags: book.tags.join(' ')
  })
}

export function addNoteToIndex(note: Note) {
  if (!noteIndex) return
  noteIndex.add({
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags.join(' ')
  })
}

export function updateBookInIndex(book: Book) {
  if (!bookIndex) return
  bookIndex.update({
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    tags: book.tags.join(' ')
  })
}

export function updateNoteInIndex(note: Note) {
  if (!noteIndex) return
  noteIndex.update({
    id: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags.join(' ')
  })
}
