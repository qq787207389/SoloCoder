import { http, HttpResponse } from 'msw';
import { mockItems, mockUsers, mockExchangeRequests, mockRatings } from './data';
import type { Item, ExchangeRequest, Category, PaginatedResponse, User, Rating } from '../types';

let items = [...mockItems];
let exchangeRequests = [...mockExchangeRequests];
let ratings = [...mockRatings];

export const handlers = [
  http.get('/api/items', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const category = url.searchParams.get('category') as Category | null;
    const search = url.searchParams.get('search') || '';
    const community = url.searchParams.get('community') || '';

    let filteredItems = items.filter(item => item.status === 'active');

    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(
        item =>
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    if (community) {
      filteredItems = filteredItems.filter(item => item.community === community);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = filteredItems.slice(start, end);

    return HttpResponse.json<PaginatedResponse<Item>>({
      data: paginatedItems,
      page,
      pageSize,
      total: filteredItems.length,
      hasMore: end < filteredItems.length,
    });
  }),

  http.get('/api/items/:id', ({ params }) => {
    const { id } = params;
    const item = items.find(i => i.id === id);

    if (!item) {
      return HttpResponse.json({ success: false, message: '物品不存在' }, { status: 404 });
    }

    return HttpResponse.json({ success: true, data: item });
  }),

  http.post('/api/items', async ({ request }) => {
    const body = await request.json() as Partial<Item>;
    const newItem: Item = {
      id: `item-${Date.now()}`,
      userId: 'current-user',
      title: body.title || '',
      description: body.description || '',
      category: body.category || 'other',
      images: body.images || [],
      desiredCategory: body.desiredCategory || '',
      community: '阳光花园',
      createdAt: new Date().toISOString(),
      status: 'active',
      distance: '0m',
    };

    items.unshift(newItem);

    return HttpResponse.json({ success: true, data: newItem });
  }),

  http.put('/api/items/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<Item>;
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return HttpResponse.json({ success: false, message: '物品不存在' }, { status: 404 });
    }

    items[index] = { ...items[index], ...body };

    return HttpResponse.json({ success: true, data: items[index] });
  }),

  http.delete('/api/items/:id', ({ params }) => {
    const { id } = params;
    const index = items.findIndex(i => i.id === id);

    if (index === -1) {
      return HttpResponse.json({ success: false, message: '物品不存在' }, { status: 404 });
    }

    items[index] = { ...items[index], status: 'offline' };

    return HttpResponse.json({ success: true });
  }),

  http.get('/api/user', () => {
    const user = mockUsers.find(u => u.id === 'current-user');
    return HttpResponse.json({ success: true, data: user });
  }),

  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
      return HttpResponse.json({ success: false, message: '用户不存在' }, { status: 404 });
    }

    return HttpResponse.json({ success: true, data: user });
  }),

  http.get('/api/users/:id/items', ({ params }) => {
    const { id } = params;
    const userItems = items.filter(item => item.userId === id);

    return HttpResponse.json({ success: true, data: userItems });
  }),

  http.get('/api/exchange-requests', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all';

    let filteredRequests = exchangeRequests;

    if (type === 'sent') {
      filteredRequests = exchangeRequests.filter(r => r.fromUserId === 'current-user');
    } else if (type === 'received') {
      filteredRequests = exchangeRequests.filter(r => r.toUserId === 'current-user');
    }

    return HttpResponse.json({ success: true, data: filteredRequests });
  }),

  http.post('/api/exchange-requests', async ({ request }) => {
    const body = await request.json() as Partial<ExchangeRequest>;
    const newRequest: ExchangeRequest = {
      id: `req-${Date.now()}`,
      fromUserId: 'current-user',
      toUserId: body.toUserId || '',
      offeredItemId: body.offeredItemId || '',
      requestedItemId: body.requestedItemId || '',
      message: body.message || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    exchangeRequests.unshift(newRequest);

    return HttpResponse.json({ success: true, data: newRequest });
  }),

  http.put('/api/exchange-requests/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<ExchangeRequest>;
    const index = exchangeRequests.findIndex(r => r.id === id);

    if (index === -1) {
      return HttpResponse.json({ success: false, message: '请求不存在' }, { status: 404 });
    }

    exchangeRequests[index] = { ...exchangeRequests[index], ...body };

    return HttpResponse.json({ success: true, data: exchangeRequests[index] });
  }),

  http.put('/api/exchange-requests/:id/read', ({ params }) => {
    const { id } = params;
    const index = exchangeRequests.findIndex(r => r.id === id);

    if (index === -1) {
      return HttpResponse.json({ success: false, message: '请求不存在' }, { status: 404 });
    }

    exchangeRequests[index] = { ...exchangeRequests[index], isRead: true };

    return HttpResponse.json({ success: true });
  }),

  http.get('/api/ratings/:userId', ({ params }) => {
    const { userId } = params;
    const userRatings = ratings.filter(r => r.toUserId === userId);

    return HttpResponse.json({ success: true, data: userRatings });
  }),

  http.post('/api/ratings', async ({ request }) => {
    const body = await request.json() as Partial<Rating>;
    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      fromUserId: 'current-user',
      toUserId: body.toUserId || '',
      exchangeId: body.exchangeId || '',
      score: body.score || 5,
      comment: body.comment || '',
      createdAt: new Date().toISOString(),
    };

    ratings.push(newRating);

    return HttpResponse.json({ success: true, data: newRating });
  }),
];
