import React, { useState } from 'react';
import { useAppContext } from '../../store/AppContext';
import { DEVICE_CONFIG } from '../../utils/constants';
import { Device } from '../../types';
import './DeviceControl.scss';

export const DeviceControl: React.FC = () => {
  const { state, updateDevice } = useAppContext();
  const [controllingId, setControllingId] = useState<string | null>(null);
  const [confirmAnimation, setConfirmAnimation] = useState<string | null>(null);
  const [errorAnimation, setErrorAnimation] = useState<string | null>(null);

  const toggleDevice = async (device: Device) => {
    setControllingId(device.id);
    
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('控制失败'));
          }
        }, 800);
      });

      updateDevice({
        ...device,
        status: device.status === 'on' ? 'off' : 'on',
        runningTime: device.status === 'on' ? device.runningTime : device.runningTime + 3600,
      });

      setConfirmAnimation(device.id);
      setTimeout(() => setConfirmAnimation(null), 1000);
    } catch (error) {
      setErrorAnimation(device.id);
      setTimeout(() => setErrorAnimation(null), 1500);
    } finally {
      setControllingId(null);
    }
  };

  const formatRunningTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    }
    return `${minutes}分钟`;
  };

  return (
    <div className="device-control">
      <h3 className="device-control__title">设备控制面板</h3>
      
      <div className="device-control__grid">
        {state.devices.map((device) => {
          const config = DEVICE_CONFIG[device.type];
          const isControlling = controllingId === device.id;
          const isConfirming = confirmAnimation === device.id;
          const hasError = errorAnimation === device.id;

          return (
            <div
              key={device.id}
              className={`device-control__card ${
                device.status === 'on' ? 'device-control__card--on' : ''
              } ${isConfirming ? 'device-control__card--confirm' : ''} ${
                hasError ? 'device-control__card--error' : ''
              }`}
            >
              <div className="device-control__header">
                <span className="device-control__icon">{config.icon}</span>
                <span className="device-control__name">{device.name}</span>
              </div>

              <div className="device-control__status">
                <span className={`device-control__status-indicator ${
                  device.status === 'on' ? 'device-control__status-indicator--on' : ''
                }`} />
                <span className="device-control__status-text">
                  {device.status === 'on' ? '运行中' : '已关闭'}
                </span>
              </div>

              <div className="device-control__info">
                <div className="device-control__info-item">
                  <span className="device-control__info-label">运行时长</span>
                  <span className="device-control__info-value">
                    {formatRunningTime(device.runningTime)}
                  </span>
                </div>
                <div className="device-control__info-item">
                  <span className="device-control__info-label">功率</span>
                  <span className="device-control__info-value">{device.power}W</span>
                </div>
              </div>

              <button
                className={`device-control__toggle ${
                  device.status === 'on' ? 'device-control__toggle--on' : ''
                } ${isControlling ? 'device-control__toggle--loading' : ''}`}
                onClick={() => toggleDevice(device)}
                disabled={isControlling}
              >
                {isControlling ? (
                  <span className="device-control__spinner" />
                ) : (
                  device.status === 'on' ? '关闭' : '开启'
                )}
              </button>

              {isConfirming && (
                <div className="device-control__toast device-control__toast--success">
                  ✓ 操作成功
                </div>
              )}
              {hasError && (
                <div className="device-control__toast device-control__toast--error">
                  ✗ 控制失败，请重试
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
