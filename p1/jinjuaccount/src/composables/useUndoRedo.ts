import type { HistoryState } from '@/types'

export function useUndoRedo<T>() {
  function createHistory(initial: T): HistoryState<T> {
    return {
      past: [],
      present: initial,
      future: [],
    }
  }

  function executeAction(history: HistoryState<T>, newState: T, maxHistory = 50): HistoryState<T> {
    const newPast = [...history.past, history.present]
    if (newPast.length > maxHistory) {
      newPast.shift()
    }
    return {
      past: newPast,
      present: newState,
      future: [],
    }
  }

  function undo(history: HistoryState<T>): HistoryState<T> {
    if (history.past.length === 0) return history

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, -1)

    return {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    }
  }

  function redo(history: HistoryState<T>): HistoryState<T> {
    if (history.future.length === 0) return history

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    return {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    }
  }

  return {
    createHistory,
    executeAction,
    undo,
    redo,
  }
}
