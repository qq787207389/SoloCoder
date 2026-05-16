import React from 'react';
import { AppProvider, useAppContext } from './store/AppContext';
import { SensorCards } from './components/SensorCards';
import { TimeSeriesChart } from './components/TimeSeriesChart';
import { Greenhouse3D } from './components/Greenhouse3D';
import { DeviceControl } from './components/DeviceControl';
import { AlarmLog } from './components/AlarmLog';
import './App.scss';

const AppContent: React.FC = () => {
  const { state, toggleFullscreen } = useAppContext();

  return (
    <div className={`dashboard ${state.isFullscreen ? 'dashboard--fullscreen' : ''}`}>
      <header className="dashboard__header">
        <div className="dashboard__title-section">
          <h1 className="dashboard__title">温室大棚环境监控中心</h1>
          <div className="dashboard__status">
            <span className={`dashboard__status-indicator dashboard__status-indicator--${
              state.wsStatus === 'connected' ? 'connected' : 
              state.wsStatus === 'connecting' ? 'connecting' : 'disconnected'
            }`} />
            <span className="dashboard__status-text">
              {state.wsStatus === 'connected' ? 'WebSocket 已连接' : 
               state.wsStatus === 'connecting' ? '连接中...' : '已断开'}
            </span>
          </div>
        </div>
        <button
          className="dashboard__fullscreen-btn"
          onClick={toggleFullscreen}
        >
          {state.isFullscreen ? '退出全屏' : '全屏模式'}
        </button>
      </header>

      <div className="dashboard__sensor-cards">
        <SensorCards />
      </div>

      <div className="dashboard__main-grid">
        <div className="dashboard__chart-section">
          <TimeSeriesChart />
        </div>
        
        <div className="dashboard__right-panel">
          <div className="dashboard__3d-section">
            <Greenhouse3D />
          </div>
          
          <div className="dashboard__device-section">
            <DeviceControl />
          </div>
        </div>
      </div>

      <div className="dashboard__alarm-section">
        <AlarmLog />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};
