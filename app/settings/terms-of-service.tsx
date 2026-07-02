import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TermsOfServiceScreen() {
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.lastUpdated, { color: colors.muted }]}>Last updated: July 2, 2026</Text>

        <Section title="1. Terms" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            By accessing and using the Embr Fluttur mobile application, you accept and agree to be bound by the terms and provision of this agreement.
          </Text>
        </Section>

        <Section title="2. Use License" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            Permission is granted to temporarily download one copy of the materials (information or software) on Embr Fluttur for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <BulletPoint text="Modify or copy the materials" colors={colors} />
          <BulletPoint text="Use the materials for any commercial purpose or for any public display" colors={colors} />
          <BulletPoint text="Attempt to decompile or reverse engineer any software contained on the Service" colors={colors} />
          <BulletPoint text="Remove any copyright or other proprietary notations from the materials" colors={colors} />
          <BulletPoint text="Transfer the materials to another person or 'mirror' the materials on any other server" colors={colors} />
        </Section>

        <Section title="3. Disclaimer" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            The materials on Embr Fluttur are provided on an 'as is' basis. Embr Fluttur makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Text>
        </Section>

        <Section title="4. Limitations" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            In no event shall Embr Fluttur or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Embr Fluttur.
          </Text>
        </Section>

        <Section title="5. Accuracy of Materials" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            The materials appearing on Embr Fluttur could include technical, typographical, or photographic errors. Embr Fluttur does not warrant that any of the materials on its Service are accurate, complete, or current. Embr Fluttur may make changes to the materials contained on its Service at any time without notice.
          </Text>
        </Section>

        <Section title="6. Links" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            Embr Fluttur has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Embr Fluttur of the site. Use of any such linked website is at the user's own risk.
          </Text>
        </Section>

        <Section title="7. Modifications" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            Embr Fluttur may revise these terms of service for its Service at any time without notice. By using this Service, you are agreeing to be bound by the then current version of these terms of service.
          </Text>
        </Section>

        <Section title="8. Governing Law" colors={colors}>
          <Text style={[styles.text, { color: colors.foreground }]}>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Embr Fluttur operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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
  text: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  bulletPoint: { flexDirection: "row", marginBottom: 8 },
  bullet: { fontSize: 16, marginRight: 8, marginTop: -2 },
  bulletText: { fontSize: 14, lineHeight: 21, flex: 1 },
});
