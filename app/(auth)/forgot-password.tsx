import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: "embr-fluttur://reset-password",
      });
      if (err) throw err;
      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />

        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>We'll send you a reset link</Text>
        </LinearGradient>

        <View style={styles.content}>
          {!sent ? (
            <>
              <View style={styles.iconContainer}>
                <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.iconBg}>
                  <IconSymbol name="lock.open" size={32} color="#FFF" />
                </LinearGradient>
              </View>

              <Text style={[styles.title, { color: colors.foreground }]}>Forgot your password?</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              <View style={styles.fieldGroup}>
                <View style={styles.inputWrapper}>
                  <IconSymbol name="envelope" size={18} color={colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surface, borderColor: error ? "#E8344E" : colors.border, color: colors.foreground },
                    ]}
                    placeholder="your@email.com"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleSend}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </View>

              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
                onPress={handleSend}
                disabled={loading}
              >
                <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendGradient}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.sendText}>Send Reset Link</Text>}
                </LinearGradient>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <LinearGradient colors={["#22C55E", "#16A34A"]} style={styles.iconBg}>
                  <IconSymbol name="checkmark.circle.fill" size={32} color="#FFF" />
                </LinearGradient>
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>Check your email</Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                We sent a password reset link to{"\n"}<Text style={{ color: "#E8344E", fontWeight: "600" }}>{email}</Text>
              </Text>
              <Pressable
                style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.9 }]}
                onPress={() => router.push("/(auth)/login" as any)}
              >
                <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendGradient}>
                  <Text style={styles.sendText}>Back to Login</Text>
                </LinearGradient>
              </Pressable>
            </>
          )}

          <Pressable onPress={() => router.push("/(auth)/login" as any)}>
            <Text style={[styles.backToLogin, { color: colors.muted }]}>
              Remember your password? <Text style={{ color: "#E8344E", fontWeight: "600" }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  headerSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 16 },
  iconContainer: {},
  iconBg: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, color: "#888" },
  fieldGroup: { width: "100%" },
  inputWrapper: { flexDirection: "row", alignItems: "center", position: "relative" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5,
    paddingLeft: 44, paddingRight: 16, fontSize: 15,
  },
  errorText: { color: "#E8344E", fontSize: 12, marginTop: 4, marginLeft: 4 },
  sendBtn: { width: "100%", borderRadius: 30, overflow: "hidden" },
  sendGradient: { paddingVertical: 16, alignItems: "center" },
  sendText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  backToLogin: { fontSize: 14 },
});
