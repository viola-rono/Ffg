import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    const errs: Record<string, string> = {};
    if (!identifier.trim()) errs.identifier = "Enter your email or username";
    if (!password) errs.password = "Enter your password";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // Try email login first, then username lookup
      let email = identifier.trim();
      if (!email.includes("@")) {
        // Look up email by username
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", email)
          .single();
        if (!profile) throw new Error("Username not found");
        // Get user email from auth
        const { data: userData } = await supabase
          .from("user_emails")
          .select("email")
          .eq("user_id", profile.id)
          .single();
        if (userData?.email) email = userData.email;
        else throw new Error("Could not find account");
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/(tabs)" as any);
    } catch (err: any) {
      Alert.alert("Login Failed", err.message ?? "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field: string) => [
    styles.input,
    { backgroundColor: colors.surface, borderColor: errors[field] ? "#E8344E" : colors.border, color: colors.foreground },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />

        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to your account</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Email or Username */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email or Username</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="person" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={inputStyle("identifier")}
                placeholder="email@example.com or username"
                placeholderTextColor={colors.muted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            {errors.identifier ? <Text style={styles.errorText}>{errors.identifier}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
              <Pressable onPress={() => router.push("/(auth)/forgot-password" as any)}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
            <View style={styles.inputWrapper}>
              <IconSymbol name="lock" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[inputStyle("password"), { flex: 1 }]}
                placeholder="Your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol name={showPassword ? "eye.slash" : "eye"} size={18} color={colors.muted} />
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Remember Me */}
          <View style={styles.rememberRow}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: colors.border, true: "#E8344E" }}
              thumbColor="#FFF"
            />
            <Text style={[styles.rememberText, { color: colors.muted }]}>Remember me</Text>
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Sign In</Text>}
            </LinearGradient>
          </Pressable>

          {/* Sign up link */}
          <Pressable style={styles.signupLink} onPress={() => router.push("/(auth)/signup" as any)}>
            <Text style={[styles.signupLinkText, { color: colors.muted }]}>
              Don't have an account? <Text style={{ color: "#E8344E", fontWeight: "600" }}>Sign up</Text>
            </Text>
          </Pressable>
        </ScrollView>
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
  form: { padding: 20, gap: 4 },
  fieldGroup: { marginBottom: 16 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  forgotText: { fontSize: 13, color: "#E8344E", fontWeight: "500" },
  inputWrapper: { flexDirection: "row", alignItems: "center", position: "relative" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5,
    paddingLeft: 44, paddingRight: 16, fontSize: 15,
  },
  eyeBtn: { position: "absolute", right: 14 },
  errorText: { color: "#E8344E", fontSize: 12, marginTop: 4, marginLeft: 4 },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  rememberText: { fontSize: 14 },
  submitBtn: { borderRadius: 30, overflow: "hidden", marginTop: 8 },
  submitGradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  signupLink: { alignItems: "center", paddingVertical: 16 },
  signupLinkText: { fontSize: 14 },
});
