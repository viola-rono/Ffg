import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  TextInput, Image, RefreshControl, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface UserCard {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  followers_count: number;
  is_following: boolean;
}

function UserCardItem({ user, onFollow, onPress }: {
  user: UserCard;
  onFollow: (id: string, follow: boolean) => void;
  onPress: (id: string) => void;
}) {
  const colors = useColors();
  const [following, setFollowing] = useState(user.is_following);

  const toggle = () => {
    const next = !following;
    setFollowing(next);
    onFollow(user.id, next);
  };

  return (
    <View style={[styles.userCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
      <Pressable style={styles.userCardLeft} onPress={() => onPress(user.id)}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.userAvatar} />
        ) : (
          <View style={[styles.userAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
            <IconSymbol name="person.fill" size={22} color={colors.muted} />
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.foreground }]}>{user.username}</Text>
          {user.full_name ? <Text style={[styles.userFullName, { color: colors.muted }]}>{user.full_name}</Text> : null}
          <Text style={[styles.userFollowers, { color: colors.muted }]}>{user.followers_count} followers</Text>
        </View>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.followBtn, following && styles.followingBtn, pressed && { opacity: 0.8 }]}
        onPress={toggle}
      >
        {following ? (
          <Text style={[styles.followBtnText, { color: colors.foreground }]}>Following</Text>
        ) : (
          <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followGradient}>
            <Text style={styles.followBtnTextWhite}>Follow</Text>
          </LinearGradient>
        )}
      </Pressable>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserCard[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"people" | "trending">("people");

  const fetchUsers = async (search = "") => {
    let q = supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, followers_count")
      .neq("id", user?.id ?? "")
      .limit(30);
    if (search) q = q.ilike("username", `%${search}%`);
    const { data } = await q;
    const mapped: UserCard[] = (data ?? []).map((p: any) => ({
      ...p,
      is_following: false,
    }));
    setUsers(mapped);
  };

  const fetchTrending = async () => {
    const { data } = await supabase
      .from("trending_hashtags")
      .select("tag, count")
      .order("count", { ascending: false })
      .limit(20);
    setTrendingHashtags(data ?? []);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchTrending()]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length > 1) await fetchUsers(text);
    else if (text.length === 0) await fetchUsers();
  }, []);

  const handleFollow = async (userId: string, follow: boolean) => {
    if (!user) return;
    if (follow) {
      await supabase.from("follows").upsert({ follower_id: user.id, following_id: userId });
    } else {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>Discover people and content</Text>
      </LinearGradient>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search people, hashtags..."
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {query ? (
          <Pressable onPress={() => handleSearch("")}>
            <IconSymbol name="xmark" size={16} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["people", "trending"] as const).map((tab) => (
          <Pressable key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, { color: activeTab === tab ? "#E8344E" : colors.muted }]}>
              {tab === "people" ? "People" : "Trending"}
            </Text>
            {activeTab === tab ? <View style={styles.tabIndicator} /> : null}
          </Pressable>
        ))}
      </View>

      {activeTab === "people" ? (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserCardItem
              user={item}
              onFollow={handleFollow}
              onPress={(id) => router.push(`/profile/${id}` as any)}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8344E" />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? (
              <View style={styles.skeletonList}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface }]}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ flex: 1, gap: 6 }}>
                      <Skeleton width={120} height={14} />
                      <Skeleton width={80} height={11} />
                    </View>
                    <Skeleton width={72} height={32} borderRadius={16} />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <IconSymbol name="person.2" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>No users found</Text>
              </View>
            )
          }
        />
      ) : (
        <FlatList
          data={trendingHashtags}
          keyExtractor={(h) => h.tag}
          renderItem={({ item, index }) => (
            <Pressable style={[styles.hashtagRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.hashtagRank, { backgroundColor: index < 3 ? "#E8344E" : colors.surface }]}>
                <Text style={[styles.hashtagRankText, { color: index < 3 ? "#FFF" : colors.muted }]}>#{index + 1}</Text>
              </View>
              <View style={styles.hashtagInfo}>
                <Text style={[styles.hashtagName, { color: colors.foreground }]}>#{item.tag}</Text>
                <Text style={[styles.hashtagCount, { color: colors.muted }]}>{item.count} posts</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8344E" />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="number" size={48} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>No trending hashtags yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  searchContainer: {
    flexDirection: "row", alignItems: "center", gap: 10,
    margin: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabText: { fontSize: 15, fontWeight: "600" },
  tabIndicator: { position: "absolute", bottom: 0, height: 2, width: "50%", backgroundColor: "#E8344E", borderRadius: 2 },
  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 80 },
  userCard: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  userCardLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userAvatar: { width: 48, height: 48, borderRadius: 24 },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "700" },
  userFullName: { fontSize: 13, marginTop: 1 },
  userFollowers: { fontSize: 12, marginTop: 2 },
  followBtn: { borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: "#E8344E" },
  followingBtn: { borderColor: "transparent", backgroundColor: "transparent" },
  followGradient: { paddingHorizontal: 16, paddingVertical: 7 },
  followBtnText: { fontSize: 13, fontWeight: "600", paddingHorizontal: 16, paddingVertical: 7 },
  followBtnTextWhite: { fontSize: 13, fontWeight: "600", color: "#FFF" },
  skeletonList: { gap: 8 },
  skeletonCard: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
  hashtagRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1,
  },
  hashtagRank: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  hashtagRankText: { fontSize: 12, fontWeight: "700" },
  hashtagInfo: { flex: 1 },
  hashtagName: { fontSize: 15, fontWeight: "600" },
  hashtagCount: { fontSize: 12, marginTop: 2 },
});
