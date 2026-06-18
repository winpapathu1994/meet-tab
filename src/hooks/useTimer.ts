import { useCallback, useEffect, useRef, useState } from "react";

export type TimerState = "idle" | "running" | "paused";

export function useTimer() {
  const [state, setState] = useState<TimerState>("idle");
  const [elapsed, setElapsed] = useState(0); // seconds
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clearTimer();
    setState("running");
  }, [clearTimer]);

  const pause = useCallback(() => {
    clearTimer();
    setState("paused");
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState("running");
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setElapsed(0);
    setState("idle");
  }, [clearTimer]);

  // Tick every second when running
  useEffect(() => {
    if (state === "running") {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearTimer();
  }, [state, clearTimer]);

  return { state, elapsed, start, pause, resume, reset };
}
