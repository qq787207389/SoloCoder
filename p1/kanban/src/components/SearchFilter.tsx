import { useState } from 'react';
import { useStore } from '../store';
import { Priority } from '../types';
import { priorityLabels } from '../utils';

export const SearchFilter = () => {
  const {
    tags,
    searchQuery,
    filterTags,
    filterPriority,
    sortBy,
    setSearchQuery,
    setFilterTags,
    setFilterPriority,
    setSortBy,
  } = useStore();

  const [showTagDropdown, setShowTagDropdown] = useState(false);

  const tagList = Object.values(tags);

  const handleTagToggle = (tagId: string) => {
    if (filterTags.includes(tagId)) {
      setFilterTags(filterTags.filter((id) => id !== tagId));
    } else {
      setFilterTags([...filterTags, tagId]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索卡片标题或描述..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowTagDropdown(!showTagDropdown)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 ${
            filterTags.length > 0 ? 'border-blue-500 bg-blue-50' : ''
          }`}
        >
          <span>标签</span>
          {filterTags.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {filterTags.length}
            </span>
          )}
        </button>
        {showTagDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[150px]">
            {tagList.length === 0 ? (
              <div className="px-4 py-2 text-gray-500 text-sm">暂无标签</div>
            ) : (
              tagList.map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filterTags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    className="rounded"
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      <select
        value={filterPriority || ''}
        onChange={(e) => setFilterPriority((e.target.value as Priority) || null)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">全部优先级</option>
        <option value="high">🔴 {priorityLabels.high}</option>
        <option value="medium">🟡 {priorityLabels.medium}</option>
        <option value="low">🟢 {priorityLabels.low}</option>
      </select>

      <select
        value={sortBy || ''}
        onChange={(e) => setSortBy((e.target.value as 'dueDate' | 'priority') || null)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">默认排序</option>
        <option value="dueDate">按截止日期</option>
        <option value="priority">按优先级</option>
      </select>
    </div>
  );
};
