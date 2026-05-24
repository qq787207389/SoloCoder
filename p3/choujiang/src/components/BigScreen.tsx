import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useStore } from '../store';
import type { Danmaku as DanmakuType, Winner, Participant } from '../types';

interface DanmakuItem extends DanmakuType {
  top: number;
  left: number;
  animationDuration: number;
}

export default function BigScreen() {
  const { checkIns, setCheckIns, prizeSetting, winners, setWinners, setDanmakus, isLotteryRunning, setIsLotteryRunning, currentLotteryLevel, setCurrentLotteryLevel, addWinner, participants } = useStore();
  const [activityName, setActivityName] = useState('');
  const [displayDanmakus, setDisplayDanmakus] = useState<DanmakuItem[]>([]);
  const [lotteryCandidates, setLotteryCandidates] = useState<Participant[]>([]);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [showWinners, setShowWinners] = useState<Winner[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const animationRef = useRef<number>();
  const danmakuIdRef = useRef(0);

  useEffect(() => {
    loadActivity();
    startPolling();
  }, []);

  const loadActivity = async () => {
    try {
      const activity = await api.getActivity();
      setActivityName(activity.name);
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  };

  const startPolling = () => {
    const poll = async () => {
      try {
        const [checkInsData, winnersData, danmakusData] = await Promise.all([
          api.getCheckIns(),
          api.getWinners(),
          api.getDanmakus(),
        ]);
        setCheckIns(checkInsData);
        setWinners(winnersData);
        setDanmakus(danmakusData);

        if (danmakusData.length > 0 && Math.random() > 0.7) {
          const randomDanmaku = danmakusData[Math.floor(Math.random() * danmakusData.length)];
          addDisplayDanmaku(randomDanmaku);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  };

  const addDisplayDanmaku = (danmaku: DanmakuType) => {
    const newDanmaku: DanmakuItem = {
      ...danmaku,
      id: `display-${danmakuIdRef.current++}`,
      top: Math.random() * 60 + 10,
      left: 100,
      animationDuration: 8 + Math.random() * 4,
    };
    setDisplayDanmakus((prev) => [...prev.slice(-20), newDanmaku]);

    setTimeout(() => {
      setDisplayDanmakus((prev) => prev.filter((d) => d.id !== newDanmaku.id));
    }, newDanmaku.animationDuration * 1000);
  };

  const startLottery = async (prizeLevelId: string) => {
    const level = prizeSetting.levels.find((l) => l.id === prizeLevelId);
    if (!level) return;

    const checkedInIds = checkIns.map((c) => c.participantId);
    const winnerIds = winners.map((w) => w.participantId);
    const eligible = participants.filter(
      (p) => checkedInIds.includes(p.id) && !winnerIds.includes(p.id)
    );

    if (eligible.length < level.count) {
      alert('可抽奖人数不足');
      return;
    }

    setIsLotteryRunning(true);
    setCurrentLotteryLevel(prizeLevelId);
    setLotteryCandidates(eligible);
    setShowWinners([]);

    let index = 0;
    const animate = () => {
      index = (index + 1) % eligible.length;
      setCurrentDisplayIndex(index);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  const stopLottery = async () => {
    if (!currentLotteryLevel) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    try {
      const level = prizeSetting.levels.find((l) => l.id === currentLotteryLevel);
      const newWinners = await api.drawLottery(currentLotteryLevel, level?.count || 1);
      
      setShowWinners(newWinners);
      newWinners.forEach((w) => addWinner(w));
      setShowConfetti(true);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
    } catch (error) {
      alert(error instanceof Error ? error.message : '抽奖失败');
    } finally {
      setIsLotteryRunning(false);
      setCurrentLotteryLevel(null);
    }
  };

  const currentLotteryLevelData = prizeSetting.levels.find((l) => l.id === currentLotteryLevel);
  const currentCandidate = lotteryCandidates[currentDisplayIndex];

  return (
    <div className="min-h-screen festival-bg relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-start gap-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-white w-full lg:w-auto lg:min-w-[280px]">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 truncate">{activityName}</h1>
            <div className="text-lg md:text-xl">
              已签到: <span className="text-yellow-300 font-bold text-2xl md:text-3xl">{checkIns.length}</span> 人
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 md:p-5 text-white w-full lg:w-auto lg:min-w-[200px]">
            <h2 className="text-base md:text-lg font-bold mb-2 md:mb-3">抽奖控制</h2>
            <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2">
              {prizeSetting.levels.map((level) => {
                const levelWinners = winners.filter((w) => w.prizeLevelId === level.id);
                const remaining = level.count - levelWinners.length;
                return (
                  <button
                    key={level.id}
                    onClick={() => isLotteryRunning ? undefined : startLottery(level.id)}
                    disabled={isLotteryRunning || remaining <= 0}
                    className={`px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium transition-all text-xs md:text-sm ${
                      isLotteryRunning && currentLotteryLevel === level.id
                        ? 'bg-red-500 text-white animate-pulse'
                        : remaining <= 0
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    {level.name} ({remaining}/{level.count})
                  </button>
                );
              })}
            </div>
            {isLotteryRunning && (
              <button
                onClick={stopLottery}
                className="mt-3 md:mt-4 w-full px-4 py-2 md:py-3 bg-red-500 text-white rounded-xl font-bold text-base md:text-lg hover:bg-red-600 transition-colors"
              >
                停止抽奖
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pt-48 md:pt-44 pb-32 px-4 md:px-8">
        <div className="grid grid-cols-10 gap-3 h-full overflow-hidden content-start">
          {checkIns.slice(0, 100).map((checkIn, index) => (
            <div
              key={checkIn.id}
              className="aspect-square rounded-full overflow-hidden border-4 border-white/50 shadow-lg animate-[fadeIn_0.5s_ease-out]"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img
                src={checkIn.participant.avatar}
                alt={checkIn.participant.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {displayDanmakus.map((danmaku) => (
        <div
          key={danmaku.id}
          className="absolute whitespace-nowrap text-xl font-bold pointer-events-none z-20"
          style={{
            top: `${danmaku.top}%`,
            color: danmaku.color,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            animation: `danmakuScroll ${danmaku.animationDuration}s linear forwards`,
          }}
        >
          <span className="mr-2 opacity-80">{danmaku.participantName}:</span>
          {danmaku.content}
        </div>
      ))}

      {isLotteryRunning && currentCandidate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="text-5xl text-white font-bold mb-8" style={{ color: currentLotteryLevelData?.color }}>
              🎉 {currentLotteryLevelData?.name} 抽奖中 🎉
            </div>
            <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-8 border-yellow-400 shadow-2xl mb-8 animate-[pulse_0.1s_ease-in-out_infinite]">
              <img
                src={currentCandidate.avatar}
                alt={currentCandidate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-6xl font-bold text-white animate-[bounce_0.5s_ease-in-out_infinite]">
              {currentCandidate.name}
            </div>
            <p className="text-2xl text-white/70 mt-4">点击"停止抽奖"定格</p>
          </div>
        </div>
      )}

      {showWinners.length > 0 && !isLotteryRunning && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-30">
          <div className="text-center animate-[bounce_0.5s_ease-in-out]">
            <div className="text-6xl mb-8">🎊 恭喜中奖 🎊</div>
            <div className="flex gap-8 justify-center flex-wrap mb-8">
              {showWinners.map((winner, index) => (
                <div
                  key={winner.id}
                  className="animate-[fadeIn_0.5s_ease-out]"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-yellow-400 shadow-2xl mb-4 mx-auto animate-[glow_1.5s_ease-in-out_infinite]">
                    <img
                      src={winner.participant.avatar}
                      alt={winner.participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {winner.participant.name}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: currentLotteryLevelData?.color }}>
                    {winner.prizeLevelName}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWinners([])}
              className="px-8 py-4 bg-white/20 text-white text-xl font-bold rounded-xl hover:bg-white/30 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#FFD700', '#FF69B4'][Math.floor(Math.random() * 7)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex justify-center gap-8">
          {prizeSetting.levels.map((level) => {
            const levelWinners = winners.filter((w) => w.prizeLevelId === level.id);
            return (
              <div key={level.id} className="text-center">
                <div className="text-lg font-bold mb-2" style={{ color: level.color }}>
                  {level.name} ({levelWinners.length}/{level.count})
                </div>
                <div className="flex gap-2">
                  {levelWinners.slice(0, 5).map((w) => (
                    <img
                      key={w.id}
                      src={w.participant.avatar}
                      alt={w.participant.name}
                      className="w-10 h-10 rounded-full border-2"
                      style={{ borderColor: level.color }}
                    />
                  ))}
                  {levelWinners.length > 5 && (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white text-sm">
                      +{levelWinners.length - 5}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes danmakuScroll {
          from {
            left: 100%;
          }
          to {
            left: -100%;
          }
        }
      `}</style>
    </div>
  );
}
