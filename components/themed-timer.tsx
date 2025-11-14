import { TimerType } from "@/types/timers.type";
import { parseTimeToSeconds } from "@/utils/helperFunctions";
import { cancelTimerNotification } from "@/utils/notificationHelpers";
import { getTimerColor } from "@/utils/timerColor";
import { getRemainingFromStart } from "@/utils/timerHelper";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";
import TimerModal from "./TimerModal";

type ThemedTimerProps = TimerType & {
  setTimer: (newStart: string, newDuration: string) => void;
  resetTimer: (id: string) => void;
};

export default function ThemedTimer(props: ThemedTimerProps) {
  const {
    id,
    x,
    y,
    scale = 1,
    start = null,
    duration = "45:00",
    shape = "circle",
    setTimer,
    resetTimer,
  } = props;

  const [modalVisible, setModalVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(duration);
  const [color, setColor] = useState(getTimerColor(start, duration));

  // update every second
  useEffect(() => {
    function tick() {
      const { displayValue } = getRemainingFromStart(start, duration);
      setDisplayValue(displayValue);
      setColor(getTimerColor(start, duration));
    }

    tick(); // immediate update
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [start, duration]);

  // handle save from modal
  async function handleSave(newValue: string) {
    setModalVisible(false);
    await new Promise((r) => setTimeout(r, 200));
    const seconds = parseTimeToSeconds(newValue);
    if (Number.isNaN(seconds) || seconds < 0) return;

    const startingTime = new Date().toISOString();
    setTimer(startingTime, newValue);
  }

  function handleCancel() {
    setModalVisible(false);
    resetTimer(id);
    cancelTimerNotification(id);
  }

  const handleTimerClick = () => {
    if (displayValue === "00:00") resetTimer(id);
    else setModalVisible(true);
  };

  const borderRadius = shape === "circle" ? 999 : 0;
  return (
    <>
      <Animated.View
        style={[
          styles.animatedWrapper,
          {
            top: y,
            left: x,
            transform: [{ scale }],
            borderColor: color,
            borderRadius: borderRadius,
          },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          style={[styles.circle, { borderRadius: borderRadius }]}
          onPress={() => handleTimerClick()}
        >
          <Animated.Text style={[styles.text, { color }]}>
            {displayValue}
          </Animated.Text>
        </Pressable>
      </Animated.View>

      {modalVisible && (
        <TimerModal
          key={id}
          start={start}
          onClose={() => setModalVisible(false)}
          visible={modalVisible}
          initialValue={duration}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  animatedWrapper: {
    position: "absolute",
    borderWidth: 1,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111ff",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  text: {
    fontSize: 11,
    fontWeight: "bold",
  },
});
