import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, ChevronRight, Gavel } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

export default function InvestigationMap() {
  const navigate = useNavigate();
  const gameStore = useGameStore();
  const { currentCase, actionPoints, maxActionPoints, visitedLocations, visitLocation, goToTrial } = gameStore;

  if (!currentCase) {
    return null;
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'crime_scene':
        return '🔍';
      case 'police_archive':
        return '📁';
      case 'forensics_lab':
        return '🔬';
      case 'witness_home':
        return '🏠';
      default:
        return '📍';
    }
  };

  const handleLocationClick = (locationId: string) => {
    const location = currentCase.locations.find(l => l.id === locationId);
    if (location && actionPoints >= location.actionPointCost) {
      visitLocation(locationId);
      navigate(`/investigation/${locationId}`);
    }
  };

  const handleGoToTrial = () => {
    goToTrial();
    navigate('/trial');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'serif' }}>
              {currentCase.title}
            </h1>
            <p className="text-slate-400">案件调查阶段</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoToTrial}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 font-bold rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all"
          >
            <Gavel className="w-5 h-5" />
            开庭
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-700"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-amber-400" />
              <div>
                <p className="text-sm text-slate-500">剩余行动点</p>
                <p className="text-2xl font-bold text-amber-400">{actionPoints} / {maxActionPoints}</p>
              </div>
            </div>
            
            <div className="h-12 w-px bg-slate-700" />
            
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-slate-500">已收集证据</p>
                <p className="text-2xl font-bold text-blue-400">
                  {currentCase.evidence.filter(e => e.discovered).length} / {currentCase.evidence.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-semibold text-slate-300 mb-4">可调查地点</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentCase.locations.map((location, index) => {
            const isVisited = visitedLocations.includes(location.id);
            const canAfford = actionPoints >= location.actionPointCost;
            
            return (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: canAfford ? 1.02 : 1, y: canAfford ? -4 : 0 }}
                onClick={() => handleLocationClick(location.id)}
                className={`
                  relative p-6 rounded-xl border transition-all cursor-pointer
                  ${isVisited 
                    ? 'bg-slate-700/50 border-slate-600' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50'
                  }
                  ${!canAfford && 'opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">
                    {getLocationIcon(location.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-200">
                        {location.name}
                      </h3>
                      {isVisited && (
                        <span className="text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
                          已调查
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-3">
                      {location.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span>{location.actionPointCost} 行动点</span>
                      </div>
                      
                      {canAfford && (
                        <ChevronRight className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>可能存在的证据：</span>
                    <div className="flex gap-1">
                      {location.evidenceIds.map((evId, i) => {
                        const evidence = currentCase.evidence.find(e => e.id === evId);
                        return (
                          <span 
                            key={i}
                            className={`
                              px-2 py-1 rounded
                              ${evidence?.discovered 
                                ? 'bg-blue-600/30 text-blue-300' 
                                : 'bg-slate-700/50 text-slate-500'
                              }
                            `}
                          >
                            {evidence?.discovered ? evidence.name : '???'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {actionPoints <= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 bg-amber-600/10 border border-amber-600/30 rounded-xl text-center"
          >
            <p className="text-amber-400 font-semibold mb-2">行动点已用尽</p>
            <p className="text-slate-400 text-sm">请前往法庭开始庭审</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
