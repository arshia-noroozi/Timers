import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TimerModalProps {
  visible: boolean;
  initialValue?: string; // "mm:ss"
  start?: string | null; // if not null -> show confirmation to disable
  onSave: (newValue: string) => void;
  onCancel: () => void;
  onClose?: () => void;
}

export default function TimerModal({
  visible,
  initialValue = "45:00",
  start = null,
  onSave,
  onCancel,
  onClose,
}: TimerModalProps) {
  const [minutes, setMinutes] = useState(""); // just a number
  const isDark = true;

  // Convert initialValue "mm:ss" to just minutes
  useEffect(() => {
    const [minStr] = initialValue.split(":");
    const parsed = parseInt(minStr, 10);
    setMinutes(Number.isNaN(parsed) ? "" : parsed.toString());
  }, [initialValue]);

  const handleSave = () => {
    const cleaned = minutes.replace(/\D/g, "") || "0";
    onSave(`${cleaned}:00`);
  };

  const handlePress = (digit: string) => {
    if (minutes.length < 4) setMinutes((m) => m + digit);
  };

  const handleBackspace = () => {
    setMinutes((m) => m.slice(0, -1));
  };

  // If onClose not provided, fallback to onCancel to ensure modal can be closed.
  const safeOnClose = onClose ?? onCancel;

  // Keypad layout
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
      onRequestClose={safeOnClose}
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
          {/* If start is provided, show disable-confirmation content */}
          {start != null ? (
            <>
              <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
                آیا میخواهید تایمر را غیرفعال کنید؟
              </Text>

              <View style={{ height: 18 }} />

              <View style={{ flexDirection: "row", gap: 20 }}>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    paddingVertical: 10,
                    backgroundColor: "#c62828",
                  }}
                  onPress={() => {
                    // "غیرفعال" button => call onCancel (disable)
                    onCancel();
                  }}
                >
                  <Text
                    style={[
                      styles.btnText,
                      {
                        color: "#fff",
                      },
                    ]}
                  >
                    غیرفعال
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    paddingVertical: 10,
                    backgroundColor: "#333",
                  }}
                  onPress={() => {
                    // "لغو" button => just close modal
                    safeOnClose();
                  }}
                >
                  <Text
                    style={[
                      styles.btnText,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                  >
                    لغو
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Default keypad UI
            <>
              <Text style={[styles.title, { color: isDark ? "#fff" : "#000" }]}>
                مدت زمان تایمر
              </Text>

              <Text
                style={[styles.display, { color: isDark ? "#fff" : "#000" }]}
              >
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
                <Text
                  style={[styles.btnText, { color: isDark ? "#fff" : "#000" }]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </>
          )}
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
