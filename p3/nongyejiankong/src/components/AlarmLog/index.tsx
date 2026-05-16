import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../store/AppContext';
import { ALARM_LEVELS } from '../../utils/constants';
import './AlarmLog.scss';

export const AlarmLog: React.FC = () => {
  const { state, acknowledgeAlarm, addAlarm } = useAppContext();
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const levels = ['info', 'warning', 'danger'] as const;
        const level = levels[Math.floor(Math.random() * levels.length)];
        const sensors = state.sensors;
        const sensor = sensors[Math.floor(Math.random() * sensors.length)];
        
        addAlarm({
          sensorId: sensor.id,
          sensorName: sensor.name,
          level,
          message: `${sensor.name} ${level === 'danger' ? '超出阈值范围' : level === 'warning' ? '接近阈值' : '数据更新'}`,
          value: sensor.value,
          threshold: 30,
          acknowledged: false,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [addAlarm, state.sensors]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [state.alarms.length]);

  const playSound = (level: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (level === 'danger') {
      oscillator.frequency.value = 880;
      oscillator.type = 'square';
      gainNode.gain.value = 0.15;
    } else if (level === 'warning') {
      oscillator.frequency.value = 660;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
    } else {
      oscillator.frequency.value = 440;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.05;
    }
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    const latestAlarm = state.alarms[0];
    if (latestAlarm && !latestAlarm.acknowledged) {
      playSound(latestAlarm.level);
    }
  }, [state.alarms.length]);

  const filteredAlarms = filterLevel === 'all'
    ? state.alarms
    : state.alarms.filter(alarm => alarm.level === filterLevel);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const unacknowledgedCount = state.alarms.filter(a => !a.acknowledged).length;

  return (
    <div className="alarm-log">
      <div className="alarm-log__header">
        <h3 className="alarm-log__title">
          告警日志
          {unacknowledgedCount > 0 && (
            <span className="alarm-log__badge">{unacknowledgedCount}</span>
          )}
        </h3>
        <div className="alarm-log__filters">
          {['all', 'info', 'warning', 'danger'].map((level) => (
            <button
              key={level}
              className={`alarm-log__filter ${
                filterLevel === level ? 'alarm-log__filter--active' : ''
              }`}
              style={{
                borderColor: level === 'all' ? 'transparent' : ALARM_LEVELS[level as keyof typeof ALARM_LEVELS].color,
                color: level === 'all' ? '#a0aec0' : ALARM_LEVELS[level as keyof typeof ALARM_LEVELS].color,
              }}
              onClick={() => setFilterLevel(level)}
            >
              {level === 'all' ? '全部' : level === 'info' ? '信息' : level === 'warning' ? '警告' : '严重'}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="alarm-log__list">
        {filteredAlarms.length === 0 ? (
          <div className="alarm-log__empty">暂无告警</div>
        ) : (
          filteredAlarms.map((alarm, index) => (
            <div
              key={alarm.id}
              className={`alarm-log__item ${
                !alarm.acknowledged ? 'alarm-log__item--unread' : ''
              } ${index === 0 && !alarm.acknowledged ? 'alarm-log__item--new' : ''}`}
              style={{
                borderLeftColor: ALARM_LEVELS[alarm.level as keyof typeof ALARM_LEVELS].color,
              }}
            >
              <div className="alarm-log__item-header">
                <span
                  className="alarm-log__level"
                  style={{
                    backgroundColor: ALARM_LEVELS[alarm.level as keyof typeof ALARM_LEVELS].color,
                  }}
                >
                  {alarm.level === 'info' ? '信息' : alarm.level === 'warning' ? '警告' : '严重'}
                </span>
                <span className="alarm-log__time">{formatTime(alarm.timestamp)}</span>
              </div>
              <div className="alarm-log__message">{alarm.message}</div>
              <div className="alarm-log__details">
                <span className="alarm-log__sensor">{alarm.sensorName}</span>
                <span className="alarm-log__value">
                  当前值: {alarm.value.toFixed(1)} / 阈值: {alarm.threshold}
                </span>
              </div>
              {!alarm.acknowledged && (
                <button
                  className="alarm-log__acknowledge"
                  onClick={() => acknowledgeAlarm(alarm.id)}
                >
                  确认
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
