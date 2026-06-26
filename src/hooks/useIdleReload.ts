import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos

/**
 * Recarga la página si el usuario está inactivo más de 10 minutos.
 * Evita recargar si el navegador está sin conexión o si la pestaña está oculta,
 * previniendo el error de "Sin conexión" (dinosaurio) cuando el dispositivo despierta de reposo.
 */
export function useIdleReload() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    const performReload = () => {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        // Si no hay conexión (por ejemplo, el Wi-Fi se está reconectando),
        // esperamos al evento 'online' antes de refrescar.
        const reloadWhenOnline = () => {
          window.location.reload();
        };
        window.addEventListener('online', reloadWhenOnline, { once: true });
      }
    };

    const resetTimer = () => {
      lastActivityRef.current = Date.now();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (document.visibilityState === 'visible') {
          performReload();
        }
      }, IDLE_TIMEOUT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timePassed = Date.now() - lastActivityRef.current;
        if (timePassed >= IDLE_TIMEOUT_MS) {
          performReload();
        } else {
          // Si aún no expira el tiempo, programar el resto
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(performReload, IDLE_TIMEOUT_MS - timePassed);
        }
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer(); // Iniciar temporizador

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
