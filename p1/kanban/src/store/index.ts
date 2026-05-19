import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, AppActions, Card, Priority } from '../types';

const generateId = () => Math.random().toString(36).substr(2, 9);

const getSampleData = (): Omit<AppState, 'searchQuery' | 'filterTags' | 'filterPriority' | 'sortBy'> => {
  const tag1 = { id: generateId(), name: '前端', color: '#3B82F6' };
  const tag2 = { id: generateId(), name: '后端', color: '#10B981' };
  const tag3 = { id: generateId(), name: '设计', color: '#F59E0B' };
  const tag4 = { id: generateId(), name: '紧急', color: '#EF4444' };

  const card1: Card = {
    id: generateId(),
    title: '实现用户登录页面',
    description: '创建登录表单，包含邮箱和密码输入，记住我功能',
    tags: [tag1.id],
    dueDate: '2026-05-25',
    priority: 'high',
    createdAt: new Date().toISOString(),
  };

  const card2: Card = {
    id: generateId(),
    title: '设计系统配色方案',
    description: '确定主色调、辅助色、中性色，创建 Figma 设计稿',
    tags: [tag3.id],
    dueDate: '2026-05-28',
    priority: 'medium',
    createdAt: new Date().toISOString(),
  };

  const card3: Card = {
    id: generateId(),
    title: 'API 文档编写',
    description: '使用 Swagger 编写 REST API 文档',
    tags: [tag2.id],
    dueDate: null,
    priority: 'low',
    createdAt: new Date().toISOString(),
  };

  const card4: Card = {
    id: generateId(),
    title: '修复首页加载缓慢问题',
    description: '优化图片加载，启用 CDN，减少首屏渲染时间',
    tags: [tag1.id, tag4.id],
    dueDate: '2026-05-20',
    priority: 'high',
    createdAt: new Date().toISOString(),
  };

  const list1 = { id: generateId(), title: '待处理', cardIds: [card1.id, card2.id] };
  const list2 = { id: generateId(), title: '进行中', cardIds: [card4.id] };
  const list3 = { id: generateId(), title: '已完成', cardIds: [card3.id] };

  const board1 = { id: generateId(), title: '开发工作', listIds: [list1.id, list2.id, list3.id] };
  const board2 = { id: generateId(), title: '个人计划', listIds: [] };

  return {
    boards: { [board1.id]: board1, [board2.id]: board2 },
    lists: { [list1.id]: list1, [list2.id]: list2, [list3.id]: list3 },
    cards: { [card1.id]: card1, [card2.id]: card2, [card3.id]: card3, [card4.id]: card4 },
    tags: { [tag1.id]: tag1, [tag2.id]: tag2, [tag3.id]: tag3, [tag4.id]: tag4 },
    activeBoardId: board1.id,
  };
};

type Store = AppState & AppActions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...getSampleData(),
      searchQuery: '',
      filterTags: [],
      filterPriority: null,
      sortBy: null,

      setActiveBoard: (boardId: string) => set({ activeBoardId: boardId }),

      addBoard: (title: string) => {
        const id = generateId();
        const newBoard = { id, title, listIds: [] };
        set((state) => ({
          boards: { ...state.boards, [id]: newBoard },
          activeBoardId: state.activeBoardId || id,
        }));
      },

      renameBoard: (boardId: string, title: string) => {
        set((state) => ({
          boards: {
            ...state.boards,
            [boardId]: { ...state.boards[boardId], title },
          },
        }));
      },

      deleteBoard: (boardId: string) => {
        set((state) => {
          const { [boardId]: _, ...restBoards } = state.boards;
          const board = state.boards[boardId];
          const newLists = { ...state.lists };
          const newCards = { ...state.cards };

          board?.listIds.forEach((listId) => {
            const list = state.lists[listId];
            list?.cardIds.forEach((cardId) => {
              delete newCards[cardId];
            });
            delete newLists[listId];
          });

          const boardIds = Object.keys(restBoards);
          return {
            boards: restBoards,
            lists: newLists,
            cards: newCards,
            activeBoardId: boardIds.length > 0 ? boardIds[0] : null,
          };
        });
      },

      addList: (boardId: string, title: string) => {
        const id = generateId();
        const newList = { id, title, cardIds: [] };
        set((state) => ({
          lists: { ...state.lists, [id]: newList },
          boards: {
            ...state.boards,
            [boardId]: {
              ...state.boards[boardId],
              listIds: [...state.boards[boardId].listIds, id],
            },
          },
        }));
      },

      renameList: (listId: string, title: string) => {
        set((state) => ({
          lists: {
            ...state.lists,
            [listId]: { ...state.lists[listId], title },
          },
        }));
      },

      deleteList: (listId: string) => {
        set((state) => {
          const { [listId]: _, ...restLists } = state.lists;
          const list = state.lists[listId];
          const newCards = { ...state.cards };

          list?.cardIds.forEach((cardId) => {
            delete newCards[cardId];
          });

          const newBoards = { ...state.boards };
          Object.keys(newBoards).forEach((boardId) => {
            newBoards[boardId] = {
              ...newBoards[boardId],
              listIds: newBoards[boardId].listIds.filter((id) => id !== listId),
            };
          });

          return {
            boards: newBoards,
            lists: restLists,
            cards: newCards,
          };
        });
      },

      addCard: (listId: string, cardData: Omit<Card, 'id' | 'createdAt'>) => {
        const id = generateId();
        const newCard: Card = {
          ...cardData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          cards: { ...state.cards, [id]: newCard },
          lists: {
            ...state.lists,
            [listId]: {
              ...state.lists[listId],
              cardIds: [...state.lists[listId].cardIds, id],
            },
          },
        }));
      },

      updateCard: (cardId: string, cardData: Partial<Card>) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [cardId]: { ...state.cards[cardId], ...cardData },
          },
        }));
      },

      deleteCard: (cardId: string) => {
        set((state) => {
          const { [cardId]: _, ...restCards } = state.cards;
          const newLists = { ...state.lists };

          Object.keys(newLists).forEach((listId) => {
            newLists[listId] = {
              ...newLists[listId],
              cardIds: newLists[listId].cardIds.filter((id) => id !== cardId),
            };
          });

          return {
            cards: restCards,
            lists: newLists,
          };
        });
      },

      moveCard: (cardId: string, fromListId: string, toListId: string, index: number) => {
        set((state) => {
          const newLists = { ...state.lists };

          newLists[fromListId] = {
            ...newLists[fromListId],
            cardIds: newLists[fromListId].cardIds.filter((id) => id !== cardId),
          };

          const toCardIds = [...newLists[toListId].cardIds];
          toCardIds.splice(index, 0, cardId);
          newLists[toListId] = {
            ...newLists[toListId],
            cardIds: toCardIds,
          };

          return { lists: newLists };
        });
      },

      reorderCardsInList: (listId: string, oldIndex: number, newIndex: number) => {
        set((state) => {
          const newLists = { ...state.lists };
          const list = newLists[listId];
          if (!list) return state;

          const newCardIds = [...list.cardIds];
          const [removed] = newCardIds.splice(oldIndex, 1);
          newCardIds.splice(newIndex, 0, removed);

          newLists[listId] = {
            ...list,
            cardIds: newCardIds,
          };

          return { lists: newLists };
        });
      },

      addTag: (name: string, color: string) => {
        const id = generateId();
        const newTag = { id, name, color };
        set((state) => ({
          tags: { ...state.tags, [id]: newTag },
        }));
      },

      deleteTag: (tagId: string) => {
        set((state) => {
          const { [tagId]: _, ...restTags } = state.tags;
          const newCards = { ...state.cards };

          Object.keys(newCards).forEach((cardId) => {
            newCards[cardId] = {
              ...newCards[cardId],
              tags: newCards[cardId].tags.filter((id) => id !== tagId),
            };
          });

          return {
            tags: restTags,
            cards: newCards,
          };
        });
      },

      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setFilterTags: (tags: string[]) => set({ filterTags: tags }),
      setFilterPriority: (priority: Priority | null) => set({ filterPriority: priority }),
      setSortBy: (sortBy: 'dueDate' | 'priority' | null) => set({ sortBy: sortBy }),

      exportData: () => {
        const state = get();
        const data = {
          boards: state.boards,
          lists: state.lists,
          cards: state.cards,
          tags: state.tags,
          activeBoardId: state.activeBoardId,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      importData: (data: AppState) => {
        set({
          boards: data.boards,
          lists: data.lists,
          cards: data.cards,
          tags: data.tags,
          activeBoardId: data.activeBoardId,
          searchQuery: '',
          filterTags: [],
          filterPriority: null,
          sortBy: null,
        });
      },
    }),
    {
      name: 'kanban-storage',
    }
  )
);
