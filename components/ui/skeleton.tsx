import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function PostSkeleton() {
  return (
    <View style={styles.postSkeleton}>
      <View style={styles.header}>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.headerText}>
          <Skeleton width={120} height={14} borderRadius={7} />
          <Skeleton width={80} height={11} borderRadius={5} style={{ marginTop: 6 }} />
        </View>
      </View>
      <Skeleton width="100%" height={14} borderRadius={7} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
      <Skeleton width="100%" height={220} borderRadius={12} style={{ marginTop: 12 }} />
      <View style={styles.actions}>
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={60} height={30} borderRadius={15} />
        <Skeleton width={60} height={30} borderRadius={15} />
      </View>
    </View>
  );
}

export function StorySkeleton() {
  return (
    <View style={styles.storySkeleton}>
      <Skeleton width={64} height={64} borderRadius={32} />
      <Skeleton width={60} height={11} borderRadius={5} style={{ marginTop: 6 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  postSkeleton: {
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  storySkeleton: {
    alignItems: "center",
    width: 80,
    paddingHorizontal: 8,
  },
});
