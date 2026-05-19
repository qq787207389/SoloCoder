import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../store';
import { List as ListType } from '../types';
import { filterCards, sortCards } from '../utils';
import { CardItem } from './Card';
import { CardModal } from './CardModal';

interface ListProps {
  list: ListType;
}

export const ListComponent = ({ list }: ListProps) => {
  const { cards, searchQuery, filterTags, filterPriority, sortBy, renameList, deleteList } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
    data: { type: 'list', listId: list.id },
  });

  const listCards = list.cardIds
    .map((id) => cards[id])
    .filter(Boolean);

  const filteredCards = sortCards(
    filterCards(listCards, searchQuery, filterTags, filterPriority),
    sortBy
  );

  const filteredCardIds = filteredCards.map(card => card.id);

  const handleRename = () => {
    if (editTitle.trim()) {
      renameList(list.id, editTitle.trim());
    } else {
      setEditTitle(list.title);
    }
    setIsEditing(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`flex-shrink-0 w-80 bg-gray-100 rounded-xl p-4 flex flex-col max-h-[calc(100vh-180px)] ${
          isOver ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-3 group">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="font-semibold text-gray-800 bg-transparent border-b border-blue-400 focus:outline-none px-1 flex-1"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-gray-800 cursor-pointer hover:text-blue-500"
              onClick={() => setIsEditing(true)}
            >
              {list.title}
              <span className="text-gray-400 ml-2 text-sm">({filteredCards.length})</span>
            </h3>
          )}
          <button
            onClick={() => {
              if (confirm('确定要删除这个列表吗？')) {
                deleteList(list.id);
              }
            }}
            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 text-sm transition-opacity"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 min-h-[100px]">
          <SortableContext items={filteredCardIds} strategy={verticalListSortingStrategy}>
            {filteredCards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </SortableContext>
          {filteredCards.length === 0 && listCards.length > 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              没有匹配的卡片
            </div>
          )}
          {listCards.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              暂无卡片，点击下方按钮添加
            </div>
          )}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <span>+</span>
          <span>添加卡片</span>
        </button>
      </div>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listId={list.id}
      />
    </>
  );
};
