import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export function parseTimeToSeconds(value: string): number {
  // accepts "mm:ss" or "m:ss" or "hh:mm:ss" optionally
  const parts = value.split(":").map((p) => p.trim());
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number);
    if ([h, m, s].some((n) => Number.isNaN(n))) return NaN;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    if (Number.isNaN(m) || Number.isNaN(s)) return NaN;
    return m * 60 + s;
  } else if (parts.length === 1) {
    const n = Number(parts[0]);
    return Number.isNaN(n) ? NaN : n;
  }
  return NaN;
}

export function formatSecondsToMMSS(total: number): string {
  if (total <= 0) return "00:00";
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export async function logTimers() {
  try {
    const raw = await AsyncStorage.getItem("timers");
    if (!raw) {
      console.log("No timers found in AsyncStorage");
      return;
    }
    const parsed = JSON.parse(raw);
    console.log("Timers from AsyncStorage:", JSON.stringify(parsed, null, 2));
  } catch (err) {
    console.warn("Failed to read AsyncStorage:", err);
  }
}
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Permission for notifications not granted!");
  }
}
// **use with caution**
export const removeTimers = async () => {
  try {
    await AsyncStorage.removeItem("timers");
    console.log("Timers removed successfully!");
  } catch (error) {
    console.error("Error removing timers:", error);
  }
};
