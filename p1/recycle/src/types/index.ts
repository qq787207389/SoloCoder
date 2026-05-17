export interface Category {
  id: string;
  name: string;
  icon: string;
  price: number;
  unit: string;
  description: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

export interface OrderItem {
  categoryId: string;
  categoryName: string;
  weight: number;
  price: number;
  subtotal: number;
}

export interface OrderStatus {
  status: OrderStatusEnum;
  time: string;
  description: string;
}

export interface Collector {
  id: string;
  name: string;
  phone: string;
  avatar: string;
}

export enum OrderStatusEnum {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ARRIVED = 'arrived',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  userName: string;
  userPhone: string;
  address: Address;
  items: OrderItem[];
  totalWeight: number;
  estimatedAmount: number;
  actualAmount?: number;
  actualWeight?: number;
  status: OrderStatusEnum;
  statusTimeline: OrderStatus[];
  timeSlot: string;
  collectorId?: string;
  collector?: Collector;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  phone: string;
  avatar: string;
  role: UserRole;
}

export enum UserRole {
  USER = 'user',
  COLLECTOR = 'collector',
  ADMIN = 'admin'
}
