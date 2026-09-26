import { useEffect, useRef, useState, useCallback } from 'react';
import { MathWorkerBridge, SimulationMetric, WorkerStateMessage } from './mathWorkerBridge';

interface UsePhysicsWorkerOptions {
  simulatorType: string;
  initialParams: Record<string, number>;
  isRunning?: boolean;
}

export function usePhysicsWorker({ simulatorType, initialParams, isRunning = true }: UsePhysicsWorkerOptions) {
  const bridgeRef = useRef<MathWorkerBridge | null>(null);
  const latestStateRef = useRef<Record<string, any>>({});
  const [workerMetrics, setWorkerMetrics] = useState<SimulationMetric[]>([]);
  const paramsRef = useRef<Record<string, number>>(initialParams);
  const animFrameMetricsIdRef = useRef<number | null>(null);

  // Initialize bridge
  useEffect(() => {
    const bridge = new MathWorkerBridge();
    bridgeRef.current = bridge;

    // Send initial configuration
    bridge.setParams(simulatorType, initialParams, 0);

    const unsubscribe = bridge.subscribe((data: WorkerStateMessage) => {
      if (data.simulatorType === simulatorType) {
        latestStateRef.current = data.state;
        if (data.metrics && data.metrics.length > 0) {
          // Throttle state update using requestAnimationFrame to avoid DOM layout thrashing
          if (animFrameMetricsIdRef.current === null) {
            animFrameMetricsIdRef.current = requestAnimationFrame(() => {
              setWorkerMetrics(data.metrics);
              animFrameMetricsIdRef.current = null;
            });
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (animFrameMetricsIdRef.current !== null) {
        cancelAnimationFrame(animFrameMetricsIdRef.current);
      }
      bridge.terminate();
      bridgeRef.current = null;
    };
  }, [simulatorType]);

  // Synchronize parameter changes with the worker
  const dispatchParamUpdate = useCallback((newParams: Record<string, number>, t?: number) => {
    paramsRef.current = newParams;
    if (bridgeRef.current) {
      bridgeRef.current.setParams(simulatorType, newParams, t);
    }
  }, [simulatorType]);

  const stepPhysics = useCallback((dt: number, t: number) => {
    if (bridgeRef.current && isRunning) {
      bridgeRef.current.step(simulatorType, paramsRef.current, dt, t);
    }
  }, [simulatorType, isRunning]);

  const resetPhysics = useCallback((params: Record<string, number>) => {
    if (bridgeRef.current) {
      bridgeRef.current.reset(simulatorType, params);
    }
  }, [simulatorType]);

  return {
    latestStateRef,
    workerMetrics,
    dispatchParamUpdate,
    stepPhysics,
    resetPhysics,
  };
}
