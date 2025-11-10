'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, LineData } from 'lightweight-charts';

interface PriceChartProps {
  data: { time: string; value: number }[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  enableLiveUpdates?: boolean; // Enable smooth real-time updates
}

export function PriceChart({ 
  data, 
  width = 600, 
  height = 300, 
  isPositive = true,
  enableLiveUpdates = false 
}: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const lastDataLengthRef = useRef<number>(0);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width,
      height,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#ffffff40',
      },
      grid: {
        vertLines: { color: '#ffffff08' },
        horzLines: { color: '#ffffff08' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#ffffff20',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: '#ffffff20',
          width: 1,
          style: 3,
        },
      },
      rightPriceScale: {
        borderColor: '#ffffff10',
        textColor: '#ffffff60',
      },
      timeScale: {
        borderColor: '#ffffff10',
        timeVisible: true,
      },
    });

    // Create area series
    // Use addSeries and allow a local explicit-any cast; lightweight-charts typings
    // for this call are restrictive for the library version in package.json.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const areaSeries = chart.addSeries('Area' as any, {
      topColor: isPositive ? '#10b98140' : '#ef444440',
      bottomColor: 'transparent',
      lineColor: isPositive ? '#10b981' : '#ef4444',
      lineWidth: 2,
    });

  chartRef.current = chart;
  seriesRef.current = areaSeries as unknown as ISeriesApi<'Area'>;

    // Set data
    if (data.length > 0) {
      areaSeries.setData(data);
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [width, height, isPositive, data]);

  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;

    if (enableLiveUpdates && data.length > lastDataLengthRef.current) {
      // Append only the new data points for smooth live updates
      const newDataPoints = data.slice(lastDataLengthRef.current);
      newDataPoints.forEach((point) => {
        seriesRef.current?.update(point as LineData);
      });
      lastDataLengthRef.current = data.length;
    } else {
      // Replace all data (initial load or full refresh)
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
      lastDataLengthRef.current = data.length;
    }
  }, [data, enableLiveUpdates]);

  return <div ref={chartContainerRef} className="w-full" />;
}
