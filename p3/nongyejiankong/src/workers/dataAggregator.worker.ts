interface HistoryDataPoint {
  timestamp: number;
  [key: string]: number;
}

interface AggregateOptions {
  data: HistoryDataPoint[];
  targetPoints: number;
  metrics: string[];
}

const aggregateData = (options: AggregateOptions): HistoryDataPoint[] => {
  const { data, targetPoints, metrics } = options;
  
  if (data.length <= targetPoints) {
    return data;
  }
  
  const aggregated: HistoryDataPoint[] = [];
  const bucketSize = Math.ceil(data.length / targetPoints);
  
  for (let i = 0; i < data.length; i += bucketSize) {
    const bucket = data.slice(i, i + bucketSize);
    const firstPoint = bucket[0];
    const lastPoint = bucket[bucket.length - 1];
    
    const aggregatedPoint: HistoryDataPoint = {
      timestamp: Math.floor((firstPoint.timestamp + lastPoint.timestamp) / 2),
    };
    
    for (const metric of metrics) {
      const values = bucket.map(p => p[metric]).filter(v => v !== undefined);
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        
        aggregatedPoint[`${metric}_min`] = min;
        aggregatedPoint[`${metric}_max`] = max;
        aggregatedPoint[`${metric}_avg`] = avg;
        aggregatedPoint[metric] = avg;
      }
    }
    
    aggregated.push(aggregatedPoint);
  }
  
  return aggregated;
};

self.onmessage = (event: MessageEvent<AggregateOptions>) => {
  try {
    const result = aggregateData(event.data);
    self.postMessage(result);
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage([]);
  }
};

export {};
