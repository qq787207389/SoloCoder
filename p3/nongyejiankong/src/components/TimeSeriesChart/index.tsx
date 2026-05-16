import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';
import { useAppContext } from '../../store/AppContext';
import { SENSOR_CONFIG } from '../../utils/constants';
import { HistoryDataPoint } from '../../types';
import './TimeSeriesChart.scss';

const TARGET_DATA_POINTS = 1000;

export const TimeSeriesChart: React.FC = () => {
  useAppContext();
  const chartRef = useRef<ReactECharts>(null);
  const [rawData, setRawData] = useState<HistoryDataPoint[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['temperature', 'humidity']);

  useEffect(() => {
    const generateMockData = () => {
      const data: HistoryDataPoint[] = [];
      const now = Date.now();
      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
      
      for (let t = twentyFourHoursAgo; t <= now; t += 60000) {
        data.push({
          timestamp: t,
          temperature: 22 + Math.sin(t / 3600000) * 5 + Math.random() * 2,
          humidity: 60 + Math.sin(t / 7200000) * 15 + Math.random() * 5,
          light: 50000 + Math.sin(t / 14400000) * 30000 + Math.random() * 5000,
          co2: 800 + Math.sin(t / 1800000) * 200 + Math.random() * 50,
          soilPh: 6.5 + Math.sin(t / 3600000) * 0.5 + Math.random() * 0.2,
        });
      }
      return data;
    };

    const mockData = generateMockData();
    setRawData(mockData);
  }, []);

  const aggregatedData = useMemo(() => {
    if (rawData.length <= TARGET_DATA_POINTS) {
      return rawData;
    }

    const aggregated: HistoryDataPoint[] = [];
    const bucketSize = Math.ceil(rawData.length / TARGET_DATA_POINTS);

    for (let i = 0; i < rawData.length; i += bucketSize) {
      const bucket = rawData.slice(i, i + bucketSize);
      const firstPoint = bucket[0];
      const lastPoint = bucket[bucket.length - 1];

      const aggregatedPoint: HistoryDataPoint = {
        timestamp: Math.floor((firstPoint.timestamp + lastPoint.timestamp) / 2),
      };

      for (const metric of selectedMetrics) {
        const values = bucket.map(p => p[metric]).filter(v => v !== undefined);
        if (values.length > 0) {
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          aggregatedPoint[metric] = avg;
        }
      }

      aggregated.push(aggregatedPoint);
    }

    return aggregated;
  }, [rawData, selectedMetrics]);

  const toggleMetric = useCallback((metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  const getOption = useCallback((): EChartsOption => {
    const series = selectedMetrics.map(metric => ({
      name: SENSOR_CONFIG[metric as keyof typeof SENSOR_CONFIG].name,
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      sampling: 'lttb' as const,
      large: true,
      largeThreshold: 500,
      itemStyle: {
        color: SENSOR_CONFIG[metric as keyof typeof SENSOR_CONFIG].color,
      },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: SENSOR_CONFIG[metric as keyof typeof SENSOR_CONFIG].color + '40' },
            { offset: 1, color: SENSOR_CONFIG[metric as keyof typeof SENSOR_CONFIG].color + '05' },
          ],
        },
      },
      data: aggregatedData.map(d => [d.timestamp, d[metric]]),
    }));

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(30, 42, 58, 0.95)',
        borderColor: '#2d3748',
        textStyle: { color: '#e2e8f0' },
        formatter: (params: any) => {
          const date = new Date(params[0].axisValue);
          let result = `<div style="font-weight: 600; margin-bottom: 8px;">${date.toLocaleString()}</div>`;
          params.forEach((p: any) => {
            result += `<div style="display: flex; justify-content: space-between; gap: 20px;">
              <span style="color: ${p.color};">● ${p.seriesName}</span>
              <span style="font-weight: 600;">${p.value[1].toFixed(2)}</span>
            </div>`;
          });
          return result;
        },
      },
      legend: {
        show: false,
      },
      grid: {
        left: 60,
        right: 20,
        top: 20,
        bottom: 60,
      },
      xAxis: {
        type: 'time',
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#718096', fontSize: 11 },
        splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#718096', fontSize: 11 },
        splitLine: { lineStyle: { color: '#2d3748', type: 'dashed' } },
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          height: 20,
          bottom: 10,
          borderColor: '#4a5568',
          fillerColor: 'rgba(74, 85, 104, 0.3)',
          handleStyle: { color: '#718096' },
          textStyle: { color: '#718096' },
        },
      ],
      series,
    };
  }, [aggregatedData, selectedMetrics]);

  return (
    <div className="time-series-chart">
      <div className="time-series-chart__header">
        <h3 className="time-series-chart__title">24小时历史数据</h3>
        <div className="time-series-chart__legend">
          {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
            <button
              key={key}
              className={`time-series-chart__legend-btn ${
                selectedMetrics.includes(key) ? 'time-series-chart__legend-btn--active' : ''
              }`}
              style={{ 
                borderColor: selectedMetrics.includes(key) ? config.color : 'transparent',
                color: selectedMetrics.includes(key) ? config.color : '#718096'
              }}
              onClick={() => toggleMetric(key)}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>
      <div className="time-series-chart__chart">
        <ReactECharts
          ref={chartRef}
          option={getOption()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={false}
        />
      </div>
    </div>
  );
};
