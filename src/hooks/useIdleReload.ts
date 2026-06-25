import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

/**
 * Recarga la página si el usuario está inactivo más de 10 minutos.
 * Reinicia el timer con: mousemove, keydown, click, scroll, touchstart.
 */
export function useIdleReload() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        window.location.reload();
      }, IDLE_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // arrancar desde cero al montar

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);
}
