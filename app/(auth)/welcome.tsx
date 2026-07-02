import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(buttonTranslate, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#E8344E", "#FF6B35", "#FF9500"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Background pattern circles */}
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoIcon}>
            <IconSymbol name="flame.fill" size={48} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* App Name */}
        <Animated.View style={{ opacity: textOpacity }}>
          <Text style={styles.appName}>Embr Fluttur</Text>
          <Text style={styles.tagline}>Connect. Share. Inspire.</Text>
          <Text style={styles.subtitle}>
            Join millions of people sharing their stories, moments, and passions every day.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            { opacity: buttonOpacity, transform: [{ translateY: buttonTranslate }] },
          ]}
        >
          <Pressable
            style={({ pressed }) => [styles.getStartedBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            onPress={() => router.push("/(auth)/about" as any)}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.7 }]}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.loginText}>I already have an account</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  circle1: { width: 300, height: 300, top: -80, right: -80 },
  circle2: { width: 200, height: 200, bottom: 100, left: -60 },
  circle3: { width: 150, height: 150, top: height * 0.35, right: -40 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 24,
  },
  logoContainer: { alignItems: "center", marginBottom: 8 },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },
  buttonsContainer: { width: "100%", gap: 12, marginTop: 16 },
  getStartedBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: { fontSize: 17, fontWeight: "700", color: "#E8344E" },
  loginBtn: { paddingVertical: 12, alignItems: "center" },
  loginText: { fontSize: 15, color: "rgba(255,255,255,0.9)", fontWeight: "500" },
});
