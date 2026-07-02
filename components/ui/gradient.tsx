import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, type ViewStyle } from "react-native";

interface GradientProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  colors?: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export const BRAND_COLORS = {
  gradientStart: "#E8344E",
  gradientEnd: "#FF6B35",
  primary: "#E8344E",
  storyRing: ["#E8344E", "#FF6B35", "#FF9500"] as const,
};

export function BrandGradient({ children, style, start, end }: GradientProps) {
  return (
    <LinearGradient
      colors={[BRAND_COLORS.gradientStart, BRAND_COLORS.gradientEnd]}
      start={start ?? { x: 0, y: 0 }}
      end={end ?? { x: 1, y: 1 }}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </LinearGradient>
  );
}

export function HeaderGradient({ children, style }: GradientProps) {
  return (
    <LinearGradient
      colors={["#E8344E", "#FF6B35"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
