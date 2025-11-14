import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { parseTimeToSeconds } from "./helperFunctions";

const STORAGE_KEY = "timerNotifications";

type NotificationsMap = Record<string, string>;

/** ---------------------------
 *  Notification handler (sync)
 *  Runs immediately on import so notifications can be shown
 *  even when app is foregrounded (iOS behavior).
 *  --------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Read the persisted notifications map */
async function readNotificationsMap(): Promise<NotificationsMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as NotificationsMap;
  } catch (e) {
    console.warn("Failed to read notification map:", e);
    return {};
  }
}

/** Write the persisted notifications map */
async function writeNotificationsMap(map: NotificationsMap) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Failed to write notification map:", e);
  }
}

/**
 * Request notification permissions (keeps your existing implementation)
 */
export async function requestNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;

  const { status } = await Notifications.requestPermissionsAsync({
    android: {
      sound: true,
      priority: "high",
      vibrate: [0, 250, 250, 250],
      importance: Notifications.AndroidImportance.HIGH,
    },
  });

  return status === "granted";
}

/**
 * Initialize notifications (permissions + Android channel).
 * Call this once on app startup (e.g. in a top-level useEffect).
 */
export async function initNotifications(): Promise<boolean> {
  try {
    const granted = await requestNotificationPermissions();

    if (Platform.OS === "android") {
      // create the 'timer' channel (id must match channelId used when scheduling)
      await Notifications.setNotificationChannelAsync("timer", {
        name: "Timer Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
      });
    }

    return granted;
  } catch (err) {
    console.warn("[initNotifications] error", err);
    return false;
  }
}

/**
 * Schedule a notification for a timer and persist the mapping timerId -> notificationId.
 * Returns the scheduled notification id (string) or null if not scheduled (end time in past).
 */
export async function scheduleTimerNotification(
  timerId: string,
  startStr: string,
  durationStr: string
): Promise<string | null> {
  try {
    if (!timerId) {
      console.warn("[scheduleTimerNotification] missing timerId");
      return null;
    }

    const startMs = new Date(startStr).getTime();
    if (isNaN(startMs)) {
      console.warn("[scheduleTimerNotification] invalid startStr:", startStr);
      return null;
    }

    const totalSeconds = Number(parseTimeToSeconds(durationStr));
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
      console.warn(
        "[scheduleTimerNotification] invalid duration ->",
        durationStr,
        totalSeconds
      );
      return null;
    }

    const timerEndMs = startMs + Math.round(totalSeconds * 1000);
    const nowMs = Date.now();
    const secondsFromNow = Math.ceil((timerEndMs - nowMs) / 1000);

    console.log(
      "[scheduleTimerNotification] debug:",
      secondsFromNow,
      new Date(timerEndMs),
      new Date(nowMs)
    );

    if (secondsFromNow <= 0) {
      console.log(
        `[scheduleTimerNotification] end is past or immediate, not scheduling for ${timerId}`
      );
      return null;
    }

    // Cancel previous mapped notification (avoid duplicates)
    const map = await readNotificationsMap();
    const existingId = map[timerId];
    if (existingId) {
      try {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      } catch (_) {}
      delete map[timerId];
      await writeNotificationsMap(map);
    }

    const date = new Date(timerEndMs);
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Timer ${timerId} finished!`,
        body: "Your timer is up!",
        sound: true,
        data: { timerId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
      android: { channelId: "timer" },
    });

    // persist mapping
    const newMap = {
      ...(await readNotificationsMap()),
      [timerId]: notificationId,
    };
    await writeNotificationsMap(newMap);

    console.log(
      `[scheduleTimerNotification] scheduled ${notificationId} for ${timerId} in ${secondsFromNow}s`
    );
    return notificationId;
  } catch (err) {
    console.warn("[scheduleTimerNotification] error", err);
    return null;
  }
}

/** Cancel by notification id */
export async function cancelTimerNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log("[cancelTimerNotification] cancelled", notificationId);

    // remove it from stored map if present
    const map = await readNotificationsMap();
    const entry = Object.entries(map).find(([, v]) => v === notificationId);
    if (entry) {
      const [timerId] = entry;
      delete map[timerId];
      await writeNotificationsMap(map);
    }
  } catch (err) {
    console.warn("[cancelTimerNotification] error", err);
  }
}

/** Cancel a notification for a given timerId (if exists) and remove mapping */
export async function cancelTimerNotificationForTimer(timerId: string) {
  try {
    const map = await readNotificationsMap();
    const id = map[timerId];
    if (!id) return;
    await Notifications.cancelScheduledNotificationAsync(id);
    delete map[timerId];
    await writeNotificationsMap(map);
    console.log("[cancelTimerNotificationForTimer] cancelled for", timerId);
  } catch (err) {
    console.warn("[cancelTimerNotificationForTimer] error", err);
  }
}

/**
 * Restore notifications for a list of timers (call on app startup or when timers load).
 */
export async function restoreNotificationsForTimers(
  timersList: Array<{ id: string; start?: string | null; duration?: string }>
) {
  try {
    const now = Date.now();
    // Clear and rebuild map to avoid duplicates. We'll cancel existing mapped notifications first.
    const existingMap = await readNotificationsMap();

    // Cancel all existing stored notification IDs first (safe - prevents duplicates)
    for (const notifId of Object.values(existingMap)) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notifId);
      } catch (e) {
        // ignore
      }
    }

    const newMap: NotificationsMap = {};

    for (const t of timersList) {
      if (!t.id || !t.start || !t.duration) continue;

      const startMs = new Date(t.start).getTime();
      const totalSeconds = parseTimeToSeconds(t.duration);
      const endMs = startMs + totalSeconds * 1000;

      if (endMs <= now) {
        // expired, skip scheduling
        continue;
      }

      // schedule and store mapping
      const notifId = await scheduleTimerNotification(
        t.id,
        t.start,
        t.duration
      );
      if (notifId) newMap[t.id] = notifId;
    }

    // write the final map (scheduleTimerNotification already wrote each entry, but re-write to be sure)
    await writeNotificationsMap(newMap);
    console.log(
      "[restoreNotificationsForTimers] restored",
      Object.keys(newMap).length,
      "notifications"
    );
  } catch (err) {
    console.warn("[restoreNotificationsForTimers] error", err);
  }
}

/** Cancel all tracked notifications and clear persisted map */
export async function cancelAllTrackedNotifications() {
  try {
    const map = await readNotificationsMap();
    for (const id of Object.values(map)) {
      try {
        await Notifications.cancelScheduledNotificationAsync(id);
      } catch (e) {
        // ignore
      }
    }
    await writeNotificationsMap({});
    console.log("[cancelAllTrackedNotifications] done");
  } catch (err) {
    console.warn("[cancelAllTrackedNotifications] error", err);
  }
}

export {
  NotificationsMap,
  readNotificationsMap,
  STORAGE_KEY,
  writeNotificationsMap
};

