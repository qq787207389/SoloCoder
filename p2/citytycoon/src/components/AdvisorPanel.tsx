import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useGame } from '../context/GameContext';

type TabType = 'population' | 'economy' | 'satisfaction' | 'landvalue';

export function AdvisorPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state } = useGame();
  const [activeTab, setActiveTab] = useState<TabType>('population');
  const { statistics } = state;

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'population', label: '人口', icon: '👥' },
    { key: 'economy', label: '经济', icon: '💰' },
    { key: 'satisfaction', label: '满意度', icon: '😊' },
    { key: 'landvalue', label: '地价', icon: '🏠' }
  ];

  const generateTimeLabels = (count: number) => {
    return Array.from({ length: count }, (_, i) => `t${i + 1}`);
  };

  const getChartOption = (tab: TabType) => {
    switch (tab) {
      case 'population':
        return {
          title: { text: '人口增长', left: 'center', textStyle: { color: '#fff', fontSize: 14 } },
          tooltip: { trigger: 'axis' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: generateTimeLabels(statistics.populationHistory.length),
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' },
            splitLine: { lineStyle: { color: '#333' } }
          },
          series: [{
            name: '人口',
            type: 'line',
            smooth: true,
            data: statistics.populationHistory,
            lineStyle: { color: '#3b82f6', width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                  { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                ]
              }
            },
            itemStyle: { color: '#3b82f6' }
          }],
          backgroundColor: 'transparent'
        };

      case 'economy':
        return {
          title: { text: '资金变化', left: 'center', textStyle: { color: '#fff', fontSize: 14 } },
          tooltip: { trigger: 'axis', formatter: '{b}: ¥{c}' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: generateTimeLabels(statistics.moneyHistory.length),
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999', formatter: '¥{value}' },
            splitLine: { lineStyle: { color: '#333' } }
          },
          series: [{
            name: '资金',
            type: 'line',
            smooth: true,
            data: statistics.moneyHistory,
            lineStyle: { color: '#22c55e', width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(34, 197, 94, 0.3)' },
                  { offset: 1, color: 'rgba(34, 197, 94, 0.05)' }
                ]
              }
            },
            itemStyle: { color: '#22c55e' }
          }],
          backgroundColor: 'transparent'
        };

      case 'satisfaction':
        return {
          title: { text: '市民满意度', left: 'center', textStyle: { color: '#fff', fontSize: 14 } },
          tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: generateTimeLabels(statistics.satisfactionHistory.length),
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999', formatter: '{value}%' },
            splitLine: { lineStyle: { color: '#333' } }
          },
          series: [{
            name: '满意度',
            type: 'line',
            smooth: true,
            data: statistics.satisfactionHistory,
            lineStyle: { color: '#f59e0b', width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
                  { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
                ]
              }
            },
            itemStyle: { color: '#f59e0b' }
          }],
          backgroundColor: 'transparent'
        };

      case 'landvalue':
        return {
          title: { text: '平均地价', left: 'center', textStyle: { color: '#fff', fontSize: 14 } },
          tooltip: { trigger: 'axis', formatter: '{b}: ¥{c}' },
          grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: generateTimeLabels(statistics.landValueHistory.length),
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999' }
          },
          yAxis: {
            type: 'value',
            axisLine: { lineStyle: { color: '#666' } },
            axisLabel: { color: '#999', formatter: '¥{value}' },
            splitLine: { lineStyle: { color: '#333' } }
          },
          series: [{
            name: '地价',
            type: 'line',
            smooth: true,
            data: statistics.landValueHistory,
            lineStyle: { color: '#a855f7', width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(168, 85, 247, 0.3)' },
                  { offset: 1, color: 'rgba(168, 85, 247, 0.05)' }
                ]
              }
            },
            itemStyle: { color: '#a855f7' }
          }],
          backgroundColor: 'transparent'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl w-4/5 max-w-4xl h-4/5 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold flex items-center gap-2">
            📊 顾问报告
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-gray-800 text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <ReactECharts
            option={getChartOption(activeTab)}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{state.population}</div>
              <div className="text-xs text-gray-400">总人口</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">¥{statistics.dailyTaxRevenue}</div>
              <div className="text-xs text-gray-400">每日税收</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">¥{statistics.dailyExpenses}</div>
              <div className="text-xs text-gray-400">每日支出</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(state.averageSatisfaction)}%
              </div>
              <div className="text-xs text-gray-400">平均满意度</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
