import OutsideFrame from "@/assets/images/outside-frame.svg";
import FullScreenWrapper from "@/components/screen";
import ThemedTimer from "@/components/themed-timer";
import useTimers from "@/hooks/useTimers";
import {
  cancelTimerNotification,
  cancelTimerNotificationForTimer,
  readNotificationsMap,
  requestNotificationPermissions,
  restoreNotificationsForTimers,
  scheduleTimerNotification,
} from "@/utils/notificationHelpers";
import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";

export default function Timers() {
  const { timers, loading, updateTimer, resetTimer } = useTimers();
  const [notifications, setNotifications] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    async function loadMap() {
      const map = await readNotificationsMap();
      setNotifications(map);
    }
    loadMap();
  }, []);

  useEffect(() => {
    async function requestPerms() {
      await requestNotificationPermissions();
    }
    requestPerms();
  }, []);

  // When timers finish loading (or change significantly), restore scheduled notifications.
  // This reschedules notifications (safe-idempotent because we cancel existing ones first).
  useEffect(() => {
    if (loading) return;
    // timers is expected to be an array of { id, start, duration }
    restoreNotificationsForTimers(timers as any[]);
    // refresh local state copy of notification map
    (async () => {
      const map = await readNotificationsMap();
      setNotifications(map);
    })();
  }, [loading]);

  const handleResetTimer = async (id: string) => {
    // cancel notification for this timer
    await cancelTimerNotificationForTimer(id);
    // update timer state
    resetTimer(id);
    // update local map
    setNotifications((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleSetDuration = async (
    newStart: string,
    newDuration: string,
    id: string
  ) => {
    // cancel previous notification if exists
    if (notifications[id]) {
      await cancelTimerNotification(notifications[id]);
    }

    // schedule new notification
    const notifId = await scheduleTimerNotification(id, newStart, newDuration);

    // store the ID
    if (notifId) {
      setNotifications((prev) => ({ ...prev, [id]: notifId }));
    }

    // update timer in your hook
    updateTimer(id, { start: newStart, duration: newDuration });
  };

  if (loading) {
    return <FullScreenWrapper />;
  }

  // **Web-specific return**
  if (Platform.OS === "web") {
    return (
      <ScrollView
        style={{ flex: 1, height: "100%" }}
        contentContainerStyle={{
          backgroundColor: "#151718",
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <View style={{ position: "relative", paddingHorizontal: 8 }}>
          <OutsideFrame />
          {timers
            .filter((t) => (Number(t.id) ?? 0) > 26)
            .map((t, i) => (
              <ThemedTimer
                key={t.id ?? i}
                id={t.id}
                duration={t.duration ?? "45:00"}
                x={t.x ?? 0} // defensive
                y={t.y ?? 0} // defensive
                scale={t.scale}
                start={t.start}
                shape={t.shape}
                resetTimer={handleResetTimer}
                setTimer={(newStart: string, newDuration: string) =>
                  handleSetDuration(newStart, newDuration, t.id)
                }
              />
            ))}
        </View>
      </ScrollView>
    );
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      horizontal
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={{ position: "relative", paddingHorizontal: 8 }}>
          <OutsideFrame />
          {timers
            .filter((t) => (Number(t.id) ?? 0) > 26)
            .map((t, i) => (
              <ThemedTimer
                key={t.id ?? i}
                id={t.id}
                duration={t.duration ?? "45:00"}
                x={t.x ?? 0} // defensive
                y={t.y ?? 0} // defensive
                scale={t.scale}
                start={t.start}
                shape={t.shape}
                resetTimer={handleResetTimer}
                setTimer={(newStart: string, newDuration: string) =>
                  handleSetDuration(newStart, newDuration, t.id)
                }
              />
            ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    backgroundColor: "#151718",
    alignItems: "center",
    paddingVertical: 30,
  },
});
