import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Evidence, EvidenceType } from '../types';

interface EvidenceBookProps {
  onSelect?: (evidence: Evidence) => void;
  selectable?: boolean;
  compact?: boolean;
}

export default function EvidenceBook({ onSelect, selectable = false, compact = false }: EvidenceBookProps) {
  const gameStore = useGameStore();
  const { currentCase, showEvidenceBook, toggleEvidenceBook, selectedEvidenceId, selectEvidence } = gameStore;
  
  const [filter, setFilter] = useState<EvidenceType | 'all'>('all');
  const [showDetail, setShowDetail] = useState<Evidence | null>(null);

  if (!currentCase) return null;

  const discoveredEvidence = currentCase.evidence.filter(e => e.discovered);
  
  const filteredEvidence = filter === 'all' 
    ? discoveredEvidence 
    : discoveredEvidence.filter(e => e.type === filter);

  const getEvidenceTypeLabel = (type: EvidenceType) => {
    switch (type) {
      case 'physical':
        return '物证';
      case 'testimony':
        return '人证';
      case 'forensic':
        return '鉴定报告';
      default:
        return '证据';
    }
  };

  const getEvidenceTypeColor = (type: EvidenceType) => {
    switch (type) {
      case 'physical':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'testimony':
        return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'forensic':
        return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      default:
        return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
    }
  };

  const getReliabilityColor = (reliability: number) => {
    if (reliability >= 80) return 'text-green-400';
    if (reliability >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleEvidenceClick = (evidence: Evidence) => {
    if (selectable && onSelect) {
      onSelect(evidence);
      selectEvidence(evidence.id);
    } else {
      setShowDetail(evidence);
    }
  };

  if (compact) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-amber-400">证据簿</h3>
          <span className="text-sm text-slate-500">{discoveredEvidence.length} 件证据</span>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredEvidence.map((evidence) => (
            <motion.div
              key={evidence.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleEvidenceClick(evidence)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                ${selectedEvidenceId === evidence.id 
                  ? 'bg-amber-600/20 border-amber-500/50' 
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded border ${getEvidenceTypeColor(evidence.type)}`}>
                    {getEvidenceTypeLabel(evidence.type)}
                  </span>
                  <span className="font-medium text-slate-200">{evidence.name}</span>
                </div>
                <span className={`text-sm font-semibold ${getReliabilityColor(evidence.reliability)}`}>
                  {evidence.reliability}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {showEvidenceBook && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={toggleEvidenceBook}
          />
          
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-slate-900 border-l border-slate-700 z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div>
                  <h2 className="text-2xl font-bold text-amber-400">证据簿</h2>
                  <p className="text-sm text-slate-500">
                    已收集 {discoveredEvidence.length} / {currentCase.evidence.length} 件证据
                  </p>
                </div>
                <button
                  onClick={toggleEvidenceBook}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="搜索证据..."
                      className="flex-1 bg-transparent border-none outline-none text-slate-300 placeholder-slate-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-500" />
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as EvidenceType | 'all')}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-300 outline-none"
                    >
                      <option value="all">全部</option>
                      <option value="physical">物证</option>
                      <option value="testimony">人证</option>
                      <option value="forensic">鉴定报告</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-4">
                  {filteredEvidence.map((evidence, index) => (
                    <motion.div
                      key={evidence.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => handleEvidenceClick(evidence)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${selectedEvidenceId === evidence.id 
                          ? 'bg-amber-600/20 border-amber-500/50' 
                          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full border ${getEvidenceTypeColor(evidence.type)}`}>
                            {getEvidenceTypeLabel(evidence.type)}
                          </span>
                          <h3 className="font-semibold text-lg text-slate-200">{evidence.name}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">可靠度</p>
                          <p className={`text-lg font-bold ${getReliabilityColor(evidence.reliability)}`}>
                            {evidence.reliability}%
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-400 mb-3">{evidence.description}</p>
                      
                      {evidence.contradictions.length > 0 && (
                        <div className="pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-1">可反驳的陈述：</p>
                          <div className="flex flex-wrap gap-2">
                            {evidence.contradictions.map((c, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {filteredEvidence.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">暂无证据</p>
                    <p className="text-sm mt-2">继续调查以收集更多证据</p>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showDetail && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/70 flex items-center justify-center z-50"
                  onClick={() => setShowDetail(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-800 rounded-xl p-6 max-w-lg mx-4 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-amber-400">{showDetail.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full border ${getEvidenceTypeColor(showDetail.type)}`}>
                          {getEvidenceTypeLabel(showDetail.type)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">可靠度</p>
                        <p className={`text-2xl font-bold ${getReliabilityColor(showDetail.reliability)}`}>
                          {showDetail.reliability}%
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-slate-300 mb-4">{showDetail.description}</p>
                    
                    {showDetail.contradictions.length > 0 && (
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm text-slate-500 mb-2">可反驳的陈述：</p>
                        {showDetail.contradictions.map((c, i) => (
                          <p key={i} className="text-sm text-red-400">• {c}</p>
                        ))}
                      </div>
                    )}
                    
                    <button
                      onClick={() => setShowDetail(null)}
                      className="mt-4 w-full py-2 bg-amber-600 text-slate-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors"
                    >
                      关闭
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
