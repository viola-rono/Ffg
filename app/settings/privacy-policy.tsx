import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: colors.muted }]}>Last updated: July 2, 2026</Text>

        <Section title="1. Introduction" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            Embr Fluttur ("we", "us", "our", or "Company") operates the Embr Fluttur mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </Text>
        </Section>

        <Section title="2. Information Collection and Use" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </Text>
          <Subsection title="Types of Data Collected:" colors={colors}>
            <BulletPoint text="Personal Data: Email address, first name, last name, phone number, address, cookies and usage data" colors={colors} />
            <BulletPoint text="Usage Data: Pages visited, time and date of visit, time spent on pages, device information, IP address" colors={colors} />
            <BulletPoint text="Location Data: With your permission, we may collect precise location information" colors={colors} />
            <BulletPoint text="Media Files: Photos, videos, and other media you upload to the platform" colors={colors} />
          </Subsection>
        </Section>

        <Section title="3. Use of Data" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>Embr Fluttur uses the collected data for various purposes:</Text>
          <BulletPoint text="To provide and maintain our Service" colors={colors} />
          <BulletPoint text="To notify you about changes to our Service" colors={colors} />
          <BulletPoint text="To allow you to participate in interactive features of our Service" colors={colors} />
          <BulletPoint text="To provide customer support" colors={colors} />
          <BulletPoint text="To gather analysis or valuable information so we can improve our Service" colors={colors} />
          <BulletPoint text="To monitor the usage of our Service" colors={colors} />
          <BulletPoint text="To detect, prevent and address technical issues" colors={colors} />
        </Section>

        <Section title="4. Security of Data" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>
        </Section>

        <Section title="5. Changes to This Privacy Policy" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy.
          </Text>
        </Section>

        <Section title="6. Contact Us" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            If you have any questions about this Privacy Policy, please contact us at privacy@embrfluttur.com
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function Subsection({ title, children, colors }: any) {
  return (
    <View style={styles.subsection}>
      <Text style={[styles.subsectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

function BulletPoint({ text, colors }: any) {
  return (
    <View style={styles.bulletPoint}>
      <Text style={[styles.bullet, { color: colors.foreground }]}>•</Text>
      <Text style={[styles.bulletText, { color: colors.foreground }]}>{text}</Text>
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
  lastUpdated: { fontSize: 12, marginBottom: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  subsection: { marginLeft: 12, marginBottom: 12 },
  subsectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  text: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  bulletPoint: { flexDirection: "row", marginBottom: 8 },
  bullet: { fontSize: 16, marginRight: 8, marginTop: -2 },
  bulletText: { fontSize: 14, lineHeight: 21, flex: 1 },
});
