import { Artist, TicketType, Seat, Post, User } from '@/types';

export const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Neon Dreams',
    genre: 'Electronic',
    bio: 'Electronic music pioneers with over 10 million albums sold worldwide.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Main Stage',
    startTime: new Date('2024-08-15T18:00:00'),
    endTime: new Date('2024-08-15T19:30:00'),
  },
  {
    id: '2',
    name: 'The Midnight',
    genre: 'Synthwave',
    bio: 'Retrowave sensations bringing 80s nostalgia to the modern era.',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Neon Stage',
    startTime: new Date('2024-08-15T20:00:00'),
    endTime: new Date('2024-08-15T21:30:00'),
  },
  {
    id: '3',
    name: 'Electric Pulse',
    genre: 'Techno',
    bio: 'Berlin-based techno producer with sold-out shows across Europe.',
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Techno Tent',
    startTime: new Date('2024-08-15T22:00:00'),
    endTime: new Date('2024-08-16T00:00:00'),
  },
  {
    id: '4',
    name: 'Luna Eclipse',
    genre: 'Indie Pop',
    bio: 'Dreamy indie pop with ethereal vocals and captivating melodies.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Acoustic Stage',
    startTime: new Date('2024-08-16T12:00:00'),
    endTime: new Date('2024-08-16T13:30:00'),
  },
  {
    id: '5',
    name: 'Bass Drop',
    genre: 'Dubstep',
    bio: 'Heavy basslines and explosive drops that shake the crowd.',
    imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Bass Arena',
    startTime: new Date('2024-08-16T14:00:00'),
    endTime: new Date('2024-08-16T16:00:00'),
  },
  {
    id: '6',
    name: 'Sunset Groove',
    genre: 'House',
    bio: 'Feel-good house music that gets everyone dancing.',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    stage: 'Main Stage',
    startTime: new Date('2024-08-16T17:00:00'),
    endTime: new Date('2024-08-16T18:30:00'),
  },
];

export const mockTicketTypes: TicketType[] = [
  {
    id: 'general',
    name: 'General Admission',
    price: 299,
    description: 'Full access to all stages and areas',
    benefits: ['All stage access', 'Festival guide', 'Water refill stations'],
    totalStock: 1000,
    remainingStock: 327,
    salesCount: 673,
  },
  {
    id: 'vip',
    name: 'VIP Experience',
    price: 599,
    description: 'Premium access with exclusive perks',
    benefits: ['Priority entrance', 'VIP lounge access', 'Free merchandise', 'Dedicated restrooms'],
    totalStock: 500,
    remainingStock: 156,
    salesCount: 344,
  },
  {
    id: 'vvip',
    name: 'VVIP Platinum',
    price: 1299,
    description: 'Ultimate luxury festival experience',
    benefits: ['All VIP benefits', 'Backstage access', 'Artist meet & greet', 'Private viewing area', 'Concierge service'],
    totalStock: 200,
    remainingStock: 42,
    salesCount: 158,
  },
];

export const generateSeats = (): Seat[] => {
  const seats: Seat[] = [];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const rowsPerSection = 30;
  const seatsPerRow = 8;

  sections.forEach((section) => {
    for (let row = 1; row <= rowsPerSection; row++) {
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        const random = Math.random();
        let status: Seat['status'] = 'available';
        if (random > 0.6) {
          status = 'sold';
        } else if (random > 0.55) {
          status = 'locked';
        }

        seats.push({
          id: `${section}-${row}-${seatNum}`,
          row: String(row),
          number: seatNum,
          section,
          price: section === 'A' || section === 'B' ? 599 : section === 'C' || section === 'D' ? 449 : 299,
          status,
        });
      }
    }
  });

  return seats;
};

export const mockSeats = generateSeats();

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'MusicLover',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MusicLover',
    content: 'Just got my tickets! Cannot wait for WaveStorm this year! 🎶',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    likes: 128,
    likedBy: ['user2', 'user3'],
    comments: [
      {
        id: 'c1',
        userId: 'user2',
        username: 'FestivalFan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FestivalFan',
        content: 'So excited! See you there!',
        likes: 5,
        likedBy: [],
        createdAt: new Date('2024-08-01T10:30:00'),
      },
    ],
    createdAt: new Date('2024-08-01T10:00:00'),
  },
  {
    id: '2',
    userId: 'user4',
    username: 'EDMAddict',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EDMAddict',
    content: 'The lineup is insane this year! Neon Dreams and Electric Pulse on the same day? YES!',
    likes: 256,
    likedBy: ['user1', 'user5', 'user6'],
    comments: [],
    createdAt: new Date('2024-08-01T09:00:00'),
  },
  {
    id: '3',
    userId: 'user7',
    username: 'PartyAnimal',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PartyAnimal',
    content: 'Countdown is on! 2 weeks to go! 🎉',
    likes: 89,
    likedBy: [],
    comments: [
      {
        id: 'c2',
        userId: 'user8',
        username: 'RaveQueen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RaveQueen',
        content: 'Already packed my bag!',
        likes: 12,
        likedBy: ['user7'],
        createdAt: new Date('2024-08-01T09:15:00'),
      },
      {
        id: 'c3',
        userId: 'user9',
        username: 'TechnoHead',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TechnoHead',
        content: 'Who is ready for the techno tent? 🔊',
        likes: 8,
        likedBy: [],
        createdAt: new Date('2024-08-01T09:20:00'),
      },
    ],
    createdAt: new Date('2024-08-01T08:30:00'),
  },
];

export const mockUsers: User[] = [
  {
    id: 'admin',
    username: 'admin',
    email: 'admin@wavestorm.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    createdAt: new Date('2024-01-01'),
    role: 'admin',
  },
  {
    id: 'user1',
    username: 'MusicLover',
    email: 'music@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MusicLover',
    createdAt: new Date('2024-02-15'),
    role: 'user',
  },
];

export const countdownDate = new Date('2024-08-15T00:00:00').getTime();
