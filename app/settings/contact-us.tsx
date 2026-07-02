import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

export default function ContactUsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, profile } = useSupabaseAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "general", label: "General Inquiry" },
    { id: "bug", label: "Report a Bug" },
    { id: "feature", label: "Feature Request" },
    { id: "account", label: "Account Issue" },
    { id: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages").insert({
        user_id: user?.id,
        email: user?.email,
        name: profile?.full_name || profile?.username || "Anonymous",
        subject,
        category,
        message,
        status: "new",
      });

      if (error) throw error;

      Alert.alert("Success", "Your message has been sent. We'll get back to you soon!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
      setSubject("");
      setMessage("");
      setCategory("general");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={{ width: 30 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Intro */}
          <View style={[styles.card, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
            <View style={styles.introIcon}>
              <IconSymbol name="envelope" size={32} color="#E8344E" />
            </View>
            <Text style={[styles.introTitle, { color: colors.foreground }]}>We'd love to hear from you</Text>
            <Text style={[styles.introDesc, { color: colors.muted }]}>
              Have a question or feedback? Send us a message and we'll respond as soon as possible.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            {/* Category */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryBtn,
                      {
                        backgroundColor: category === cat.id ? "#E8344E" : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        { color: category === cat.id ? "#FFF" : colors.foreground },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Subject */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Subject</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="What is this about?"
                placeholderTextColor={colors.muted}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            {/* Message */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Message</Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Tell us more..."
                placeholderTextColor={colors.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <Pressable style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.submitBtnGradient}>
                  <Text style={styles.submitBtnText}>Send Message</Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>

          {/* Contact Info */}
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Other ways to reach us</Text>
            <ContactMethod icon="envelope" text="support@embrfluttur.com" colors={colors} />
            <ContactMethod icon="globe" text="www.embrfluttur.com" colors={colors} />
            <ContactMethod icon="phone" text="+1 (555) 123-4567" colors={colors} />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function ContactMethod({ icon, text, colors }: any) {
  return (
    <View style={styles.contactMethod}>
      <IconSymbol name={icon} size={18} color="#E8344E" />
      <Text style={[styles.contactMethodText, { color: colors.foreground }]}>{text}</Text>
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
    borderRadius: 12, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 24,
  },
  introIcon: { marginBottom: 12 },
  introTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  introDesc: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  formSection: { marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryBtn: {
    flex: 1, minWidth: "48%", paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center",
  },
  categoryBtnText: { fontSize: 12, fontWeight: "700" },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  textArea: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  submitBtn: { height: 52, borderRadius: 24, overflow: "hidden" },
  submitBtnGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  submitBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
  infoCard: {
    borderRadius: 12, borderWidth: 1, padding: 16,
  },
  infoTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  contactMethod: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  contactMethodText: { fontSize: 13, fontWeight: "500" },
});
