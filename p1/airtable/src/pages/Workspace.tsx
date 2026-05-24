import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Toolbar } from '../components/layout/Toolbar';
import { VirtualTable } from '../components/table/VirtualTable';
import { CardView } from '../components/card/CardView';
import { RecordModal } from '../components/common/RecordModal';
import { useTableStore } from '../store/useTableStore';
import { registerAllColumnTypes } from '../components/columns/registerColumns';
import { initCollaboration } from '../store/useTableStore';

registerAllColumnTypes();

export function Workspace() {
  const { currentView } = useTableStore();
  const [selectedRecord, setSelectedRecord] = useState<{ tableId: string; recordId: string } | null>(null);

  useEffect(() => {
    initCollaboration();
  }, []);

  const handleRecordClick = (tableId: string, recordId: string) => {
    setSelectedRecord({ tableId, recordId });
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Toolbar />
          <div className="flex-1 overflow-hidden">
            {currentView.type === 'table' ? (
              <VirtualTable onRecordClick={handleRecordClick} />
            ) : (
              <CardView onRecordClick={handleRecordClick} />
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <RecordModal
          tableId={selectedRecord.tableId}
          recordId={selectedRecord.recordId}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
