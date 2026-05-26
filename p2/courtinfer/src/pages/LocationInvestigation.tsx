import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Eye, User } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useParams, useNavigate } from 'react-router-dom';
import type { Evidence } from '../types';

export default function LocationInvestigation() {
  const { locationId } = useParams<{ locationId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showEvidenceDetail, setShowEvidenceDetail] = useState<Evidence | null>(null);
  
  const gameStore = useGameStore();
  const { currentCase, collectEvidence, interviewedWitnesses, interviewWitness } = gameStore;

  const location = currentCase?.locations.find(l => l.id === locationId);
  const locationEvidence = location?.evidenceIds
    .map(id => currentCase?.evidence.find(e => e.id === id))
    .filter(Boolean) as Evidence[];
  
  const locationCharacters = location?.characterIds
    .map(id => currentCase?.characters.find(c => c.id === id))
    .filter(Boolean) || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !location) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const drawScene = () => {
      ctx.fillStyle = '#1a1f2e';
      ctx.fillRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width * 0.7
      );
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.1)');
      gradient.addColorStop(1, 'rgba(26, 31, 46, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      switch (location.type) {
        case 'crime_scene':
          drawCrimeScene(ctx, width, height);
          break;
        case 'police_archive':
          drawPoliceArchive(ctx, width, height);
          break;
        case 'forensics_lab':
          drawForensicsLab(ctx, width, height);
          break;
        case 'witness_home':
          drawWitnessHome(ctx, width, height);
          break;
        default:
          drawGenericScene(ctx, width, height);
      }

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);
    };

    drawScene();
  }, [location]);

  const drawCrimeScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.fillStyle = '#3d3d3d';
    for (let i = 0; i < 5; i++) {
      const x = (width / 6) * (i + 1);
      ctx.fillRect(x - 30, height * 0.3, 60, height * 0.3);
    }

    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.6);
    ctx.lineTo(width * 0.5, height * 0.5);
    ctx.lineTo(width * 0.7, height * 0.6);
    ctx.strokeStyle = '#8b0000';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.55, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
    ctx.fill();

    const particles = 20;
    for (let i = 0; i < particles; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.3})`;
      ctx.fill();
    }
  };

  const drawPoliceArchive = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        const x = 50 + i * 100;
        const y = 50 + j * 60;
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, 80, 50);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 5, y + 5, 70, 40);
      }
    }

    ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
  };

  const drawForensicsLab = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    const tableGradient = ctx.createLinearGradient(0, height * 0.5, 0, height);
    tableGradient.addColorStop(0, '#475569');
    tableGradient.addColorStop(1, '#334155');
    ctx.fillStyle = tableGradient;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(width * 0.2, height * 0.2, width * 0.6, height * 0.3);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(width * 0.2, height * 0.2, width * 0.6, height * 0.3);

    for (let i = 0; i < 5; i++) {
      const x = width * 0.3 + i * 100;
      ctx.beginPath();
      ctx.moveTo(x, height * 0.6);
      ctx.lineTo(x, height * 0.45);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, height * 0.4, 15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.fill();
    }
  };

  const drawWitnessHome = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, width, height);

    const wallGradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    wallGradient.addColorStop(0, '#44403c');
    wallGradient.addColorStop(1, '#292524');
    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, width, height * 0.6);

    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.fillStyle = '#1c1917';
    ctx.fillRect(width * 0.3, height * 0.35, width * 0.4, height * 0.15);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.35);
    ctx.lineTo(width * 0.35, height * 0.25);
    ctx.lineTo(width * 0.5, height * 0.2);
    ctx.lineTo(width * 0.65, height * 0.25);
    ctx.lineTo(width * 0.7, height * 0.35);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const x = width * 0.2 + i * 120;
      ctx.beginPath();
      ctx.arc(x, height * 0.75, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#78716c';
      ctx.fill();
    }
  };

  const drawGenericScene = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const handleCollectEvidence = (evidence: Evidence) => {
    if (evidence.discovered) {
      setShowEvidenceDetail(evidence);
    } else {
      collectEvidence(evidence.id);
      setShowEvidenceDetail(evidence);
    }
  };

  const handleInterviewWitness = (characterId: string) => {
    if (!interviewedWitnesses.includes(characterId)) {
      interviewWitness(characterId);
    }
  };

  const getEvidenceTypeLabel = (type: string) => {
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

  const getEvidenceTypeColor = (type: string) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => navigate('/investigation')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-amber-400">{location?.name}</h1>
            <p className="text-slate-400 text-sm">{location?.description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full rounded-xl border border-slate-700"
          />
        </motion.div>

        {locationEvidence.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" />
              可收集的证据
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationEvidence.map((evidence, index) => (
                <motion.div
                  key={evidence.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleCollectEvidence(evidence)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all
                    ${evidence.discovered 
                      ? 'bg-slate-700/50 border-slate-600' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50'
                    }
                  `}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-200">
                      {evidence.discovered ? evidence.name : '未知证据'}
                    </h3>
                    {evidence.discovered && (
                      <span className={`text-xs px-2 py-1 rounded border ${getEvidenceTypeColor(evidence.type)}`}>
                        {getEvidenceTypeLabel(evidence.type)}
                      </span>
                    )}
                  </div>
                  {evidence.discovered && (
                    <p className="text-sm text-slate-400">{evidence.description}</p>
                  )}
                  {!evidence.discovered && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <Eye className="w-4 h-4" />
                      点击调查
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {locationCharacters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              可询问的人员
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locationCharacters.map((character, index) => (
                <motion.div
                  key={character?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => character && handleInterviewWitness(character.id)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all
                    ${interviewedWitnesses.includes(character?.id || '') 
                      ? 'bg-slate-700/50 border-slate-600' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200">{character?.name}</h3>
                      <p className="text-sm text-slate-400">{character?.description}</p>
                    </div>
                    {interviewedWitnesses.includes(character?.id || '') && (
                      <span className="ml-auto text-xs px-2 py-1 bg-green-600/20 text-green-400 rounded">
                        已询问
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {showEvidenceDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowEvidenceDetail(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800 rounded-xl p-6 max-w-md mx-4 border border-slate-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-amber-400">{showEvidenceDetail.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded border ${getEvidenceTypeColor(showEvidenceDetail.type)}`}>
                      {getEvidenceTypeLabel(showEvidenceDetail.type)}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">可靠度</p>
                    <p className="text-lg font-bold text-amber-400">{showEvidenceDetail.reliability}%</p>
                  </div>
                </div>
                <p className="text-slate-300 mb-4">{showEvidenceDetail.description}</p>
                {showEvidenceDetail.contradictions.length > 0 && (
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-500 mb-2">可反驳的陈述：</p>
                    {showEvidenceDetail.contradictions.map((c, i) => (
                      <p key={i} className="text-sm text-red-400">• {c}</p>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowEvidenceDetail(null)}
                  className="mt-4 w-full py-2 bg-amber-600 text-slate-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors"
                >
                  关闭
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
