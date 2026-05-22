import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '../store';
import { api } from '../services/api';
import type { Item, Category, User } from '../types';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ItemCard from '../components/ItemCard';
import PullToRefresh from '../components/PullToRefresh';
import { MapPin } from 'lucide-react';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const currentCategory = useAppStore((state) => state.currentCategory);
  const setCurrentCategory = useAppStore((state) => state.setCurrentCategory);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const setExchangeRequests = useAppStore((state) => state.setExchangeRequests);
  const setUser = useAppStore((state) => state.setUser);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setPage(1);
      setItems([]);
    }

    const currentPage = isRefresh ? 1 : page;

    if (isRefresh) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await api.getItems({
        page: currentPage,
        pageSize: 10,
        category: currentCategory || undefined,
        search: searchQuery || undefined,
      });

      const newItems = isRefresh ? response.data : [...items, ...response.data];
      setItems(newItems);
      setHasMore(response.hasMore);
      setPage(currentPage + 1);

      const userIds = [...new Set(response.data.map((item) => item.userId))];
      const newUsers: Record<string, User> = {};

      for (const userId of userIds) {
        if (!users[userId]) {
          const userResponse = await api.getUser(userId);
          if (userResponse.success) {
            newUsers[userId] = userResponse.data;
          }
        }
      }

      setUsers((prev) => ({ ...prev, ...newUsers }));
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [page, currentCategory, searchQuery, items, users]);

  const handleRefresh = useCallback(async () => {
    await loadItems(true);
  }, [loadItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentCategory, searchQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadItems();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, loadItems]);

  useEffect(() => {
    api.getCurrentUser().then((response) => {
      if (response.success) {
        setUser(response.data);
      }
    });

    api.getExchangeRequests('received').then((response) => {
      if (response.success) {
        setExchangeRequests(response.data);
      }
    });
  }, [setUser, setExchangeRequests]);

  return (
    <div className="min-h-screen pb-28">
      <Header showMessage />

      <div className="max-w-md mx-auto px-4 py-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜索物品、邻居..."
        />

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-primary-500" />
          <span>阳光花园小区</span>
        </div>

        <div className="mt-4">
          <CategoryFilter selected={currentCategory} onSelect={setCurrentCategory} />
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        <PullToRefresh onRefresh={handleRefresh}>
          {isLoading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-6xl mb-4">🔍</span>
              <p>暂无相关物品</p>
              <p className="text-sm">试试其他分类或关键词吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {items.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <ItemCard item={item} user={users[item.userId]} />
                </div>
              ))}
            </div>
          )}

          {isLoadingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-500 text-sm">加载中...</span>
            </div>
          )}

          <div ref={loadMoreRef} className="h-4" />
        </PullToRefresh>
      </div>
    </div>
  );
}
