'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, LineData } from 'lightweight-charts';

interface MiniChartProps {
  data: { time: string; value: number }[];
  width?: number;
  height?: number;
  isPositive?: boolean;
  enableLiveUpdates?: boolean;
}

export function MiniChart({ 
  data, 
  width = 200, 
  height = 80, 
  isPositive = true,
  enableLiveUpdates = false 
}: MiniChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const lastDataLengthRef = useRef(0);

  // Create chart ONCE on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (chartRef.current) return; // Already created
    if (!width || !height) return;

    let mounted = true;
    let chartCreated = false;

    // Use requestAnimationFrame + setTimeout for better timing
    const rafId = requestAnimationFrame(() => {
      const timeoutId = setTimeout(() => {
        if (!mounted || !chartContainerRef.current || chartCreated) return;

        try {
          // Final check: ensure container is in the DOM and has dimensions
          const rect = chartContainerRef.current.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            return; // Skip if container has no dimensions
          }

          const chart = createChart(chartContainerRef.current, {
            width,
            height,
            layout: {
              background: { type: ColorType.Solid, color: 'transparent' },
              textColor: 'transparent',
            },
            grid: {
              vertLines: { visible: false },
              horzLines: { visible: false },
            },
            crosshair: {
              vertLine: { visible: false },
              horzLine: { visible: false },
            },
            rightPriceScale: { visible: false },
            leftPriceScale: { visible: false },
            timeScale: { visible: false },
            handleScroll: false,
            handleScale: false,
          });

          // Create area series with proper RGBA colors
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const areaSeries = chart.addSeries('Area' as any, {
            topColor: isPositive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
            bottomColor: 'rgba(0, 0, 0, 0)',
            lineColor: isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)',
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });

          chartRef.current = chart;
          seriesRef.current = areaSeries;
          chartCreated = true;
        } catch {
          // Silently skip if creation fails (DOM not ready)
        }
      }, 100); // Increased delay for better stability

      return () => clearTimeout(timeoutId);
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch {
          // Silently ignore cleanup errors
        }
      }
      
      chartRef.current = null;
      seriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount, ignore width/height/isPositive changes to prevent recreation
  
  // Update data only - never recreate chart
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return;
    
    const validData = data.filter(d => d && d.time && typeof d.value === 'number' && !isNaN(d.value));
    if (validData.length === 0) return;

    try {
      if (enableLiveUpdates && validData.length > lastDataLengthRef.current) {
        // Smooth live update - append new points only
        const newPoints = validData.slice(lastDataLengthRef.current);
        newPoints.forEach((point) => {
          seriesRef.current?.update(point as LineData);
        });
        lastDataLengthRef.current = validData.length;
      } else {
        // Initial load or full refresh
        seriesRef.current.setData(validData);
        chartRef.current?.timeScale().fitContent();
        lastDataLengthRef.current = validData.length;
      }
    } catch (error) {
      console.error('MiniChart data update error:', error);
    }
  }, [data, enableLiveUpdates]);

  return (
    <div 
      ref={chartContainerRef} 
      className="relative"
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        minWidth: `${width}px`,
        minHeight: `${height}px`
      }}
    />
  );
}
