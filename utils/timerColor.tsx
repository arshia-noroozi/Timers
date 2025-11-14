import { parseTimeToSeconds } from "./helperFunctions";

/**
 * Get a color between green -> red based on elapsed progress of a timer
 * @param start ISO string of timer start, or null
 * @param durationStr "MM:SS" string
 * @returns color string like "#00FF00" or "#FF0000"
 */
export function getTimerColor(start: string | null, durationStr: string): string {
  if (!start) return "#00FF00"; // green if not started

  const totalSeconds = parseTimeToSeconds(durationStr);
  if (totalSeconds <= 0) return "#FF0000"; // red if invalid duration

  const startMs = new Date(start).getTime();
  const now = Date.now();
  const elapsedSec = Math.floor((now - startMs) / 1000);
  const ratio = Math.min(Math.max(elapsedSec / totalSeconds, 0), 1);

  // interpolate RGB: green -> red
  const r = Math.floor(0 + ratio * (255 - 0));   // 0 -> 255
  const g = Math.floor(255 - ratio * (255 - 0)); // 255 -> 0
  const b = 0;

  return `rgb(${r},${g},${b})`;
}
