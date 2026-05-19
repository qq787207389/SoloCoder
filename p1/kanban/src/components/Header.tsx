import { BoardSelector } from './BoardSelector';
import { SearchFilter } from './SearchFilter';
import { DataManager } from './DataManager';

export const Header = () => {
  return (
    <header className="bg-white border-b px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">📋 看板</h1>
          <BoardSelector />
        </div>
        <DataManager />
      </div>
      <SearchFilter />
    </header>
  );
};
