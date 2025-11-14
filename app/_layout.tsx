import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Slot } from "expo-router";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  document.title = "کافه کای";

  return (
    // <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
    <ThemeProvider value={DarkTheme}>
      <Slot />
    </ThemeProvider>
  );
}
