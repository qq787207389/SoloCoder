import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../types';
import { useStore } from '../store';
import { isOverdue, formatDate, highlightText, priorityColors } from '../utils';
import { CardModal } from './CardModal';

interface CardProps {
  card: CardType;
}

export const CardItem = ({ card }: CardProps) => {
  const { tags, searchQuery, deleteCard } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', cardId: card.id } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardTags = card.tags.map((tagId) => tags[tagId]).filter(Boolean);
  const overdue = isOverdue(card.dueDate);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        onClick={() => setIsModalOpen(true)}
        className={`bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all ${
          isDragging ? 'opacity-50 rotate-2 scale-105' : ''
        } ${overdue ? 'border-red-400 border-2' : 'border-gray-200'}`}
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-800 text-sm flex-1">
            {highlightText(card.title, searchQuery)}
          </h4>
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: priorityColors[card.priority] }}
          />
        </div>

        {card.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {card.description}
          </p>
        )}

        {cardTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {cardTags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 text-xs rounded-full text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          {card.dueDate && (
            <span
              className={`text-xs flex items-center gap-1 ${
                overdue ? 'text-red-500 font-medium' : 'text-gray-400'
              }`}
            >
              📅 {formatDate(card.dueDate)}
              {overdue && ' ⚠️'}
            </span>
          )}
          {showDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要删除这张卡片吗？')) {
                  deleteCard(card.id);
                }
              }}
              className="text-xs text-red-500 hover:text-red-600"
            >
              删除
            </button>
          )}
        </div>
      </div>

      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        card={card}
      />
    </>
  );
};
