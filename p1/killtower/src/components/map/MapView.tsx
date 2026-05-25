import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { MapNode } from '../../game/types';
import { Swords, Crown, ShoppingBag, Tent, HelpCircle, Flame } from 'lucide-react';

const nodeIcons: Record<string, any> = {
  enemy: Swords,
  elite: Crown,
  boss: Crown,
  shop: ShoppingBag,
  campfire: Flame,
  event: HelpCircle,
  rest: Tent
};

const nodeColors: Record<string, string> = {
  enemy: 'from-red-600 to-red-800 border-red-500',
  elite: 'from-orange-500 to-orange-700 border-orange-400',
  boss: 'from-purple-600 to-purple-900 border-purple-400',
  shop: 'from-yellow-500 to-yellow-700 border-yellow-400',
  campfire: 'from-orange-500 to-red-600 border-orange-400',
  event: 'from-blue-500 to-blue-700 border-blue-400',
  rest: 'from-green-500 to-green-700 border-green-400'
};

export function MapView() {
  const { map, selectNode, gold, playerHp, playerMaxHp, floor } = useGameStore();

  if (!map) return null;

  const handleNodeClick = (node: MapNode) => {
    if (node.accessible && !node.completed) {
      selectNode(node.id);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-gray-950 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 100%)'
        }} />
      </div>

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700">
            <span className="text-gray-400 text-sm">层数</span>
            <span className="text-white font-bold ml-2 text-xl">{floor} / 15</span>
          </div>
          <div className="bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700">
            <span className="text-red-400">❤️</span>
            <span className="text-white font-bold ml-2">{playerHp} / {playerMaxHp}</span>
          </div>
        </div>
        <div className="bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700">
          <span className="text-yellow-400">💰</span>
          <span className="text-white font-bold ml-2">{gold}</span>
        </div>
      </div>

      <div className="absolute inset-0 pt-20 pb-8">
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {map.layers.flat().map(node => 
            node.connections.map(connId => {
              const targetNode = map.layers.flat().find(n => n.id === connId);
              if (!targetNode) return null;
              
              const x1 = node.x * window.innerWidth;
              const y1 = node.y * (window.innerHeight - 100) + 80;
              const x2 = targetNode.x * window.innerWidth;
              const y2 = targetNode.y * (window.innerHeight - 100) + 80;
              
              const isActive = node.visited || targetNode.accessible;
              
              return (
                <line
                  key={`${node.id}-${connId}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? '#6366f1' : '#374151'}
                  strokeWidth="3"
                  strokeDasharray={targetNode.accessible ? 'none' : '5,5'}
                  opacity={isActive ? 1 : 0.3}
                />
              );
            })
          )}
        </svg>

        {map.layers.flat().map(node => {
          const Icon = nodeIcons[node.type] || HelpCircle;
          const x = node.x * window.innerWidth;
          const y = node.y * (window.innerHeight - 100) + 80;
          const isClickable = node.accessible && !node.completed;

          return (
            <motion.div
              key={node.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                isClickable ? 'hover:scale-110' : ''
              }`}
              style={{ left: x, top: y }}
              onClick={() => handleNodeClick(node)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: node.completed ? 0.8 : 1, 
                opacity: node.completed ? 0.4 : 1 
              }}
              transition={{ type: 'spring', stiffness: 300 }}
              whileHover={isClickable ? { scale: 1.1 } : {}}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br border-3 shadow-lg ${
                  nodeColors[node.type] || 'from-gray-600 to-gray-800 border-gray-500'
                } ${isClickable ? 'animate-pulse' : ''} ${
                  node.accessible && !node.completed ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
                }`}
                style={{ borderWidth: '3px' }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
              {node.completed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700">
        <div className="flex gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1"><Swords className="w-4 h-4 text-red-500" /> 敌人</div>
          <div className="flex items-center gap-1"><Crown className="w-4 h-4 text-orange-500" /> 精英</div>
          <div className="flex items-center gap-1"><ShoppingBag className="w-4 h-4 text-yellow-500" /> 商店</div>
          <div className="flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400" /> 篝火</div>
          <div className="flex items-center gap-1"><HelpCircle className="w-4 h-4 text-blue-500" /> 事件</div>
        </div>
      </div>
    </div>
  );
}
