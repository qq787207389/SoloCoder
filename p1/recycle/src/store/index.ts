import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Order, Category, Address, OrderStatusEnum, UserRole, Collector } from '@/types';
import { mockOrders, mockCategories, mockAddresses, mockUser, mockCollectorUser, mockAdminUser, mockCollectors } from '@/data/mock';
import dayjs from 'dayjs';

interface AppState {
  currentUser: User | null;
  orders: Order[];
  categories: Category[];
  addresses: Address[];
  collectors: Collector[];
  selectedCategory: Category | null;
  selectedWeight: number;
  login: (role: UserRole) => void;
  logout: () => void;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedWeight: (weight: number) => void;
  createOrder: (orderData: Partial<Order>) => void;
  cancelOrder: (orderId: string) => void;
  acceptOrder: (orderId: string) => void;
  confirmArrival: (orderId: string) => void;
  completeOrder: (orderId: string, actualWeight: number) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  updateCategory: (category: Category) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (categoryId: string) => void;
  updateUserInfo: (userInfo: Partial<User>) => void;
}

const generateOrderNo = () => {
  return 'RC' + dayjs().format('YYYYMMDD') + Math.random().toString(36).substr(2, 6).toUpperCase();
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      orders: mockOrders,
      categories: mockCategories,
      addresses: mockAddresses,
      collectors: mockCollectors,
      selectedCategory: null,
      selectedWeight: 0,

      login: (role: UserRole) => {
        let user: User;
        switch (role) {
          case UserRole.COLLECTOR:
            user = mockCollectorUser;
            break;
          case UserRole.ADMIN:
            user = mockAdminUser;
            break;
          default:
            user = mockUser;
        }
        set({ currentUser: user });
      },

      logout: () => {
        set({ currentUser: null });
      },

      setSelectedCategory: (category) => {
        set({ selectedCategory: category });
      },

      setSelectedWeight: (weight) => {
        set({ selectedWeight: weight });
      },

      createOrder: (orderData) => {
        const { currentUser, addresses, selectedCategory, selectedWeight } = get();
        if (!currentUser) return;

        const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
        const items = [{
          categoryId: selectedCategory!.id,
          categoryName: selectedCategory!.name,
          weight: selectedWeight,
          price: selectedCategory!.price,
          subtotal: selectedCategory!.price * selectedWeight
        }];

        const newOrder: Order = {
          id: Date.now().toString(),
          orderNo: generateOrderNo(),
          userId: currentUser.id,
          userName: currentUser.username,
          userPhone: currentUser.phone,
          address: orderData.address || defaultAddress,
          items,
          totalWeight: selectedWeight,
          estimatedAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
          status: OrderStatusEnum.PENDING,
          statusTimeline: [
            {
              status: OrderStatusEnum.PENDING,
              time: dayjs().format('YYYY-MM-DD HH:mm'),
              description: '订单已创建，等待接单'
            }
          ],
          timeSlot: orderData.timeSlot || '上午 09:00-12:00',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
          updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
        };

        set(state => ({
          orders: [newOrder, ...state.orders]
        }));
      },

      cancelOrder: (orderId) => {
        set(state => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                status: OrderStatusEnum.CANCELLED,
                statusTimeline: [
                  ...order.statusTimeline,
                  {
                    status: OrderStatusEnum.CANCELLED,
                    time: dayjs().format('YYYY-MM-DD HH:mm'),
                    description: '订单已取消'
                  }
                ],
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
              };
            }
            return order;
          })
        }));
      },

      acceptOrder: (orderId) => {
        const { currentUser, collectors } = get();
        const collector = collectors.find(c => c.id === currentUser?.id) || collectors[0];

        set(state => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                status: OrderStatusEnum.ACCEPTED,
                collectorId: collector.id,
                collector,
                statusTimeline: [
                  ...order.statusTimeline,
                  {
                    status: OrderStatusEnum.ACCEPTED,
                    time: dayjs().format('YYYY-MM-DD HH:mm'),
                    description: '回收员已接单'
                  }
                ],
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
              };
            }
            return order;
          })
        }));
      },

      confirmArrival: (orderId) => {
        set(state => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              return {
                ...order,
                status: OrderStatusEnum.ARRIVED,
                statusTimeline: [
                  ...order.statusTimeline,
                  {
                    status: OrderStatusEnum.ARRIVED,
                    time: dayjs().format('YYYY-MM-DD HH:mm'),
                    description: '回收员已到达'
                  }
                ],
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
              };
            }
            return order;
          })
        }));
      },

      completeOrder: (orderId, actualWeight) => {
        const order = get().orders.find(o => o.id === orderId);
        if (!order) return;

        const actualAmount = order.items.reduce((sum, item) => {
          const itemWeightRatio = item.weight / order.totalWeight;
          return sum + (actualWeight * itemWeightRatio * item.price);
        }, 0);

        set(state => ({
          orders: state.orders.map(o => {
            if (o.id === orderId) {
              return {
                ...o,
                status: OrderStatusEnum.COMPLETED,
                actualWeight,
                actualAmount: Math.round(actualAmount * 100) / 100,
                statusTimeline: [
                  ...o.statusTimeline,
                  {
                    status: OrderStatusEnum.COMPLETED,
                    time: dayjs().format('YYYY-MM-DD HH:mm'),
                    description: '订单已完成'
                  }
                ],
                updatedAt: dayjs().format('YYYY-MM-DD HH:mm')
              };
            }
            return o;
          })
        }));
      },

      addAddress: (address) => {
        const newAddress: Address = {
          ...address,
          id: Date.now().toString()
        };
        set(state => ({
          addresses: address.isDefault
            ? [...state.addresses.map(a => ({ ...a, isDefault: false })), newAddress]
            : [...state.addresses, newAddress]
        }));
      },

      updateAddress: (address) => {
        set(state => ({
          addresses: state.addresses.map(a => {
            if (a.id === address.id) {
              return address;
            }
            if (address.isDefault) {
              return { ...a, isDefault: false };
            }
            return a;
          })
        }));
      },

      deleteAddress: (addressId) => {
        set(state => ({
          addresses: state.addresses.filter(a => a.id !== addressId)
        }));
      },

      updateCategory: (category) => {
        set(state => ({
          categories: state.categories.map(c =>
            c.id === category.id ? category : c
          )
        }));
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: Date.now().toString()
        };
        set(state => ({
          categories: [...state.categories, newCategory]
        }));
      },

      deleteCategory: (categoryId) => {
        set(state => ({
          categories: state.categories.filter(c => c.id !== categoryId)
        }));
      },

      updateUserInfo: (userInfo) => {
        set(state => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...userInfo } : null
        }));
      }
    }),
    {
      name: 'recycle-app-storage'
    }
  )
);
