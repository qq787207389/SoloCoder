export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  role: 'user' | 'admin';
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  benefits: string[];
  totalStock: number;
  remainingStock: number;
  salesCount: number;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  section: string;
  price: number;
  status: 'available' | 'locked' | 'sold' | 'selected';
  lockedBy?: string;
  lockedAt?: Date;
}

export interface Order {
  id: string;
  userId: string;
  ticketTypeId: string;
  seatIds: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  confirmedAt?: Date;
}

export interface Ticket {
  id: string;
  orderId: string;
  userId: string;
  ticketTypeId: string;
  seatId: string;
  status: 'valid' | 'used' | 'transferred';
  qrCode: string;
  transferredTo?: string;
  createdAt: Date;
  usedAt?: Date;
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  imageUrl: string;
  videoUrl?: string;
  stage: string;
  startTime: Date;
  endTime: Date;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  imageUrl?: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: Date;
}

export interface QueuePosition {
  userId: string;
  position: number;
  status: 'waiting' | 'processing' | 'completed' | 'timeout';
  createdAt: Date;
}

export interface WSMessage {
  type: string;
  payload: any;
}
