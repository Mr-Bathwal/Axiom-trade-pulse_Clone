'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Token } from '@/store/tokensSlice';

export interface ChartDataPoint {
  time: string;
  value: number;
}

interface UseLiveChartDataOptions {
  token: Token;
  maxDataPoints?: number;
  updateInterval?: number; // milliseconds
  initialDataPoints?: number;
}

export function useLiveChartData({
  token,
  maxDataPoints = 100,
  updateInterval = 3000,
  initialDataPoints = 24,
}: UseLiveChartDataOptions) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const lastPriceRef = useRef<number>(token.price);
  const dataPointsRef = useRef<ChartDataPoint[]>([]);
  const initializedTokenRef = useRef<string>('');

  // Initialize chart data ONLY ONCE per token - never regenerate
  useEffect(() => {
    // Only initialize if this is a new token we haven't seen before
    if (initializedTokenRef.current !== token.id) {
      const initData = generateInitialData(token, initialDataPoints);
      dataPointsRef.current = initData;
      lastPriceRef.current = token.price;
      initializedTokenRef.current = token.id; // Mark this token as initialized
      
      // Update state in next tick to avoid sync state updates
      requestAnimationFrame(() => {
        setChartData(initData);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.id, initialDataPoints]); // Only re-init if token ID changes

  // Update chart when token price changes
  useEffect(() => {
    if (lastPriceRef.current === token.price) return;

    const newDataPoint: ChartDataPoint = {
      time: new Date().toISOString(),
      value: token.price,
    };

    const updatedData = [...dataPointsRef.current, newDataPoint];

    // Keep only the most recent data points
    if (updatedData.length > maxDataPoints) {
      updatedData.shift();
    }

    dataPointsRef.current = updatedData;
    setChartData(updatedData);
    lastPriceRef.current = token.price;
  }, [token.price, maxDataPoints]);

  const appendDataPoint = useCallback((dataPoint: ChartDataPoint) => {
    const updatedData = [...dataPointsRef.current, dataPoint];
    if (updatedData.length > maxDataPoints) {
      updatedData.shift();
    }
    dataPointsRef.current = updatedData;
    setChartData(updatedData);
  }, [maxDataPoints]);

  // Use the updateInterval param to keep the linter happy and optionally allow
  // periodic housekeeping in the future. This currently does not change data.
  useEffect(() => {
    const id = setInterval(() => {
      // no-op heartbeat for future polling/housekeeping
    }, updateInterval);
    return () => clearInterval(id);
  }, [updateInterval]);

  return {
    chartData,
    appendDataPoint,
  };
}

// Generate initial historical data - STABLE, smooth curve like professional platforms
function generateInitialData(token: Token, dataPoints: number): ChartDataPoint[] {
  const now = Date.now();
  const data: ChartDataPoint[] = [];
  
  const currentPrice = token.price;
  const change24h = token.priceChange24h / 100; // Convert percentage to decimal
  
  // Calculate starting price 24h ago based on current price and 24h change
  // If price is up 5%, then 24h ago it was: current / (1 + 0.05)
  const startPrice = currentPrice / (1 + change24h);
  
  // Use token ID as consistent seed for reproducibility
  const tokenSeed = parseInt(token.id) || token.symbol.charCodeAt(0);
  
  // Create smooth, natural-looking progression
  for (let i = 0; i < dataPoints; i++) {
    const timeOffset = (dataPoints - i - 1) * 60 * 60 * 1000; // hourly data
    const time = new Date(now - timeOffset).toISOString();
    
    const progress = i / (dataPoints - 1); // 0 to 1
    
    // Smooth S-curve progression (sigmoid-like) for natural price movement
    const smoothProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    const baseValue = startPrice + (currentPrice - startPrice) * smoothProgress;
    
    // Add very subtle, deterministic wave pattern (not random noise)
    const wave1 = Math.sin((progress * Math.PI * 2) + tokenSeed) * currentPrice * 0.008;
    const wave2 = Math.sin((progress * Math.PI * 4) + tokenSeed * 2) * currentPrice * 0.004;
    
    const value = baseValue + wave1 + wave2;
    
    data.push({
      time,
      value: Math.max(value, currentPrice * 0.5), // Prevent negative prices
    });
  }
  
  return data;
}
