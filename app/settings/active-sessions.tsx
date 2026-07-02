import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, FlatList, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ActiveSessionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock sessions - in production, fetch from Supabase
    setSessions([
      {
        id: "1",
        device: "iPhone 14 Pro",
        browser: "Safari",
        location: "San Francisco, CA",
        ip: "192.168.1.100",
        lastActive: "Now",
        isCurrent: true,
      },
      {
        id: "2",
        device: "MacBook Pro",
        browser: "Chrome",
        location: "San Francisco, CA",
        ip: "192.168.1.101",
        lastActive: "2 hours ago",
        isCurrent: false,
      },
      {
        id: "3",
        device: "iPad Air",
        browser: "Safari",
        location: "New York, NY",
        ip: "203.0.113.45",
        lastActive: "1 day ago",
        isCurrent: false,
      },
    ]);
    setLoading(false);
  }, []);

  const handleLogoutSession = (sessionId: string) => {
    Alert.alert("Logout Session", "Sign out this device?", [
      { text: "Cancel" },
      {
        text: "Logout",
        onPress: () => {
          setSessions((prev) => prev.filter((s) => s.id !== sessionId));
          Alert.alert("Success", "Session terminated");
        },
      },
    ]);
  };

  const handleLogoutAllOthers = () => {
    Alert.alert(
      "Logout All Other Devices",
      "Sign out all other devices? You'll stay signed in on this device.",
      [
        { text: "Cancel" },
        {
          text: "Logout All",
          onPress: () => {
            setSessions((prev) => prev.filter((s) => s.isCurrent));
            Alert.alert("Success", "All other sessions have been terminated");
          },
        },
      ]
    );
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View style={[styles.sessionCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
      <View style={styles.sessionHeader}>
        <View style={styles.deviceIcon}>
          <IconSymbol
            name={item.device.includes("iPhone") ? "iphone" : item.device.includes("Mac") ? "laptop" : "iphone"}
            size={24}
            color="#E8344E"
          />
        </View>
        <View style={styles.sessionInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.deviceName, { color: colors.foreground }]}>{item.device}</Text>
            {item.isCurrent && (
              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>Current</Text>
              </View>
            )}
          </View>
          <Text style={[styles.browser, { color: colors.muted }]}>{item.browser}</Text>
        </View>
      </View>

      <View style={[styles.sessionMeta, { borderTopColor: colors.border }]}>
        <View style={styles.metaItem}>
          <IconSymbol name="location.fill" size={14} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>{item.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconSymbol name="globe" size={14} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>{item.ip}</Text>
        </View>
        <View style={styles.metaItem}>
          <IconSymbol name="clock" size={14} color={colors.muted} />
          <Text style={[styles.metaText, { color: colors.muted }]}>Active: {item.lastActive}</Text>
        </View>
      </View>

      {!item.isCurrent && (
        <Pressable
          style={[styles.logoutBtn, { borderTopColor: colors.border }]}
          onPress={() => handleLogoutSession(item.id)}
        >
          <IconSymbol name="arrow.turn.up.left" size={16} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="arrow.left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Active Sessions</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#E8344E" />
        </View>
      ) : (
        <>
          <FlatList
            data={sessions}
            keyExtractor={(s) => s.id}
            renderItem={renderSession}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.header2}>
                <Text style={[styles.header2Title, { color: colors.foreground }]}>
                  {sessions.length} {sessions.length === 1 ? "Device" : "Devices"}
                </Text>
                <Text style={[styles.header2Desc, { color: colors.muted }]}>
                  These devices have access to your account
                </Text>
              </View>
            }
          />

          {sessions.filter((s) => !s.isCurrent).length > 0 && (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Pressable style={[styles.logoutAllBtn, { backgroundColor: "#FEE2E2" }]} onPress={handleLogoutAllOthers}>
                <IconSymbol name="arrow.turn.up.left" size={18} color="#EF4444" />
                <Text style={styles.logoutAllBtnText}>Sign Out All Other Devices</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
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
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  header2: { paddingHorizontal: 16, paddingVertical: 12 },
  header2Title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  header2Desc: { fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 100 },
  sessionCard: {
    borderRadius: 12, borderWidth: 1, marginBottom: 12, overflow: "hidden",
  },
  sessionHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12 },
  deviceIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(232, 52, 78, 0.1)", alignItems: "center", justifyContent: "center" },
  sessionInfo: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  deviceName: { fontSize: 15, fontWeight: "700" },
  currentBadge: { backgroundColor: "#DBEAFE", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  currentBadgeText: { fontSize: 11, fontWeight: "700", color: "#0284C7" },
  browser: { fontSize: 12 },
  sessionMeta: { borderTopWidth: 1, paddingVertical: 8, paddingHorizontal: 12, gap: 6 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12 },
  logoutBtn: { borderTopWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  logoutBtnText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },
  footer: { borderTopWidth: 1, padding: 16, paddingBottom: 32 },
  logoutAllBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: 24 },
  logoutAllBtnText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});
