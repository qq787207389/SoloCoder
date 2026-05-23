import { v4 as uuidv4 } from 'uuid';
import type { User, Pet, Post, Reminder } from '../types.ts';

const placeholderAvatars = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=200',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=200',
];

const placeholderImages = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600',
  'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600',
];

export const mockUsers: User[] = [
  { id: 'user1', name: '小明', avatar: placeholderAvatars[0] },
  { id: 'user2', name: '小红', avatar: placeholderAvatars[1] },
  { id: 'user3', name: '阿花', avatar: placeholderAvatars[2] },
];

export const mockPets: Pet[] = [
  {
    id: 'pet1',
    userId: 'user1',
    name: '豆豆',
    breed: '柯基',
    birthday: '2023-03-15',
    gender: 'male',
    avatar: placeholderAvatars[0],
    tags: ['柯基', '吃货', '拆家'],
  },
  {
    id: 'pet2',
    userId: 'user1',
    name: '咪咪',
    breed: '英短蓝猫',
    birthday: '2022-08-20',
    gender: 'female',
    avatar: placeholderAvatars[4],
    tags: ['英短', '高冷', '吃货'],
  },
  {
    id: 'pet3',
    userId: 'user2',
    name: '旺财',
    breed: '金毛',
    birthday: '2021-12-01',
    gender: 'male',
    avatar: placeholderAvatars[1],
    tags: ['金毛', '暖男', '大胃王'],
  },
  {
    id: 'pet4',
    userId: 'user3',
    name: '球球',
    breed: '比熊',
    birthday: '2023-06-10',
    gender: 'female',
    avatar: placeholderAvatars[3],
    tags: ['比熊', '粘人', '小可爱'],
  },
];

export const mockPosts: Post[] = [
  {
    id: uuidv4(),
    petId: 'pet1',
    userId: 'user1',
    content: '今天学会了坐下！给奖励零食的时候眼睛都直了 🐶',
    images: [placeholderImages[0]],
    weight: 10.5,
    tags: ['柯基', '训练'],
    likes: ['user2', 'user3'],
    comments: [
      {
        id: uuidv4(),
        userId: 'user2',
        userName: '小红',
        userAvatar: placeholderAvatars[1],
        content: '太聪明了！',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet1',
    userId: 'user1',
    content: '打完疫苗有点蔫，趴在窝里一动不动，心疼死了 😢',
    images: [placeholderImages[1]],
    weight: 10.8,
    tags: ['柯基', '疫苗'],
    likes: ['user3'],
    comments: [],
    createdAt: '2024-01-10T14:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet2',
    userId: 'user1',
    content: '又在晒太阳，这小日子过得比我还舒服 ☀️',
    images: [placeholderImages[4]],
    tags: ['英短', '日常'],
    likes: ['user2', 'user3'],
    comments: [],
    createdAt: '2024-01-14T11:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet3',
    userId: 'user2',
    content: '今天去公园玩疯了，回家直接瘫倒在地上，怎么叫都不起来 🦮',
    images: [placeholderImages[2]],
    weight: 28.5,
    tags: ['金毛', '公园'],
    likes: ['user1', 'user3'],
    comments: [
      {
        id: uuidv4(),
        userId: 'user1',
        userName: '小明',
        userAvatar: placeholderAvatars[0],
        content: '金毛都这样！',
        createdAt: '2024-01-13T16:00:00Z',
      },
    ],
    createdAt: '2024-01-13T15:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet4',
    userId: 'user3',
    content: '刚洗完澡的毛毛蓬松松，像个小棉花糖一样 🧸',
    images: [placeholderImages[3]],
    tags: ['比熊', '洗澡'],
    likes: ['user1', 'user2'],
    comments: [],
    createdAt: '2024-01-12T18:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet3',
    userId: 'user2',
    content: '今日份的微笑治愈，工作再累看到它就都好了 ❤️',
    images: [placeholderImages[5]],
    weight: 29.2,
    tags: ['金毛', '治愈'],
    likes: ['user1'],
    comments: [],
    createdAt: '2024-01-11T08:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet2',
    userId: 'user1',
    content: '偷喝我的牛奶被抓包，还装无辜的表情 😼',
    images: [placeholderImages[6]],
    tags: ['英短', '调皮'],
    likes: ['user2', 'user3'],
    comments: [],
    createdAt: '2024-01-09T20:00:00Z',
  },
  {
    id: uuidv4(),
    petId: 'pet4',
    userId: 'user3',
    content: '新衣服到啦！穿上变成小公主 👗',
    images: [placeholderImages[7]],
    tags: ['比熊', '新衣服'],
    likes: ['user1', 'user2'],
    comments: [],
    createdAt: '2024-01-08T12:00:00Z',
  },
];

export const mockReminders: Reminder[] = [
  {
    id: uuidv4(),
    petId: 'pet1',
    type: 'vaccine',
    title: '狂犬疫苗',
    date: '2024-02-15',
    cycleDays: 365,
    enabled: true,
  },
  {
    id: uuidv4(),
    petId: 'pet1',
    type: 'deworming',
    title: '体内驱虫',
    date: '2024-01-25',
    cycleDays: 90,
    enabled: true,
  },
  {
    id: uuidv4(),
    petId: 'pet1',
    type: 'bath',
    title: '洗澡美容',
    date: '2024-01-22',
    cycleDays: 14,
    enabled: true,
  },
];

export const initMockData = () => {
  const existingUsers = localStorage.getItem('petdaily_users');
  if (!existingUsers) {
    localStorage.setItem('petdaily_users', JSON.stringify(mockUsers));
  }
  
  const existingPets = localStorage.getItem('petdaily_pets');
  if (!existingPets) {
    localStorage.setItem('petdaily_pets', JSON.stringify(mockPets));
  }
  
  const existingPosts = localStorage.getItem('petdaily_posts');
  if (!existingPosts) {
    localStorage.setItem('petdaily_posts', JSON.stringify(mockPosts));
  }
  
  const existingReminders = localStorage.getItem('petdaily_reminders');
  if (!existingReminders) {
    localStorage.setItem('petdaily_reminders', JSON.stringify(mockReminders));
  }

  const currentUser = localStorage.getItem('petdaily_current_user');
  if (!currentUser) {
    localStorage.setItem('petdaily_current_user', JSON.stringify(mockUsers[0]));
  }
};
