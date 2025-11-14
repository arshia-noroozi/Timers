import { formatSecondsToMMSS, parseTimeToSeconds } from "./helperFunctions";

/**
 * Calculate remaining seconds and formatted string for a timer
 * @param start ISO string or null
 * @param durationStr "MM:SS"
 * @returns { remainingSeconds, displayValue }
 */
export function getRemainingFromStart(
  start: string | null,
  durationStr: string
) {
  const totalSeconds = parseTimeToSeconds(durationStr);
  if (!start) {
    return { remainingSeconds: totalSeconds, displayValue: formatSecondsToMMSS(totalSeconds) };
  }

  const startMs = new Date(start).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - startMs) / 1000);
  const remainingSeconds = Math.max(totalSeconds - elapsed, 0);

  return { remainingSeconds, displayValue: formatSecondsToMMSS(remainingSeconds) };
}
