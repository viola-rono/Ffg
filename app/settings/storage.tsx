import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface StorageItem {
  name: string;
  size: number;
  icon: string;
  color: string;
}

export default function StorageScreen() {
  const router = useRouter();
  const colors = useColors();
  const [storageItems, setStorageItems] = useState<StorageItem[]>([
    { name: "Cache", size: 245, icon: "photo", color: "#3B82F6" },
    { name: "Temp Files", size: 128, icon: "doc.text", color: "#8B5CF6" },
    { name: "Downloads", size: 512, icon: "arrow.down", color: "#EC4899" },
  ]);
  const [loading, setLoading] = useState(false);

  const totalSize = storageItems.reduce((sum, item) => sum + item.size, 0);

  const handleClearCache = async () => {
    Alert.alert("Clear Cache", "This will free up space but may slow down the app temporarily.", [
      { text: "Cancel" },
      {
        text: "Clear",
        onPress: async () => {
          setLoading(true);
          try {
            await AsyncStorage.removeItem("cache");
            setStorageItems((prev) => prev.map((item) => (item.name === "Cache" ? { ...item, size: 0 } : item)));
            Alert.alert("Success", "Cache cleared successfully");
          } catch (err) {
            Alert.alert("Error", "Failed to clear cache");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleClearItem = (itemName: string) => {
    Alert.alert(`Clear ${itemName}`, `Are you sure you want to delete all ${itemName.toLowerCase()}?`, [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: () => {
          setStorageItems((prev) => prev.map((item) => (item.name === itemName ? { ...item, size: 0 } : item)));
          Alert.alert("Success", `${itemName} cleared`);
        },
      },
    ]);
  };

  const handleClearAll = async () => {
    Alert.alert("Clear All Storage", "This will delete all cached data. This action cannot be undone.", [
      { text: "Cancel" },
      {
        text: "Delete All",
        onPress: async () => {
          setLoading(true);
          try {
            await AsyncStorage.clear();
            setStorageItems(storageItems.map((item) => ({ ...item, size: 0 })));
            Alert.alert("Success", "All storage cleared");
          } catch (err) {
            Alert.alert("Error", "Failed to clear storage");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const renderStorageItem = (item: StorageItem) => (
    <View key={item.name} style={[styles.storageItem, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemLeft}>
        <View style={[styles.itemIcon, { backgroundColor: `${item.color}20` }]}>
          <IconSymbol name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.foreground }]}>{item.name}</Text>
          <Text style={[styles.itemSize, { color: colors.muted }]}>{item.size} MB</Text>
        </View>
      </View>
      {item.size > 0 && (
        <Pressable onPress={() => handleClearItem(item.name)}>
          <IconSymbol name="trash" size={20} color="#EF4444" />
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
        <Text style={styles.headerTitle}>Storage</Text>
        <View style={{ width: 30 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Storage Overview */}
        <View style={[styles.card, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Storage Usage</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageBarFill, { width: `${Math.min((totalSize / 1000) * 100, 100)}%` }]} />
          </View>
          <View style={styles.storageStats}>
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{totalSize} MB</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Used</Text>
            </View>
            <View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{1000 - totalSize} MB</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Available</Text>
            </View>
          </View>
        </View>

        {/* Storage Items */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Storage Details</Text>
          {storageItems.map(renderStorageItem)}
        </View>

        {/* Clear All Button */}
        {totalSize > 0 && (
          <Pressable style={[styles.clearAllBtn, { backgroundColor: "#FEE2E2" }]} onPress={handleClearAll} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <IconSymbol name="trash" size={18} color="#EF4444" />
                <Text style={styles.clearAllBtnText}>Clear All Storage</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="info.circle" size={20} color={colors.muted} />
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Clearing cache and temporary files won't affect your account data. Your photos, messages, and posts are safely stored in the cloud.
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
    borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 24,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  storageBar: {
    height: 8, backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: 16,
  },
  storageBarFill: { height: "100%", backgroundColor: "#E8344E" },
  storageStats: { flexDirection: "row", justifyContent: "space-around" },
  statValue: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  statLabel: { fontSize: 12, marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  storageItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  itemIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  itemInfo: {},
  itemName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  itemSize: { fontSize: 12 },
  clearAllBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 24, paddingVertical: 12, marginVertical: 24,
  },
  clearAllBtnText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    borderRadius: 12, borderWidth: 1, padding: 12,
  },
  infoText: { fontSize: 13, lineHeight: 18, flex: 1 },
});
