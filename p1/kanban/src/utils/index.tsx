import { Priority, Card } from '../types';
import React from 'react';

export const priorityColors: Record<Priority, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

export const priorityLabels: Record<Priority, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

export const isOverdue = (dueDate: string | null): boolean => {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
};

export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

export const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
    ) : part
  );
};

export const sortCards = (cards: Card[], sortBy: 'dueDate' | 'priority' | null): Card[] => {
  if (!sortBy) return cards;
  
  const sorted = [...cards];
  
  if (sortBy === 'dueDate') {
    return sorted.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }
  
  if (sortBy === 'priority') {
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
    return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  
  return sorted;
};

export const filterCards = (
  cards: Card[],
  searchQuery: string,
  filterTags: string[],
  filterPriority: Priority | null
): Card[] => {
  return cards.filter((card) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    if (filterTags.length > 0) {
      const hasTag = filterTags.some((tagId) => card.tags.includes(tagId));
      if (!hasTag) return false;
    }
    
    if (filterPriority && card.priority !== filterPriority) {
      return false;
    }
    
    return true;
  });
};

export const renderMarkdown = (text: string): React.ReactNode => {
  if (!text) return null;
  
  const lines = text.split('\n');
  
  return lines.map((line, index) => {
    let formatted = line;
    
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    return (
      <p key={index} className="text-sm" dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} />
    );
  });
};
