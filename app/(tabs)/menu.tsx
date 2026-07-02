import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, Switch, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeContext } from "@/lib/theme-provider";

interface SettingRow {
  icon: string;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingItem({ icon, label, onPress, rightElement, destructive }: SettingRow) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingItem,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? "#FFF0F0" : "#FFF5F7" }]}>
        <IconSymbol name={icon} size={18} color={destructive ? "#E8344E" : "#E8344E"} />
      </View>
      <Text style={[styles.settingLabel, { color: destructive ? "#E8344E" : colors.foreground }]}>{label}</Text>
      {rightElement ?? <IconSymbol name="chevron.right" size={16} color={colors.muted} />}
    </Pressable>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function MenuScreen() {
  const router = useRouter();
  const colors = useColors();
  const { profile, user, signOut } = useSupabaseAuth();
  const { colorScheme, setColorScheme } = useThemeContext();
  const isDark = colorScheme === "dark";

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}
          onPress={() => router.push(`/profile/${user?.id}` as any)}
        >
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.profileAvatar} />
          ) : (
            <View style={[styles.profileAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
              <IconSymbol name="person.fill" size={28} color={colors.muted} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>{profile?.full_name ?? profile?.username ?? "User"}</Text>
            <Text style={[styles.profileUsername, { color: colors.muted }]}>@{profile?.username ?? "..."}</Text>
            <View style={styles.profileStats}>
              <Text style={[styles.profileStat, { color: colors.muted }]}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{profile?.posts_count ?? 0}</Text> Posts
              </Text>
              <Text style={[styles.profileStat, { color: colors.muted }]}>
                <Text style={{ color: colors.foreground, fontWeight: "700" }}>{profile?.followers_count ?? 0}</Text> Followers
              </Text>
            </View>
          </View>
          <IconSymbol name="chevron.right" size={18} color={colors.muted} />
        </Pressable>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {[
            { icon: "bookmark.fill", label: "Saved", onPress: () => {} },
            { icon: "person.2.fill", label: "Friends", onPress: () => router.push("/(tabs)/explore" as any) },
            { icon: "bubble.left.fill", label: "Messages", onPress: () => {} },
            { icon: "star.fill", label: "Activity", onPress: () => {} },
          ].map((action) => (
            <Pressable
              key={action.label}
              style={[styles.quickAction, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}
              onPress={action.onPress}
            >
              <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.quickActionIcon}>
                <IconSymbol name={action.icon} size={20} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.quickActionLabel, { color: colors.foreground }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Account */}
        <SettingSection title="ACCOUNT">
          <SettingItem icon="person.crop.circle" label="Edit Profile" onPress={() => {}} />
          <SettingItem icon="at" label="Change Username" onPress={() => {}} />
          <SettingItem icon="envelope" label="Change Email" onPress={() => {}} />
          <SettingItem icon="lock" label="Change Password" onPress={() => {}} />
        </SettingSection>

        {/* Privacy */}
        <SettingSection title="PRIVACY">
          <SettingItem
            icon="lock.fill"
            label="Private Account"
            rightElement={
              <Switch
                value={profile?.is_private ?? false}
                trackColor={{ false: colors.border, true: "#E8344E" }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingItem icon="nosign" label="Blocked Users" onPress={() => {}} />
          <SettingItem icon="volume.slash.fill" label="Muted Users" onPress={() => {}} />
        </SettingSection>

        {/* Notifications */}
        <SettingSection title="NOTIFICATIONS">
          <SettingItem
            icon="bell.badge"
            label="Push Notifications"
            rightElement={
              <Switch value={true} trackColor={{ false: colors.border, true: "#E8344E" }} thumbColor="#FFF" />
            }
          />
          <SettingItem
            icon="envelope.fill"
            label="Email Notifications"
            rightElement={
              <Switch value={true} trackColor={{ false: colors.border, true: "#E8344E" }} thumbColor="#FFF" />
            }
          />
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="APPEARANCE">
          <SettingItem
            icon="paintbrush.fill"
            label="Dark Mode"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={(v) => setColorScheme(v ? "dark" : "light")}
                trackColor={{ false: colors.border, true: "#E8344E" }}
                thumbColor="#FFF"
              />
            }
          />
        </SettingSection>

        {/* Security */}
        <SettingSection title="SECURITY">
          <SettingItem icon="shield.fill" label="Two-Factor Authentication" onPress={() => {}} />
          <SettingItem icon="iphone" label="Active Sessions" onPress={() => {}} />
          <SettingItem icon="arrow.clockwise" label="Logout All Devices" onPress={() => {}} />
        </SettingSection>

        {/* Storage */}
        <SettingSection title="STORAGE">
          <SettingItem icon="trash" label="Clear Cache" onPress={() => Alert.alert("Cache Cleared", "Local cache has been cleared.")} />
        </SettingSection>

        {/* About */}
        <SettingSection title="ABOUT">
          <SettingItem icon="doc.text" label="Privacy Policy" onPress={() => {}} />
          <SettingItem icon="doc.text.fill" label="Terms of Service" onPress={() => {}} />
          <SettingItem icon="questionmark.circle" label="Help & Support" onPress={() => {}} />
          <SettingItem icon="envelope" label="Contact Us" onPress={() => {}} />
          <SettingItem icon="info.circle" label="App Version 1.0.0" rightElement={<View />} />
        </SettingSection>

        {/* Sign Out */}
        <Pressable
          style={({ pressed }) => [styles.signOutBtn, { borderColor: "#E8344E" }, pressed && { opacity: 0.7 }]}
          onPress={handleSignOut}
        >
          <IconSymbol name="arrow.right" size={18} color="#E8344E" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  scrollContent: { padding: 16, gap: 16 },
  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, borderRadius: 16, borderWidth: 1,
  },
  profileAvatar: { width: 60, height: 60, borderRadius: 30 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: "700" },
  profileUsername: { fontSize: 13, marginTop: 2 },
  profileStats: { flexDirection: "row", gap: 12, marginTop: 4 },
  profileStat: { fontSize: 12 },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: {
    flex: 1, alignItems: "center", gap: 8, padding: 14,
    borderRadius: 14, borderWidth: 1,
  },
  quickActionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickActionLabel: { fontSize: 12, fontWeight: "500" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5, paddingLeft: 4 },
  sectionCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  settingItem: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 14, borderBottomWidth: 1,
  },
  settingIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { flex: 1, fontSize: 15 },
  signOutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5,
  },
  signOutText: { fontSize: 16, fontWeight: "700", color: "#E8344E" },
});
