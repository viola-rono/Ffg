import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, StyleSheet, Pressable,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { supabase } from "@/lib/supabase";

function validate(username: string, email: string, password: string) {
  const errors: Record<string, string> = {};
  if (!username || username.length < 3) errors.username = "Username must be at least 3 characters";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = "Only letters, numbers, and underscores";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password || password.length < 8) errors.password = "Password must be at least 8 characters";
  if (!/(?=.*[A-Z])/.test(password)) errors.password = "Must include an uppercase letter";
  if (!/(?=.*[0-9])/.test(password)) errors.password = "Must include a number";
  return errors;
}

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useColors();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleSignUp = async () => {
    const errs = validate(username.trim(), email.trim(), password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { username: username.trim(), full_name: username.trim() },
        },
      });
      if (error) throw error;
      if (data.user) {
        // Create profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: username.trim(),
          full_name: username.trim(),
        });
        router.push({ pathname: "/(auth)/otp" as any, params: { email: email.trim() } });
      }
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message ?? "Something went wrong. Please try again.");
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

        {/* Header */}
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Embr Fluttur today</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Username</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="at" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                style={inputStyle("username")}
                placeholder="your_username"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="envelope" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                ref={emailRef}
                style={inputStyle("email")}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
            <View style={styles.inputWrapper}>
              <IconSymbol name="lock" size={18} color={colors.muted} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[inputStyle("password"), { flex: 1 }]}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
              <Pressable style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <IconSymbol name={showPassword ? "eye.slash" : "eye"} size={18} color={colors.muted} />
              </Pressable>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Password strength hints */}
          <View style={styles.hints}>
            {[
              { label: "8+ characters", ok: password.length >= 8 },
              { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
              { label: "Number", ok: /[0-9]/.test(password) },
            ].map((h, i) => (
              <View key={i} style={styles.hintRow}>
                <IconSymbol name={h.ok ? "checkmark.circle.fill" : "xmark.circle.fill"} size={14} color={h.ok ? "#22C55E" : colors.muted} />
                <Text style={[styles.hintText, { color: h.ok ? "#22C55E" : colors.muted }]}>{h.label}</Text>
              </View>
            ))}
          </View>

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitGradient}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>

          {/* Login link */}
          <Pressable style={styles.loginLink} onPress={() => router.push("/(auth)/login" as any)}>
            <Text style={[styles.loginLinkText, { color: colors.muted }]}>
              Already have an account? <Text style={{ color: "#E8344E", fontWeight: "600" }}>Log in</Text>
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
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrapper: { flexDirection: "row", alignItems: "center", position: "relative" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    flex: 1, height: 52, borderRadius: 14, borderWidth: 1.5,
    paddingLeft: 44, paddingRight: 16, fontSize: 15,
  },
  eyeBtn: { position: "absolute", right: 14 },
  errorText: { color: "#E8344E", fontSize: 12, marginTop: 4, marginLeft: 4 },
  hints: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 8 },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  hintText: { fontSize: 12 },
  submitBtn: { borderRadius: 30, overflow: "hidden", marginTop: 8 },
  submitGradient: { paddingVertical: 16, alignItems: "center" },
  submitText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  loginLink: { alignItems: "center", paddingVertical: 16 },
  loginLinkText: { fontSize: 14 },
});
