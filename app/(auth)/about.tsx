import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const FEATURES = [
  { icon: "photo.fill", title: "Share Moments", desc: "Post photos, videos, and stories with your community." },
  { icon: "bubble.left.fill", title: "Real Conversations", desc: "Comment, reply, and connect through threaded discussions." },
  { icon: "magnifyingglass", title: "Discover Content", desc: "Explore trending posts, creators, and hashtags." },
  { icon: "bell.fill", title: "Stay Updated", desc: "Real-time notifications keep you in the loop." },
  { icon: "paperplane.fill", title: "Private Messaging", desc: "Chat privately with friends and share media." },
  { icon: "shield.fill", title: "Your Privacy", desc: "Control who sees your content with granular privacy settings." },
];

export default function AboutScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable style={styles.skipBtn} onPress={() => router.push("/(auth)/signup" as any)}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <Text style={styles.headerTitle}>About Embr Fluttur</Text>
        <Text style={styles.headerSubtitle}>Everything you need to know</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.introTitle, { color: colors.foreground }]}>Welcome to the Community</Text>
          <Text style={[styles.introText, { color: colors.muted }]}>
            Embr Fluttur is a vibrant social platform where you can share your life, discover amazing content, and connect with people who share your passions.
          </Text>
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What You Can Do</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={[styles.featureRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.featureIcon}>
              <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.iconGradient}>
                <IconSymbol name={f.icon} size={20} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.muted }]}>{f.desc}</Text>
            </View>
          </View>
        ))}

        {/* Community Guidelines */}
        <View style={[styles.guidelinesCard, { backgroundColor: "#FFF5F7", borderColor: "#FFD0D8" }]}>
          <Text style={[styles.guidelinesTitle, { color: "#E8344E" }]}>Community Guidelines</Text>
          <Text style={[styles.guidelinesText, { color: "#666" }]}>
            Be respectful, authentic, and kind. We do not tolerate harassment, hate speech, or harmful content. Violations may result in account suspension.
          </Text>
        </View>

        {/* Privacy */}
        <View style={[styles.guidelinesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.guidelinesTitle, { color: colors.foreground }]}>Your Privacy Matters</Text>
          <Text style={[styles.guidelinesText, { color: colors.muted }]}>
            We never sell your data. You control your privacy settings, who can see your posts, and who can message you. Read our full Privacy Policy in Settings.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] }]}
          onPress={() => router.push("/(auth)/signup" as any)}
        >
          <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
            <Text style={styles.ctaText}>Create Account</Text>
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.loginLink} onPress={() => router.push("/(auth)/login" as any)}>
          <Text style={[styles.loginLinkText, { color: colors.muted }]}>
            Already have an account? <Text style={{ color: "#E8344E", fontWeight: "600" }}>Log in</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  skipBtn: { alignSelf: "flex-end", marginBottom: 12 },
  skipText: { color: "rgba(255,255,255,0.8)", fontSize: 15, fontWeight: "500" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFF" },
  headerSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  introCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  introTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  introText: { fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginTop: 8, marginBottom: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1, gap: 14 },
  featureIcon: { flexShrink: 0 },
  iconGradient: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: "600" },
  featureDesc: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  guidelinesCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  guidelinesTitle: { fontSize: 15, fontWeight: "700", marginBottom: 8 },
  guidelinesText: { fontSize: 13, lineHeight: 20 },
  bottomBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32, borderTopWidth: 1, gap: 8 },
  ctaBtn: { borderRadius: 30, overflow: "hidden" },
  ctaGradient: { paddingVertical: 16, alignItems: "center" },
  ctaText: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  loginLink: { alignItems: "center", paddingVertical: 8 },
  loginLinkText: { fontSize: 14 },
});
