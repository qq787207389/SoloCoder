export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  tags: string[];
  dueDate: string | null;
  priority: Priority;
  createdAt: string;
}

export interface List {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  listIds: string[];
}

export interface AppState {
  boards: Record<string, Board>;
  lists: Record<string, List>;
  cards: Record<string, Card>;
  tags: Record<string, Tag>;
  activeBoardId: string | null;
  searchQuery: string;
  filterTags: string[];
  filterPriority: Priority | null;
  sortBy: 'dueDate' | 'priority' | null;
}

export interface AppActions {
  setActiveBoard: (boardId: string) => void;
  addBoard: (title: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  deleteBoard: (boardId: string) => void;
  
  addList: (boardId: string, title: string) => void;
  renameList: (listId: string, title: string) => void;
  deleteList: (listId: string) => void;
  
  addCard: (listId: string, card: Omit<Card, 'id' | 'createdAt'>) => void;
  updateCard: (cardId: string, card: Partial<Card>) => void;
  deleteCard: (cardId: string) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string, index: number) => void;
  reorderCardsInList: (listId: string, oldIndex: number, newIndex: number) => void;
  
  addTag: (name: string, color: string) => void;
  deleteTag: (tagId: string) => void;
  
  setSearchQuery: (query: string) => void;
  setFilterTags: (tags: string[]) => void;
  setFilterPriority: (priority: Priority | null) => void;
  setSortBy: (sortBy: 'dueDate' | 'priority' | null) => void;
  
  exportData: () => void;
  importData: (data: AppState) => void;
}
