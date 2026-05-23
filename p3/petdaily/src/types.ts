export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthday: string;
  gender: 'male' | 'female';
  avatar: string;
  tags: string[];
}

export interface Post {
  id: string;
  petId: string;
  userId: string;
  content: string;
  images: string[];
  weight?: number;
  height?: number;
  tags: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Reminder {
  id: string;
  petId: string;
  type: 'vaccine' | 'deworming' | 'bath' | 'other';
  title: string;
  date: string;
  cycleDays?: number;
  enabled: boolean;
}

export interface WeightRecord {
  date: string;
  weight: number;
}
