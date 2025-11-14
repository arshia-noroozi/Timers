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

  const isWeb = Platform.OS === "web";

  // Load notifications map (only on native)
  useEffect(() => {
    if (isWeb) {
      setNotifications({});
      return;
    }

    let mounted = true;
    async function loadMap() {
      const map = await readNotificationsMap();
      if (mounted) setNotifications(map);
    }
    loadMap();
    return () => {
      mounted = false;
    };
  }, [isWeb]);

  // Request notification permissions (only on native)
  useEffect(() => {
    if (isWeb) return;
    async function requestPerms() {
      await requestNotificationPermissions();
    }
    requestPerms();
  }, [isWeb]);

  // When timers finish loading (or change significantly), restore scheduled notifications.
  useEffect(() => {
    if (loading) return;

    if (!isWeb) {
      // timers is expected to be an array of { id, start, duration }
      restoreNotificationsForTimers(timers as any[]);
      // refresh local state copy of notification map
      (async () => {
        const map = await readNotificationsMap();
        setNotifications(map);
      })();
    } else {
      // ensure notifications map is empty on web
      setNotifications({});
    }
  }, [loading, isWeb, timers]);

  const handleResetTimer = async (id: string) => {
    if (!isWeb) {
      // cancel notification for this timer (native only)
      await cancelTimerNotificationForTimer(id);
      setNotifications((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
    // update timer state (works on all platforms)
    resetTimer(id);
  };

  const handleSetDuration = async (
    newStart: string,
    newDuration: string,
    id: string
  ) => {
    if (!isWeb) {
      // cancel previous notification if exists (native only)
      if (notifications[id]) {
        await cancelTimerNotification(notifications[id]);
      }

      // schedule new notification (native only)
      const notifId = await scheduleTimerNotification(
        id,
        newStart,
        newDuration
      );

      // store the ID (native only)
      if (notifId) {
        setNotifications((prev) => ({ ...prev, [id]: notifId }));
      }
    }

    // update timer in your hook (all platforms)
    updateTimer(id, { start: newStart, duration: newDuration });
  };

  if (loading) {
    return <FullScreenWrapper />;
  }

  if (isWeb) {
    // TODO: set these to your SVG's natural (designer) pixel size.
    const INTRINSIC_WIDTH = 370; // <-- pick the map's natural width in px
    const INTRINSIC_HEIGHT = 622; // <-- pick the map's natural height in px

    return (
      // outer page container (keeps background/padding)
      <View
        style={{
          flex: 1,
          height: "100%",
          backgroundColor: "#151718",
          paddingVertical: 20,
        }}
      >
        {/* native browser scroller that handles both X and Y axes */}
        <View
          style={{
            width: "100%",
            // allow both horizontal and vertical scroll
            overflowX: "auto",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x pan-y",
            // optional: limit height so scroller fits inside viewport minus chrome
            maxHeight: "calc(100vh - 100px)",
          }}
        >
          {/* inner content has fixed pixel dimensions so it can overflow */}
          <View
            style={{
              position: "relative",
              paddingHorizontal: 4,
              width: INTRINSIC_WIDTH,
              height: INTRINSIC_HEIGHT,
              // center inside the outer scroller if the page is wider than content
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {/* Render the SVG at its exact pixel size (no % scaling) */}
            <OutsideFrame width={INTRINSIC_WIDTH} height={INTRINSIC_HEIGHT} />
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
        </View>
      </View>
    );
  }

  // Native (Android/iOS) return
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
