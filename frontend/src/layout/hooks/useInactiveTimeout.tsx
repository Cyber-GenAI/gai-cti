import { useCallback, useEffect, useRef } from "react";

export const useInactivityTimeout = (
  handleLogout: () => void,
  timeoutMs: number = 30 * 60 * 1000 // 30 minutes
) => {
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      console.warn("User inactive — triggering logout");
      handleLogout();
    }, timeoutMs);
  }, [handleLogout, timeoutMs]);

  useEffect(() => {
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "focusin",
    ];

    const handleVisibilityChange = () => {
      if (!document.hidden) resetInactivityTimer();
    };

    activityEvents.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const heartbeat = setInterval(() => {
      if (!document.hidden) resetInactivityTimer();
    }, 60_000);

    resetInactivityTimer();

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      clearInterval(heartbeat);
    };
  }, [resetInactivityTimer]);

  return resetInactivityTimer;
};
