import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function TwoFactorScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [enabled, setEnabled] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEnable2FA = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // In production, integrate with an authenticator app like Google Authenticator
      // For now, we'll show a mock setup
      Alert.alert(
        "2FA Setup",
        "Download Google Authenticator or Authy, then scan the QR code to enable 2FA.\n\nFor demo: Use code 123456",
        [
          { text: "Cancel", onPress: () => setLoading(false) },
          {
            text: "Verify Code",
            onPress: () => {
              setVerifying(true);
              setLoading(false);
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }
    if (code === "123456") {
      setEnabled(true);
      setVerifying(false);
      setCode("");
      Alert.alert("Success", "2FA has been enabled on your account");
    } else {
      Alert.alert("Error", "Invalid code. Please try again");
    }
  };

  const handleDisable2FA = async () => {
    Alert.alert("Disable 2FA", "Are you sure? This will reduce your account security.", [
      { text: "Cancel" },
      {
        text: "Disable",
        onPress: () => {
          setEnabled(false);
          Alert.alert("Success", "2FA has been disabled");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusIcon}>
              <IconSymbol name={enabled ? "checkmark.circle.fill" : "shield"} size={28} color={enabled ? "#22C55E" : colors.muted} />
            </View>
            <View style={styles.statusText}>
              <Text style={[styles.statusTitle, { color: colors.foreground }]}>
                {enabled ? "2FA Enabled" : "2FA Disabled"}
              </Text>
              <Text style={[styles.statusDesc, { color: colors.muted }]}>
                {enabled
                  ? "Your account is protected with two-factor authentication"
                  : "Add an extra layer of security to your account"}
              </Text>
            </View>
          </View>
        </View>

        {verifying ? (
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Enter Verification Code</Text>
            <Text style={[styles.cardDesc, { color: colors.muted }]}>Enter the 6-digit code from your authenticator app</Text>
            <TextInput
              style={[styles.codeInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="000000"
              placeholderTextColor={colors.muted}
              value={code}
              onChangeText={setCode}
              maxLength={6}
              keyboardType="number-pad"
            />
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.button, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => {
                  setVerifying(false);
                  setCode("");
                }}
              >
                <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.primaryButton]} onPress={handleVerifyCode}>
                <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.buttonGradient}>
                  <Text style={styles.buttonTextPrimary}>Verify</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            style={[styles.button, styles.mainButton, { backgroundColor: enabled ? "#EF4444" : "#E8344E" }]}
            onPress={enabled ? handleDisable2FA : handleEnable2FA}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonTextPrimary}>{enabled ? "Disable 2FA" : "Enable 2FA"}</Text>
            )}
          </Pressable>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.infoTitle, { color: colors.foreground }]}>How it works</Text>
          <Text style={[styles.infoText, { color: colors.muted }]}>
            1. Download an authenticator app (Google Authenticator, Authy, Microsoft Authenticator){"\n"}
            2. Scan the QR code or enter the setup key{"\n"}
            3. Enter the 6-digit code to verify{"\n"}
            4. Save backup codes in a safe place
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  statusText: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  statusDesc: { fontSize: 13, lineHeight: 18 },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  cardDesc: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  codeInput: {
    height: 56, borderRadius: 12, borderWidth: 1, fontSize: 24, textAlign: "center",
    fontWeight: "700", letterSpacing: 8, marginBottom: 16,
  },
  buttonRow: { flexDirection: "row", gap: 12 },
  button: {
    flex: 1, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
  },
  primaryButton: {},
  buttonGradient: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: 24 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  buttonTextPrimary: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  mainButton: { height: 52, marginBottom: 16 },
  infoCard: {
    borderRadius: 12, borderWidth: 1, padding: 16,
  },
  infoTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 20 },
});
