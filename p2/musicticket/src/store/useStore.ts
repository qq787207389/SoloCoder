import { create } from 'zustand';
import { User, TicketType, Seat, Order, Ticket, Post, Comment, QueuePosition } from '@/types';
import { mockTicketTypes, mockSeats, mockPosts, mockUsers, countdownDate } from '@/data/mockData';

interface StoreState {
  user: User | null;
  token: string | null;
  ticketTypes: TicketType[];
  seats: Seat[];
  selectedSeats: string[];
  selectedTicketType: string | null;
  orders: Order[];
  tickets: Ticket[];
  posts: Post[];
  queuePosition: QueuePosition | null;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  isProcessing: boolean;
  error: string | null;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  showPurchaseModal: boolean;

  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  updateTicketTypes: (types: TicketType[]) => void;
  updateSeats: (newSeats: Seat[] | ((prev: Seat[]) => Seat[])) => void;
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  setSelectedTicketType: (typeId: string) => void;

  lockSeat: (seatId: string) => void;
  unlockSeat: (seatId: string) => void;
  purchaseTickets: () => Promise<boolean>;

  addPost: (content: string, imageUrl?: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  likeComment: (postId: string, commentId: string) => void;

  setQueuePosition: (position: QueuePosition | null) => void;
  updateCountdown: () => void;

  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  openPurchaseModal: () => void;
  closePurchaseModal: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;
}

const generateQRCode = (ticketId: string): string => {
  return `WAVESTORM-${ticketId}-${Date.now()}`;
};

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  token: null,
  ticketTypes: mockTicketTypes,
  seats: mockSeats,
  selectedSeats: [],
  selectedTicketType: null,
  orders: [],
  tickets: [],
  posts: mockPosts,
  queuePosition: null,
  countdown: { days: 0, hours: 0, minutes: 0, seconds: 0 },
  isProcessing: false,
  error: null,
  showLoginModal: false,
  showRegisterModal: false,
  showPurchaseModal: false,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),

  login: async (username, password) => {
    set({ isProcessing: true, error: null });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (username === 'admin' && password === 'admin') {
      const admin = mockUsers[0];
      set({ 
        user: admin, 
        token: 'mock-jwt-token-admin',
        isProcessing: false,
        showLoginModal: false
      });
      return true;
    }
    
    if (username === 'user' && password === 'user') {
      const user = mockUsers[1];
      set({ 
        user: user, 
        token: 'mock-jwt-token-user',
        isProcessing: false,
        showLoginModal: false
      });
      return true;
    }
    
    set({ error: 'Invalid credentials', isProcessing: false });
    return false;
  },

  register: async (username, email, password) => {
    set({ isProcessing: true, error: null });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      id: `user${Date.now()}`,
      username,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      createdAt: new Date(),
      role: 'user',
    };
    
    set({ 
      user: newUser, 
      token: 'mock-jwt-token-new-user',
      isProcessing: false,
      showRegisterModal: false
    });
    return true;
  },

  logout: () => {
    set({ 
      user: null, 
      token: null, 
      selectedSeats: [], 
      queuePosition: null 
    });
  },

  updateTicketTypes: (types: TicketType[]) => set({ ticketTypes: types }),
  updateSeats: (newSeats: Seat[] | ((prev: Seat[]) => Seat[])) => 
    set(state => ({ seats: typeof newSeats === 'function' ? newSeats(state.seats) : newSeats })),

  selectSeat: (seatId) => {
    const { selectedSeats, seats } = get();
    const seat = seats.find(s => s.id === seatId);
    
    if (seat && seat.status === 'available') {
      if (!selectedSeats.includes(seatId)) {
        set({ selectedSeats: [...selectedSeats, seatId] });
      }
    }
  },

  deselectSeat: (seatId) => {
    const { selectedSeats } = get();
    set({ selectedSeats: selectedSeats.filter(id => id !== seatId) });
  },

  setSelectedTicketType: (typeId) => set({ selectedTicketType: typeId }),

  lockSeat: (seatId) => {
    const { seats, user } = get();
    if (!user) return;
    
    const newSeats = seats.map(seat => 
      seat.id === seatId && seat.status === 'available'
        ? { ...seat, status: 'locked' as const, lockedBy: user.id, lockedAt: new Date() }
        : seat
    );
    set({ seats: newSeats });
  },

  unlockSeat: (seatId) => {
    const { seats } = get();
    const newSeats = seats.map(seat => 
      seat.id === seatId && seat.status === 'locked'
        ? { ...seat, status: 'available' as const, lockedBy: undefined, lockedAt: undefined }
        : seat
    );
    set({ seats: newSeats });
    set({ selectedSeats: get().selectedSeats.filter(id => id !== seatId) });
  },

  purchaseTickets: async () => {
    const { selectedSeats, selectedTicketType, user, ticketTypes, seats } = get();
    
    if (!user) {
      set({ error: 'Please login first' });
      return false;
    }
    
    if (!selectedTicketType) {
      set({ error: 'Please select a ticket type' });
      return false;
    }
    
    if (selectedSeats.length === 0) {
      set({ error: 'Please select at least one seat' });
      return false;
    }

    set({ isProcessing: true, error: null });
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    const canPurchase = selectedSeats.every(seatId => {
      const seat = seats.find(s => s.id === seatId);
      return seat && (seat.status === 'available' || (seat.status === 'locked' && seat.lockedBy === user.id));
    });

    if (!canPurchase) {
      set({ error: 'Some seats are no longer available', isProcessing: false });
      return false;
    }

    const ticketType = ticketTypes.find(t => t.id === selectedTicketType);
    if (!ticketType || ticketType.remainingStock < selectedSeats.length) {
      set({ error: 'Not enough tickets available', isProcessing: false });
      return false;
    }

    const order: Order = {
      id: `order-${Date.now()}`,
      userId: user.id,
      ticketTypeId: selectedTicketType,
      seatIds: selectedSeats,
      totalPrice: ticketType.price * selectedSeats.length,
      status: 'confirmed',
      createdAt: new Date(),
      confirmedAt: new Date(),
    };

    const newTickets: Ticket[] = selectedSeats.map(seatId => ({
      id: `ticket-${Date.now()}-${seatId}`,
      orderId: order.id,
      userId: user.id,
      ticketTypeId: selectedTicketType,
      seatId,
      status: 'valid',
      qrCode: generateQRCode(`ticket-${Date.now()}-${seatId}`),
      createdAt: new Date(),
    }));

    const updatedSeats = seats.map(seat => 
      selectedSeats.includes(seat.id)
        ? { ...seat, status: 'sold' as const }
        : seat
    );

    const updatedTicketTypes = ticketTypes.map(t =>
      t.id === selectedTicketType
        ? { ...t, remainingStock: t.remainingStock - selectedSeats.length, salesCount: t.salesCount + selectedSeats.length }
        : t
    );

    set({
      orders: [...get().orders, order],
      tickets: [...get().tickets, ...newTickets],
      seats: updatedSeats,
      ticketTypes: updatedTicketTypes,
      selectedSeats: [],
      selectedTicketType: null,
      queuePosition: null,
      isProcessing: false,
      showPurchaseModal: false,
    });

    return true;
  },

  addPost: (content, imageUrl) => {
    const { user, posts } = get();
    if (!user) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      content,
      imageUrl,
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date(),
    };

    set({ posts: [newPost, ...posts] });
  },

  likePost: (postId) => {
    const { user, posts } = get();
    if (!user) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likedBy.includes(user.id);
        return {
          ...post,
          likes: isLiked ? post.likes - 1 : post.likes + 1,
          likedBy: isLiked 
            ? post.likedBy.filter(id => id !== user.id)
            : [...post.likedBy, user.id],
        };
      }
      return post;
    });

    set({ posts: updatedPosts });
  },

  addComment: (postId, content) => {
    const { user, posts } = get();
    if (!user) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          content,
          likes: 0,
          likedBy: [],
          createdAt: new Date(),
        };
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });

    set({ posts: updatedPosts });
  },

  likeComment: (postId, commentId) => {
    const { user, posts } = get();
    if (!user) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            const isLiked = comment.likedBy.includes(user.id);
            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: isLiked
                ? comment.likedBy.filter(id => id !== user.id)
                : [...comment.likedBy, user.id],
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });

    set({ posts: updatedPosts });
  },

  setQueuePosition: (position) => set({ queuePosition: position }),

  updateCountdown: () => {
    const now = Date.now();
    const distance = countdownDate - now;

    if (distance > 0) {
      set({
        countdown: {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        },
      });
    }
  },

  setProcessing: (processing) => set({ isProcessing: processing }),
  setError: (error) => set({ error }),
  
  openLoginModal: () => set({ showLoginModal: true, showRegisterModal: false }),
  closeLoginModal: () => set({ showLoginModal: false }),
  openRegisterModal: () => set({ showRegisterModal: true, showLoginModal: false }),
  closeRegisterModal: () => set({ showRegisterModal: false }),
  openPurchaseModal: () => set({ showPurchaseModal: true }),
  closePurchaseModal: () => set({ showPurchaseModal: false }),
  switchToLogin: () => set({ showLoginModal: true, showRegisterModal: false }),
  switchToRegister: () => set({ showRegisterModal: true, showLoginModal: false }),
}));