import { useState } from 'react';
import { useStore } from '../store';

export const BoardSelector = () => {
  const { boards, activeBoardId, setActiveBoard, addBoard, renameBoard, deleteBoard } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const boardList = Object.values(boards);

  const handleAddBoard = () => {
    if (newBoardTitle.trim()) {
      addBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setIsAdding(false);
    }
  };

  const handleRenameBoard = (id: string) => {
    if (editingTitle.trim()) {
      renameBoard(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {boardList.map((board) => (
        <div key={board.id} className="relative group">
          {editingId === board.id ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onBlur={() => handleRenameBoard(board.id)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameBoard(board.id)}
              className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setActiveBoard(board.id)}
              className={`px-4 py-1.5 rounded-lg font-medium transition-colors ${
                activeBoardId === board.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {board.title}
            </button>
          )}
          {activeBoardId === board.id && !editingId && boardList.length > 1 && (
            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(board.id);
                  setEditingTitle(board.title);
                }}
                className="w-5 h-5 bg-gray-500 text-white rounded-full text-xs hover:bg-gray-600 mr-0.5"
              >
                ✎
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('确定要删除这个看板吗？')) {
                    deleteBoard(board.id);
                  }
                }}
                className="w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
      ))}
      {isAdding ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBoard()}
            placeholder="看板名称"
            className="px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
            autoFocus
          />
          <button
            onClick={handleAddBoard}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            添加
          </button>
          <button
            onClick={() => {
              setIsAdding(false);
              setNewBoardTitle('');
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-gray-400 hover:text-gray-600"
        >
          + 新建看板
        </button>
      )}
    </div>
  );
};
