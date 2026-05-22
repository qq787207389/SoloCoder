import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
}

interface Capsule {
  id: string;
  title: string;
  content: string;
  images: string[];
  audio: string | null;
  audioDuration?: number;
  unlockTime: number;
  isPublic: boolean;
  password?: string;
  authorName: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  isRead: boolean;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const getSampleCapsules = (): Capsule[] => [
  {
    id: generateId(),
    title: '给未来的自己',
    content: '# 亲爱的未来的我\n\n希望你还记得今天的心情。**生活很美好**，继续加油！\n\n> 每一天都是新的开始',
    images: [],
    audio: null,
    unlockTime: Date.now() + 10000,
    isPublic: true,
    authorName: '时光旅人',
    createdAt: Date.now(),
    likes: ['小明', '小红'],
    comments: [
      { id: generateId(), authorName: '小明', content: '写得真好！', createdAt: Date.now() - 3600000 },
    ],
    isRead: false,
  },
  {
    id: generateId(),
    title: '2025年的愿望',
    content: '## 我的愿望清单\n\n1. 学会一门新技能\n2. 去一次远方旅行\n3. 读50本书',
    images: [],
    audio: null,
    unlockTime: Date.now() + 86400000,
    isPublic: true,
    authorName: '梦想家',
    createdAt: Date.now(),
    likes: [],
    comments: [],
    isRead: false,
  },
  {
    id: generateId(),
    title: '一周后的惊喜',
    content: '这是一个私密的胶囊，只有我能看到。里面藏着我的小秘密...',
    images: [],
    audio: null,
    unlockTime: Date.now() + 604800000,
    isPublic: false,
    password: '123456',
    authorName: '匿名用户',
    createdAt: Date.now(),
    likes: [],
    comments: [],
    isRead: false,
  },
];

export const useCapsuleStore = create()(
  persist(
    (set, get) => ({
      capsules: getSampleCapsules(),
      currentUser: '',
      currentView: 'plaza',
      selectedCapsuleId: null,

      addCapsule: (capsuleData) =>
        set((state) => ({
          capsules: [
            {
              ...capsuleData,
              id: generateId(),
              createdAt: Date.now(),
              likes: [],
              comments: [],
              isRead: false,
            },
            ...state.capsules,
          ],
        })),

      deleteCapsule: (id) =>
        set((state) => ({
          capsules: state.capsules.filter((c) => c.id !== id),
        })),

      addLike: (capsuleId, userName) =>
        set((state) => ({
          capsules: state.capsules.map((c) =>
            c.id === capsuleId && !c.likes.includes(userName)
              ? { ...c, likes: [...c.likes, userName] }
              : c
          ),
        })),

      removeLike: (capsuleId, userName) =>
        set((state) => ({
          capsules: state.capsules.map((c) =>
            c.id === capsuleId
              ? { ...c, likes: c.likes.filter((name) => name !== userName) }
              : c
          ),
        })),

      addComment: (capsuleId, commentData) =>
        set((state) => ({
          capsules: state.capsules.map((c) =>
            c.id === capsuleId
              ? {
                  ...c,
                  comments: [
                    ...c.comments,
                    { ...commentData, id: generateId(), createdAt: Date.now() },
                  ],
                }
              : c
          ),
        })),

      markAsRead: (id) =>
        set((state) => ({
          capsules: state.capsules.map((c) =>
            c.id === id ? { ...c, isRead: true } : c
          ),
        })),

      setCurrentView: (view) => set({ currentView: view }),

      setSelectedCapsuleId: (id) => set({ selectedCapsuleId: id }),

      setCurrentUser: (name) => set({ currentUser: name }),

      verifyPassword: (id, password) => {
        const capsule = get().capsules.find((c) => c.id === id);
        return capsule?.password === password;
      },
    }),
    {
      name: 'time-capsule-storage',
      version: 1,
    }
  )
);
