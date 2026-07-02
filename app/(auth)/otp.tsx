import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTPScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const colors = useColors();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCooldown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = digit;
    setOtp(newOtp);
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (newOtp.every((d) => d !== "") && digit) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const token = code ?? otp.join("");
    if (token.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email ?? "",
        token,
        type: "signup",
      });
      if (error) throw error;
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      Alert.alert("Verification Failed", err.message ?? "Invalid code. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await supabase.auth.resend({ type: "signup", email: email ?? "" });
      startCooldown();
      Alert.alert("Code Sent", "A new verification code has been sent to your email.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
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
          <Text style={styles.headerTitle}>Verify Email</Text>
          <Text style={styles.headerSubtitle}>We sent a code to {email}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.iconBg}>
              <IconSymbol name="envelope.fill" size={32} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>Enter Verification Code</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter the 6-digit code sent to your email address
          </Text>

          {/* OTP inputs */}
          <View style={styles.otpRow}>
            {otp.map((digit, idx) => (
              <TextInput
                key={idx}
                ref={(r) => { inputRefs.current[idx] = r; }}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: digit ? "#E8344E" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                value={digit}
                onChangeText={(v) => handleChange(v, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
                keyboardType="number-pad"
                maxLength={1}
                autoFocus={idx === 0}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Verify button */}
          <Pressable
            style={({ pressed }) => [styles.verifyBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            onPress={() => handleVerify()}
            disabled={loading || otp.some((d) => !d)}
          >
            <LinearGradient
              colors={otp.some((d) => !d) ? ["#ccc", "#ccc"] : ["#E8344E", "#FF6B35"]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.verifyGradient}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.verifyText}>Verify Email</Text>}
            </LinearGradient>
          </Pressable>

          {/* Resend */}
          <Pressable onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[styles.resendText, { color: resendCooldown > 0 ? colors.muted : "#E8344E" }]}>
              {resendCooldown > 0
                ? `Resend code in ${resendCooldown}s`
                : "Resend verification code"}
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
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40, gap: 16 },
  iconContainer: { marginBottom: 8 },
  iconBg: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  otpRow: { flexDirection: "row", gap: 10, marginVertical: 8 },
  otpInput: {
    width: 48, height: 56, borderRadius: 14, borderWidth: 2,
    textAlign: "center", fontSize: 22, fontWeight: "700",
  },
  verifyBtn: { width: "100%", borderRadius: 30, overflow: "hidden", marginTop: 8 },
  verifyGradient: { paddingVertical: 16, alignItems: "center" },
  verifyText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  resendText: { fontSize: 14, fontWeight: "500" },
});
