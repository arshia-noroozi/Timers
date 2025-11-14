// hooks/useTimers.ts
import { initialTimers } from "@/constants/timers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const STORAGE_KEY = "timers";

export type TimerItem = {
  id: string;
  x?: number;
  y?: number;
  scale?: number;
  shape?: "circle" | "rectangle";
  duration?: string; // "MM:SS"
  start?: string | null; // ISO or local-ISO-like string or null
  // any other fields you keep in timers
};

export default function useTimers() {
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // inside your useEffect (replace current load logic)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;

        let loadedTimers: TimerItem[] = [];

        if (!raw) {
          // no stored value -> seed and persist initialTimers
          loadedTimers = initialTimers as TimerItem[];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loadedTimers));
        } else {
          // there's something in storage, try to parse and robustly merge
          try {
            const parsed = JSON.parse(raw);

            if (!Array.isArray(parsed) || parsed.length === 0) {
              // Not an array or empty array -> replace with initialTimers
              loadedTimers = initialTimers as TimerItem[];
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(loadedTimers)
              );
            } else {
              // Build map of stored items that have a valid id
              const storedById: Record<string, Partial<TimerItem>> = {};
              for (const item of parsed) {
                if (item && typeof item.id === "string" && item.id.length > 0) {
                  storedById[item.id] = item;
                } else {
                  // ignore malformed entries (no id) — they can't be merged safely
                  console.warn(
                    "useTimers: ignoring stored timer without id",
                    item
                  );
                }
              }

              // Merge: for every initial timer, overlay stored fields (if present).
              loadedTimers = (initialTimers as TimerItem[]).map((init) => {
                const stored = storedById[init.id];
                return stored ? { ...init, ...stored } : init;
              });

              // If there were stored items that don't match any initial id,
              // we could append them; for safety we ignore them to avoid layout issues.
              // Persist the cleaned/merged array back to storage so it becomes the source of truth.
              await AsyncStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(loadedTimers)
              );
            }
          } catch (err) {
            console.warn(
              "useTimers: parse error, resetting to initialTimers",
              err
            );
            loadedTimers = initialTimers as TimerItem[];
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(loadedTimers)
            );
          }
        }

        setTimers(loadedTimers);
      } catch (err) {
        console.warn("useTimers: failed to read storage", err);
        setTimers(initialTimers as TimerItem[]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  //   useEffect(() => {
  //     console.log(timers);
  //   }, [timers]);

  // helper to write current timers to storage
  async function persist(list: TimerItem[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn("useTimers: persist failed", err);
    }
  }

  // update timer by id — merges provided fields
  async function updateTimer(id: string, patch: Partial<TimerItem>) {
    setTimers((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      let next: TimerItem[];
      if (idx >= 0) {
        // preserve existing id
        next = prev.slice();
        next[idx] = { ...prev[idx], ...patch, id: prev[idx].id };
      } else {
        // if not found, add new entry — must include id
        next = [...prev, { id, ...patch }];
      }
      persist(next);
      return next;
    });
  }

  // add new timer (optional)
  async function addTimer(item: TimerItem) {
    setTimers((prev) => {
      const next = [...prev, item];
      persist(next);
      return next;
    });
  }

  // remove timer by id
  async function removeTimer(id: string) {
    setTimers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(next);
      return next;
    });
  }

  // force refresh from storage (if needed)
  async function refresh() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setTimers(initialTimers as TimerItem[]);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialTimers));
        return;
      }
      const parsed = JSON.parse(raw);
      setTimers(
        Array.isArray(parsed)
          ? (parsed as TimerItem[])
          : (initialTimers as TimerItem[])
      );
    } catch (err) {
      console.warn("useTimers: refresh failed", err);
      setTimers(initialTimers as TimerItem[]);
    }
  }

  // reset a timer by id (set start to null, duration to "45:00")
  async function resetTimer(id: string) {
    setTimers((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;

      const next = [...prev];
      next[idx] = {
        ...prev[idx],
        start: null,
        duration: "45:00",
      };

      // persist the change
      persist(next);
      return next;
    });
  }

  return {
    timers,
    loading,
    updateTimer,
    addTimer,
    removeTimer,
    refresh,
    resetTimer,
  };
}
