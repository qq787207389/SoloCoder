import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';

import { useStore } from '../store';
import { ListComponent } from './List';
import { CardItem } from './Card';

export const Board = () => {
  const { boards, lists, activeBoardId, addList, moveCard, reorderCardsInList } = useStore();
  const [newListTitle, setNewListTitle] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const activeBoard = activeBoardId ? boards[activeBoardId] : null;
  const boardLists = activeBoard?.listIds.map((id) => lists[id]).filter(Boolean) || [];

  const handleAddList = () => {
    if (newListTitle.trim() && activeBoardId) {
      addList(activeBoardId, newListTitle.trim());
      setNewListTitle('');
      setIsAddingList(false);
    }
  };

  const findListContainingCard = (cardId: string): string | null => {
    for (const listId of Object.keys(lists)) {
      if (lists[listId].cardIds.includes(cardId)) {
        return listId;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeListId = findListContainingCard(activeId);
    const overListId = lists[overId] ? overId : findListContainingCard(overId);

    if (!activeListId || !overListId || activeListId === overListId) return;

    const overCardIndex = lists[overListId].cardIds.indexOf(overId);
    const insertIndex = overCardIndex >= 0 ? overCardIndex : lists[overListId].cardIds.length;

    moveCard(activeId, activeListId, overListId, insertIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeListId = findListContainingCard(activeId);
    if (!activeListId) return;

    const activeList = lists[activeListId];
    const overListId = lists[overId] ? overId : findListContainingCard(overId);

    if (!overListId || activeListId !== overListId) return;

    const oldIndex = activeList.cardIds.indexOf(activeId);
    const newIndex = activeList.cardIds.indexOf(overId);

    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reorderCardsInList(activeListId, oldIndex, newIndex);
    }
  };

  if (!activeBoard) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <p className="text-xl mb-4">暂无看板</p>
          <p className="text-sm">点击上方「新建看板」按钮创建一个新看板</p>
        </div>
      </div>
    );
  }

  const allCards = useStore.getState().cards;
  const activeCard = activeId ? allCards[activeId] || null : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 p-6 overflow-x-auto h-full">
        {boardLists.map((list) => (
          <ListComponent key={list.id} list={list} />
        ))}

        {isAddingList ? (
          <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4">
            <input
              type="text"
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              placeholder="输入列表名称"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddList}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
              >
                添加列表
              </button>
              <button
                onClick={() => {
                  setIsAddingList(false);
                  setNewListTitle('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingList(true)}
            className="flex-shrink-0 w-80 h-16 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="mr-2">+</span>
            <span>添加列表</span>
          </button>
        )}
      </div>

      <DragOverlay>
        {activeCard && <CardItem card={activeCard} />}
      </DragOverlay>
    </DndContext>
  );
};
