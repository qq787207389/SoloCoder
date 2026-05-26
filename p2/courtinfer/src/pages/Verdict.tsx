import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Trophy, Skull, RefreshCcw, Home, FileText, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';

export default function Verdict() {
  const navigate = useNavigate();
  const gameStore = useGameStore();
  const { currentCase, juryInclination, discoveredEvidence, returnToMenu, resetGame } = gameStore;
  
  const [showDetails, setShowDetails] = useState(false);
  const [verdict, setVerdict] = useState<'innocent' | 'guilty' | null>(null);
  const [truthRevealed, setTruthRevealed] = useState(false);

  useEffect(() => {
    if (juryInclination > 0) {
      setVerdict('innocent');
    } else {
      setVerdict('guilty');
    }
    
    const timer = setTimeout(() => {
      setTruthRevealed(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [juryInclination]);

  if (!currentCase) {
    return null;
  }

  const truthDiscoveryLevel = (() => {
    const keyEvidenceFound = currentCase.truth.keyEvidenceChain.filter(evId => 
      discoveredEvidence.includes(evId)
    ).length;
    return Math.round((keyEvidenceFound / currentCase.truth.keyEvidenceChain.length) * 100);
  })();

  const getEnding = () => {
    if (verdict === 'innocent' && truthDiscoveryLevel >= 80) {
      return {
        title: '完美胜利',
        description: '你成功为委托人辩护，并揭露了案件的全部真相！真正的罪犯被绳之以法，正义得到了伸张。',
        color: 'from-green-600 to-emerald-500',
        icon: Trophy
      };
    } else if (verdict === 'innocent' && truthDiscoveryLevel >= 50) {
      return {
        title: '辩护成功',
        description: '你成功为委托人辩护，使其获得了无罪判决。虽然还有一些谜团未解，但你的当事人重获自由。',
        color: 'from-blue-600 to-cyan-500',
        icon: Scale
      };
    } else if (verdict === 'innocent') {
      return {
        title: '险胜',
        description: '尽管证据不足，你还是成功说服了陪审团。但案件的真相可能永远被埋葬...',
        color: 'from-amber-600 to-yellow-500',
        icon: Scale
      };
    } else {
      return {
        title: '辩护失败',
        description: '陪审团做出了有罪判决。你的当事人将面临法律的制裁，也许你错过了一些关键证据...',
        color: 'from-red-600 to-rose-500',
        icon: Skull
      };
    }
  };

  const ending = getEnding();
  const culpritCharacter = currentCase.characters.find(c => c.id === currentCase.truth.realCulprit);

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  const handleReturnToMenu = () => {
    returnToMenu();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="mb-4"
          >
            <Scale className="w-20 h-20 text-amber-400 mx-auto" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-4xl font-bold text-amber-400 mb-2" style={{ fontFamily: 'serif' }}>
            法庭裁决
          </h1>
          <p className="text-slate-400">{currentCase.title}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {verdict && (
            <motion.div
              key={verdict}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`
                rounded-2xl p-8 mb-8 text-center
                bg-gradient-to-r ${ending.color}
                shadow-2xl
              `}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.5 }}
                className="mb-4"
              >
                <ending.icon className="w-24 h-24 mx-auto text-white" strokeWidth={1.5} />
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-3xl font-bold text-white mb-4"
              >
                {verdict === 'innocent' ? '无罪释放' : '有罪判决'}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-white/90 text-lg"
              >
                {ending.title}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {truthRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-slate-200">案件真相</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="text-sm text-slate-500">真凶</p>
                    <p className="text-lg font-semibold text-slate-200">{culpritCharacter?.name}</p>
                    <p className="text-sm text-slate-400">{culpritCharacter?.description}</p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-500 mb-2">动机</p>
                  <p className="text-slate-300">{currentCase.truth.motive}</p>
                </div>

                <div className="border-t border-slate-700 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-500">真相揭露程度</p>
                    <p className="text-sm font-semibold text-amber-400">{truthDiscoveryLevel}%</p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${truthDiscoveryLevel}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className={`h-3 rounded-full ${
                        truthDiscoveryLevel >= 80 ? 'bg-green-500' :
                        truthDiscoveryLevel >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full mt-4 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  {showDetails ? '隐藏详情' : '查看更多详情'}
                </motion.button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-700 pt-4 space-y-2">
                        <p className="text-sm text-slate-500 mb-2">隐藏细节：</p>
                        {currentCase.truth.hiddenDetails.map((detail, index) => (
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="text-sm text-slate-400 pl-4 border-l-2 border-amber-500/30"
                          >
                            • {detail}
                          </motion.p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAgain}
            className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-slate-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-400 transition-all"
          >
            <RefreshCcw className="w-5 h-5" />
            新案件
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReturnToMenu}
            className="flex items-center justify-center gap-2 py-4 bg-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-600 transition-all"
          >
            <Home className="w-5 h-5" />
            返回主菜单
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-sm">
            陪审团倾向: {juryInclination > 0 ? '+' : ''}{juryInclination} | 
            已收集证据: {discoveredEvidence.length} / {currentCase.evidence.length}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
