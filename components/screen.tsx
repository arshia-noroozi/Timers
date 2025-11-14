import React, { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleProp,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Edge = "top" | "bottom" | "left" | "right";

type Props = PropsWithChildren<{
  /** Optional style applied to the outer SafeAreaView */
  style?: StyleProp<ViewStyle>;
  /** Which safe-area edges to respect (defaults to all) */
  edges?: Edge[];
  /** Optional explicit background color; if omitted uses theme background */
  backgroundColor?: string;
  /** If true, will add a small StatusBar padding on Android (useful for some devices) */
  androidStatusBarPadding?: boolean;
}>;

/**
 * FullScreenWrapper
 * - Fills the screen (flex: 1)
 * - Respects all safe-area insets by default (top/bottom/left/right)
 * - Wraps children in a KeyboardAvoidingView for better keyboard handling
 * - Uses your theme background by default (via useThemeColor)
 */
export default function FullScreenWrapper({
  children,
  style,
  edges = ["top", "bottom", "left", "right"],
  backgroundColor,
  androidStatusBarPadding = false,
}: Props) {
  // const themeBackground = useThemeColor({}, "background");
  // const bg = backgroundColor ?? themeBackground ?? "transparent";

  // On Android some devices need extra padding for the status bar area;
  // you can enable that with androidStatusBarPadding.
  const androidPaddingStyle: StyleProp<ViewStyle> = androidStatusBarPadding
    ? {
        paddingTop:
          Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
      }
    : {};

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: "#151718", overflowY: "auto" },
        androidPaddingStyle,
        style,
      ]}
      edges={edges}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export { Props as FullScreenWrapperProps };

