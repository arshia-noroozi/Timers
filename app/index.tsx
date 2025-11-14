// app/index.tsx
import InsideFrame from "@/assets/images/inside-frame.svg";
import OutsideFrame from "@/assets/images/outside-frame.svg";
import FullScreenWrapper from "@/components/screen";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function RootIndex() {
  const router = useRouter();
  return (
    <FullScreenWrapper>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View style={styles.container}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/(tabs)")}
          >
            <InsideFrame width={120} height={180} />
            <Text style={styles.buttonText}>داخل</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push("/(tabs)/Outside")}
          >
            <OutsideFrame width={120} height={180} />
            <Text style={styles.buttonText}>بیرون</Text>
          </Pressable>
        </View>
      </View>
    </FullScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    flexDirection: "row", // side by side if possible
    flexWrap: "wrap", // stack if no space
    justifyContent: "center", // centers vertically when combined with alignItems
    alignItems: "center",
    gap: 15,
    padding: 2,
  },

  button: {
    backgroundColor: "#111111ff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#8B6F00",
    borderWidth: 1,
    width: 160,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  buttonText: {
    marginTop: 16,
    paddingTop: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "#d6d6d6ff",
    borderTopWidth: 1,
    borderTopColor: "#d6d6d6ff",
    textAlign: "center",
    width: "100%",
  },
});
