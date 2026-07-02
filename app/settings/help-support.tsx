import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, FlatList, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FAQ[] = [
  {
    id: "1",
    question: "How do I create a post?",
    answer: "Tap the '+' button in the tab bar, add your content (text, photos, or videos), and tap 'Post'. You can also add feelings, locations, music, and hashtags to make your post more engaging.",
  },
  {
    id: "2",
    question: "How do I follow someone?",
    answer: "Go to their profile and tap the 'Follow' button. You'll start seeing their posts in your feed. You can unfollow anytime by tapping 'Following'.",
  },
  {
    id: "3",
    question: "Can I edit or delete my posts?",
    answer: "Yes! Tap the three dots menu on your post and select 'Edit' or 'Delete'. Edits are marked with an '(edited)' label so others know the post was modified.",
  },
  {
    id: "4",
    question: "How do I enable Two-Factor Authentication?",
    answer: "Go to Settings > Security > Two-Factor Authentication. Follow the setup steps with your authenticator app (Google Authenticator, Authy, etc.) to enable 2FA.",
  },
  {
    id: "5",
    question: "What is the difference between followers and following?",
    answer: "'Followers' are people who follow you and see your posts. 'Following' are people whose posts you see in your feed. They don't have to be mutual.",
  },
  {
    id: "6",
    question: "How do I report inappropriate content?",
    answer: "Tap the three dots menu on any post or profile and select 'Report'. Choose the reason for reporting and provide details. Our team will review it.",
  },
  {
    id: "7",
    question: "Can I make my account private?",
    answer: "Yes! Go to Settings > Privacy > Private Account. When private, people must request to follow you, and only approved followers can see your posts.",
  },
  {
    id: "8",
    question: "How do I change my password?",
    answer: "Go to Settings > Account > Change Password. Enter your current password and your new password. You'll need to log in again with your new password.",
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const colors = useColors();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const renderFAQ = ({ item }: { item: FAQ }) => (
    <Pressable
      style={[styles.faqItem, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}
      onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.foreground }]} numberOfLines={expandedId === item.id ? undefined : 2}>
          {item.question}
        </Text>
        <IconSymbol
          name={expandedId === item.id ? "chevron.up" : "chevron.down"}
          size={20}
          color={colors.muted}
        />
      </View>
      {expandedId === item.id && (
        <Text style={[styles.faqAnswer, { color: colors.muted }]}>{item.answer}</Text>
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      <FlatList
        data={FAQS}
        keyExtractor={(item) => item.id}
        renderItem={renderFAQ}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header2}>
            <Text style={[styles.header2Title, { color: colors.foreground }]}>Frequently Asked Questions</Text>
            <Text style={[styles.header2Desc, { color: colors.muted }]}>Find answers to common questions about Embr Fluttur</Text>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.contactCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
            <View style={styles.contactIcon}>
              <IconSymbol name="questionmark.circle" size={32} color="#E8344E" />
            </View>
            <Text style={[styles.contactTitle, { color: colors.foreground }]}>Still need help?</Text>
            <Text style={[styles.contactDesc, { color: colors.muted }]}>
              Can't find what you're looking for? Contact our support team.
            </Text>
            <Pressable
              style={[styles.contactBtn, { borderColor: "#E8344E" }]}
              onPress={() => router.push("/settings/contact-us" as any)}
            >
              <Text style={styles.contactBtnText}>Contact Support</Text>
            </Pressable>
          </View>
        }
      />
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
  header2: { marginBottom: 16 },
  header2Title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  header2Desc: { fontSize: 13 },
  faqItem: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10,
  },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  faqQuestion: { fontSize: 14, fontWeight: "700", flex: 1, lineHeight: 20 },
  faqAnswer: { fontSize: 13, lineHeight: 20, marginTop: 12 },
  contactCard: {
    borderRadius: 12, borderWidth: 1, padding: 20, alignItems: "center", marginTop: 24,
  },
  contactIcon: { marginBottom: 12 },
  contactTitle: { fontSize: 16, fontWeight: "700", marginBottom: 6, textAlign: "center" },
  contactDesc: { fontSize: 13, textAlign: "center", marginBottom: 16, lineHeight: 18 },
  contactBtn: {
    borderWidth: 2, borderRadius: 24, paddingVertical: 10, paddingHorizontal: 24,
  },
  contactBtnText: { fontSize: 14, fontWeight: "700", color: "#E8344E", textAlign: "center" },
});
