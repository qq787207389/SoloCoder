import { Category, Order, OrderStatusEnum, Address, Collector, User, UserRole } from '@/types';
import dayjs from 'dayjs';

export const mockCategories: Category[] = [
  {
    id: '1',
    name: '纸类',
    icon: '📄',
    price: 1.2,
    unit: '元/公斤',
    description: '报纸、纸箱、书本等'
  },
  {
    id: '2',
    name: '塑料',
    icon: '🥤',
    price: 0.8,
    unit: '元/公斤',
    description: '饮料瓶、塑料容器等'
  },
  {
    id: '3',
    name: '金属',
    icon: '🔩',
    price: 2.5,
    unit: '元/公斤',
    description: '易拉罐、铁丝、铜等'
  },
  {
    id: '4',
    name: '家电',
    icon: '📺',
    price: 50,
    unit: '元/件',
    description: '电视、冰箱、洗衣机等'
  },
  {
    id: '5',
    name: '衣物',
    icon: '👕',
    price: 0.5,
    unit: '元/公斤',
    description: '旧衣服、鞋子、包包等'
  }
];

export const mockAddresses: Address[] = [
  {
    id: '1',
    name: '张三',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南区A栋1001室',
    isDefault: true
  },
  {
    id: '2',
    name: '张三',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    detail: '中心城广场B座2002室',
    isDefault: false
  }
];

export const mockCollectors: Collector[] = [
  {
    id: 'c1',
    name: '李回收',
    phone: '13900139001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector1'
  },
  {
    id: 'c2',
    name: '王师傅',
    phone: '13900139002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector2'
  }
];

const generateOrderNo = () => {
  return 'RC' + dayjs().format('YYYYMMDD') + Math.random().toString(36).substr(2, 6).toUpperCase();
};

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[0],
    items: [
      { categoryId: '1', categoryName: '纸类', weight: 10, price: 1.2, subtotal: 12 },
      { categoryId: '2', categoryName: '塑料', weight: 5, price: 0.8, subtotal: 4 }
    ],
    totalWeight: 15,
    estimatedAmount: 16,
    actualAmount: 15.5,
    actualWeight: 14.5,
    status: OrderStatusEnum.COMPLETED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.ACCEPTED, time: dayjs().subtract(3, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已接单' },
      { status: OrderStatusEnum.ARRIVED, time: dayjs().subtract(3, 'day').add(3, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已到达' },
      { status: OrderStatusEnum.COMPLETED, time: dayjs().subtract(3, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm'), description: '订单已完成' }
    ],
    timeSlot: '上午 09:00-12:00',
    collectorId: 'c1',
    collector: mockCollectors[0],
    createdAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().subtract(3, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm')
  },
  {
    id: '2',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[0],
    items: [
      { categoryId: '3', categoryName: '金属', weight: 8, price: 2.5, subtotal: 20 }
    ],
    totalWeight: 8,
    estimatedAmount: 20,
    status: OrderStatusEnum.ACCEPTED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.ACCEPTED, time: dayjs().subtract(1, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已接单' }
    ],
    timeSlot: '下午 14:00-18:00',
    collectorId: 'c2',
    collector: mockCollectors[1],
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().subtract(1, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm')
  },
  {
    id: '3',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[1],
    items: [
      { categoryId: '4', categoryName: '家电', weight: 1, price: 50, subtotal: 50 }
    ],
    totalWeight: 1,
    estimatedAmount: 50,
    status: OrderStatusEnum.PENDING,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' }
    ],
    timeSlot: '上午 09:00-12:00',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
  },
  {
    id: '4',
    orderNo: generateOrderNo(),
    userId: 'u2',
    userName: '李四',
    userPhone: '13800138002',
    address: {
      id: '3',
      name: '李四',
      phone: '13800138002',
      province: '广东省',
      city: '深圳市',
      district: '宝安区',
      detail: '西乡街道C栋501室',
      isDefault: true
    },
    items: [
      { categoryId: '5', categoryName: '衣物', weight: 6, price: 0.5, subtotal: 3 }
    ],
    totalWeight: 6,
    estimatedAmount: 3,
    status: OrderStatusEnum.PENDING,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' }
    ],
    timeSlot: '下午 14:00-18:00',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
  },
  {
    id: '5',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[0],
    items: [
      { categoryId: '1', categoryName: '纸类', weight: 20, price: 1.2, subtotal: 24 },
      { categoryId: '2', categoryName: '塑料', weight: 10, price: 0.8, subtotal: 8 }
    ],
    totalWeight: 30,
    estimatedAmount: 32,
    actualAmount: 30,
    actualWeight: 28,
    status: OrderStatusEnum.COMPLETED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.ACCEPTED, time: dayjs().subtract(5, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已接单' },
      { status: OrderStatusEnum.ARRIVED, time: dayjs().subtract(5, 'day').add(3, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已到达' },
      { status: OrderStatusEnum.COMPLETED, time: dayjs().subtract(5, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm'), description: '订单已完成' }
    ],
    timeSlot: '上午 09:00-12:00',
    collectorId: 'c1',
    collector: mockCollectors[0],
    createdAt: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().subtract(5, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm')
  },
  {
    id: '6',
    orderNo: generateOrderNo(),
    userId: 'u3',
    userName: '王五',
    userPhone: '13800138003',
    address: {
      id: '4',
      name: '王五',
      phone: '13800138003',
      province: '广东省',
      city: '深圳市',
      district: '龙岗区',
      detail: '坂田街道D栋302室',
      isDefault: true
    },
    items: [
      { categoryId: '3', categoryName: '金属', weight: 15, price: 2.5, subtotal: 37.5 }
    ],
    totalWeight: 15,
    estimatedAmount: 37.5,
    status: OrderStatusEnum.CANCELLED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.CANCELLED, time: dayjs().subtract(2, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'), description: '订单已取消' }
    ],
    timeSlot: '下午 14:00-18:00',
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().subtract(2, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm')
  },
  {
    id: '7',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[0],
    items: [
      { categoryId: '2', categoryName: '塑料', weight: 12, price: 0.8, subtotal: 9.6 }
    ],
    totalWeight: 12,
    estimatedAmount: 9.6,
    status: OrderStatusEnum.PENDING,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' }
    ],
    timeSlot: '上午 09:00-12:00',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
  },
  {
    id: '8',
    orderNo: generateOrderNo(),
    userId: 'u4',
    userName: '赵六',
    userPhone: '13800138004',
    address: {
      id: '5',
      name: '赵六',
      phone: '13800138004',
      province: '广东省',
      city: '深圳市',
      district: '罗湖区',
      detail: '东门街道E栋701室',
      isDefault: true
    },
    items: [
      { categoryId: '1', categoryName: '纸类', weight: 5, price: 1.2, subtotal: 6 },
      { categoryId: '5', categoryName: '衣物', weight: 3, price: 0.5, subtotal: 1.5 }
    ],
    totalWeight: 8,
    estimatedAmount: 7.5,
    actualAmount: 7,
    actualWeight: 7.5,
    status: OrderStatusEnum.COMPLETED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.ACCEPTED, time: dayjs().subtract(7, 'day').add(2, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已接单' },
      { status: OrderStatusEnum.ARRIVED, time: dayjs().subtract(7, 'day').add(4, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已到达' },
      { status: OrderStatusEnum.COMPLETED, time: dayjs().subtract(7, 'day').add(5, 'hour').format('YYYY-MM-DD HH:mm'), description: '订单已完成' }
    ],
    timeSlot: '下午 14:00-18:00',
    collectorId: 'c2',
    collector: mockCollectors[1],
    createdAt: dayjs().subtract(7, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().subtract(7, 'day').add(5, 'hour').format('YYYY-MM-DD HH:mm')
  },
  {
    id: '9',
    orderNo: generateOrderNo(),
    userId: 'u1',
    userName: '张三',
    userPhone: '13800138001',
    address: mockAddresses[1],
    items: [
      { categoryId: '4', categoryName: '家电', weight: 2, price: 50, subtotal: 100 }
    ],
    totalWeight: 2,
    estimatedAmount: 100,
    status: OrderStatusEnum.ARRIVED,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' },
      { status: OrderStatusEnum.ACCEPTED, time: dayjs().subtract(1, 'day').add(1, 'hour').format('YYYY-MM-DD HH:mm'), description: '回收员已接单' },
      { status: OrderStatusEnum.ARRIVED, time: dayjs().format('YYYY-MM-DD HH:mm'), description: '回收员已到达' }
    ],
    timeSlot: '上午 09:00-12:00',
    collectorId: 'c1',
    collector: mockCollectors[0],
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
  },
  {
    id: '10',
    orderNo: generateOrderNo(),
    userId: 'u5',
    userName: '孙七',
    userPhone: '13800138005',
    address: {
      id: '6',
      name: '孙七',
      phone: '13800138005',
      province: '广东省',
      city: '深圳市',
      district: '盐田区',
      detail: '沙头角街道F栋403室',
      isDefault: true
    },
    items: [
      { categoryId: '3', categoryName: '金属', weight: 6, price: 2.5, subtotal: 15 },
      { categoryId: '1', categoryName: '纸类', weight: 8, price: 1.2, subtotal: 9.6 }
    ],
    totalWeight: 14,
    estimatedAmount: 24.6,
    status: OrderStatusEnum.PENDING,
    statusTimeline: [
      { status: OrderStatusEnum.PENDING, time: dayjs().format('YYYY-MM-DD HH:mm'), description: '订单已创建，等待接单' }
    ],
    timeSlot: '下午 14:00-18:00',
    createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
    updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
  }
];

export const mockUser: User = {
  id: 'u1',
  username: '张三',
  phone: '13800138001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
  role: UserRole.USER
};

export const mockCollectorUser: User = {
  id: 'c1',
  username: '李回收',
  phone: '13900139001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=collector1',
  role: UserRole.COLLECTOR
};

export const mockAdminUser: User = {
  id: 'a1',
  username: '管理员',
  phone: '13700137001',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  role: UserRole.ADMIN
};
