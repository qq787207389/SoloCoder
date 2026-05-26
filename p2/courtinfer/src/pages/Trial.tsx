import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Users, ShieldAlert, AlertTriangle, ChevronRight, BookOpen } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useNavigate } from 'react-router-dom';
import EvidenceBook from './EvidenceBook';
import { checkContradiction } from '../systems/contradictionEngine';
import type { Evidence } from '../types';

export default function Trial() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showObjectionPanel, setShowObjectionPanel] = useState(false);
  const [objectionResult, setObjectionResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const gameStore = useGameStore();
  const { 
    currentCase, 
    currentPhase,
    juryInclination, 
    judgeTrust, 
    objectionsRemaining,
    currentWitnessIndex,
    currentTestimonyIndex,
    trialLog,
    advanceTestimony,
    presentObjection,
    toggleEvidenceBook,
    selectedEvidenceId
  } = gameStore;

  const currentWitness = currentCase?.witnesses[currentWitnessIndex];
  const currentTestimony = currentWitness?.testimony[currentTestimonyIndex];
  const witnessCharacter = currentCase?.characters.find(c => c.id === currentWitness?.characterId);

  useEffect(() => {
    if (currentPhase === 'verdict') {
      navigate('/verdict');
    }
  }, [currentPhase, navigate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(0, 0, width, height);

    const judgeGradient = ctx.createLinearGradient(width * 0.3, 0, width * 0.7, height * 0.4);
    judgeGradient.addColorStop(0, '#4a3728');
    judgeGradient.addColorStop(1, '#2d1f14');
    ctx.fillStyle = judgeGradient;
    ctx.fillRect(width * 0.3, 0, width * 0.4, height * 0.4);

    ctx.fillStyle = '#5c4033';
    ctx.fillRect(width * 0.25, height * 0.35, width * 0.5, height * 0.1);

    const juryGradient = ctx.createLinearGradient(0, height * 0.5, width, height * 0.7);
    juryGradient.addColorStop(0, '#2a2a3a');
    juryGradient.addColorStop(0.5, '#3a3a4a');
    juryGradient.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = juryGradient;
    ctx.fillRect(0, height * 0.5, width, height * 0.2);

    for (let i = 0; i < 7; i++) {
      const x = (width / 8) * (i + 1);
      ctx.beginPath();
      ctx.arc(x, height * 0.6, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x, height * 0.6, 15, 0, Math.PI * 2);
      ctx.fill();
    }

    const witnessStandGradient = ctx.createLinearGradient(width * 0.1, height * 0.75, width * 0.3, height);
    witnessStandGradient.addColorStop(0, '#3a3040');
    witnessStandGradient.addColorStop(1, '#2a2030');
    ctx.fillStyle = witnessStandGradient;
    ctx.fillRect(width * 0.1, height * 0.75, width * 0.2, height * 0.25);

    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.82, 25, 0, Math.PI * 2);
    ctx.fill();

    const defenseGradient = ctx.createLinearGradient(width * 0.7, height * 0.75, width * 0.9, height);
    defenseGradient.addColorStop(0, '#1a2a4a');
    defenseGradient.addColorStop(1, '#0a1a3a');
    ctx.fillStyle = defenseGradient;
    ctx.fillRect(width * 0.7, height * 0.75, width * 0.2, height * 0.25);

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.82, 25, 0, Math.PI * 2);
    ctx.fill();

    const prosecutionGradient = ctx.createLinearGradient(width * 0.4, height * 0.75, width * 0.6, height);
    prosecutionGradient.addColorStop(0, '#4a1a1a');
    prosecutionGradient.addColorStop(1, '#3a0a0a');
    ctx.fillStyle = prosecutionGradient;
    ctx.fillRect(width * 0.4, height * 0.75, width * 0.2, height * 0.25);

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.82, 25, 0, Math.PI * 2);
    ctx.fill();

    const lights = [
      { x: width * 0.2, y: height * 0.1, radius: 150 },
      { x: width * 0.8, y: height * 0.1, radius: 150 },
      { x: width * 0.5, y: height * 0.2, radius: 100 }
    ];

    lights.forEach(light => {
      const gradient = ctx.createRadialGradient(
        light.x, light.y, 0,
        light.x, light.y, light.radius
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
      gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    });

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
  }, []);

  const handleObjection = (evidence: Evidence) => {
    if (!currentTestimony || objectionsRemaining <= 0) return;

    const result = checkContradiction(evidence, currentTestimony);
    
    presentObjection(evidence.id, currentTestimony.id);
    
    setObjectionResult({
      success: result.canContradict,
      message: result.canContradict
        ? `异议成立！证据"${evidence.name}"与证词存在矛盾。`
        : `异议无效。证据"${evidence.name}"无法反驳该证词。`
    });
    
    setShowObjectionPanel(false);
    
    setTimeout(() => {
      setObjectionResult(null);
    }, 3000);
  };

  const getJuryColor = (inclination: number) => {
    if (inclination > 30) return 'text-green-400';
    if (inclination > 0) return 'text-yellow-400';
    if (inclination > -30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getJudgeColor = (trust: number) => {
    if (trust > 70) return 'text-green-400';
    if (trust > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-4"
        >
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-slate-500">陪审团倾向</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-slate-700 rounded-full h-3 mr-4">
                <motion.div
                  initial={{ width: '50%' }}
                  animate={{ width: `${(juryInclination + 100) / 2}%` }}
                  className={`h-3 rounded-full ${
                    juryInclination > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className={`font-bold ${getJuryColor(juryInclination)}`}>
                {juryInclination > 0 ? '+' : ''}{juryInclination}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-slate-500">法官信任度</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-full bg-slate-700 rounded-full h-3 mr-4">
                <motion.div
                  initial={{ width: '80%' }}
                  animate={{ width: `${judgeTrust}%` }}
                  className="h-3 rounded-full bg-blue-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className={`font-bold ${getJudgeColor(judgeTrust)}`}>
                {judgeTrust}%
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-slate-500">剩余异议次数</span>
            </div>
            <div className="text-3xl font-bold text-amber-400 text-center">
              {objectionsRemaining}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full rounded-xl border border-slate-700"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden"
        >
          <div className="bg-slate-700/50 px-6 py-3 border-b border-slate-600">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200">{witnessCharacter?.name}</h3>
                <p className="text-sm text-slate-500">{witnessCharacter?.description}</p>
              </div>
              {currentWitness?.isHostile && (
                <span className="ml-auto px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded-full">
                  敌意证人
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {currentTestimony && (
                <motion.div
                  key={currentTestimony.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <div className="bg-slate-900/50 rounded-xl p-6 border-l-4 border-amber-500">
                    <p className="text-lg text-slate-200 leading-relaxed">
                      "{currentTestimony.statement}"
                    </p>
                  </div>
                  
                  {currentTestimony.canBeContradicted && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-amber-400/70">
                      <AlertTriangle className="w-4 h-4" />
                      <span>这条证词可能存在矛盾，仔细检查你的证据</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowObjectionPanel(true)}
                disabled={objectionsRemaining <= 0}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                  ${objectionsRemaining > 0
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                <Gavel className="w-5 h-5" />
                提出异议
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={advanceTestimony}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                继续询问
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleEvidenceBook}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                证据簿
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 bg-slate-800/50 rounded-xl border border-slate-700 p-4"
        >
          <h3 className="text-sm font-semibold text-slate-500 mb-3">庭审记录</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {trialLog.slice(-5).map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`
                  text-sm px-3 py-2 rounded-lg
                  ${log.type === 'objection' 
                    ? 'bg-red-900/30 text-red-300' 
                    : log.type === 'objection_result'
                      ? log.success 
                        ? 'bg-green-900/30 text-green-300'
                        : 'bg-orange-900/30 text-orange-300'
                      : 'bg-slate-700/30 text-slate-400'
                  }
                `}
              >
                {log.content}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence>
          {showObjectionPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
              onClick={() => setShowObjectionPanel(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
              >
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-xl font-bold text-amber-400">选择证据提出异议</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    选择一份证据来反驳当前证词
                  </p>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <EvidenceBook 
                    compact 
                    selectable 
                    onSelect={handleObjection}
                  />
                </div>
                <div className="p-4 border-t border-slate-700 flex justify-end">
                  <button
                    onClick={() => setShowObjectionPanel(false)}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {objectionResult && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              className={`
                fixed bottom-8 left-1/2 -translate-x-1/2 z-50
                px-6 py-4 rounded-xl shadow-lg
                ${objectionResult.success 
                  ? 'bg-green-600 text-white' 
                  : 'bg-red-600 text-white'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {objectionResult.success ? (
                  <Gavel className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
                <span className="font-semibold">{objectionResult.message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
