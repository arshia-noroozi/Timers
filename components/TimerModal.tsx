import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TimerModalProps {
  visible: boolean;
  initialValue?: string; // minutes only
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export default function TimerModal({
  visible,
  initialValue = "45:00",
  onSave,
  onCancel,
}: TimerModalProps) {
  const [minutes, setMinutes] = useState(""); // just a number
  // const colorScheme = useColorScheme();
  // const isDark = colorScheme === "dark";
  const isDark = true;
  // Convert initialValue "mm:ss" to just minutes
  useEffect(() => {
    const [minStr] = initialValue.split(":");
    setMinutes(parseInt(minStr, 10).toString());
  }, [initialValue]);

  const handleSave = () => {
    const cleaned = minutes.replace(/\D/g, "") || "0";
    onSave(`${cleaned}:00`);
  };

  const handlePress = (digit: string) => {
    if (minutes.length < 4) setMinutes(minutes + digit);
  };

  const handleBackspace = () => {
    setMinutes(minutes.slice(0, -1));
  };

  const keypad = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["⌫", "0", "تایید"],
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View
        style={[
          styles.backdrop,
          {
            backgroundColor: isDark
              ? "rgba(255,255,255,0.15)"
              : "rgba(0,0,0,0.45)",
          },
        ]}
      >
        <View
          style={[
            styles.content,
            { backgroundColor: isDark ? "#151718" : "#fff" },
          ]}
        >
          <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
            مدت زمان تایمر
          </Text>

          <Text style={[styles.display, { color: isDark ? "#fff" : "#000" }]}>
            {minutes || "0"} دقیقه
          </Text>

          <View style={styles.keypad}>
            {keypad.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.key,
                      { backgroundColor: isDark ? "#333" : "#eee" },
                    ]}
                    onPress={() => {
                      if (key === "⌫") handleBackspace();
                      else if (key === "تایید") handleSave();
                      else handlePress(key);
                    }}
                  >
                    <Text
                      style={[
                        styles.keyText,
                        { color: isDark ? "#fff" : "#000" },
                      ]}
                    >
                      {key}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.btnCancel,
              { backgroundColor: isDark ? "#555" : "#ccc" },
            ]}
            onPress={onCancel}
          >
            <Text style={[styles.btnText, { color: isDark ? "#fff" : "#000" }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  content: {
    position: "relative",
    borderRadius: 12,
    padding: 16,
    width: 300,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  display: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  keypad: { width: "100%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  key: {
    flex: 1,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#151718",
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: { fontSize: 24, fontWeight: "600" },
  btnCancel: {
    position: "absolute",
    top: 15,
    left: 15,
    width: 35,

    justifyContent: "center",
    alignItems: "center",
    aspectRatio: 1,
    borderRadius: 999,
  },
  btnText: { fontSize: 16, fontWeight: "600", textAlign: "center" },
});
