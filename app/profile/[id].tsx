import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Image, RefreshControl, ScrollView, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

const { width } = Dimensions.get("window");
const GRID_SIZE = (width - 4) / 3;

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  website: string | null;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_private: boolean;
  is_following: boolean;
  is_own: boolean;
}

type ProfileTab = "posts" | "media" | "tagged" | "reposts";

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      let isFollowing = false;
      if (user && user.id !== id) {
        const { data: follow } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", id)
          .single();
        isFollowing = !!follow;
      }
      setProfile({
        ...data,
        is_following: isFollowing,
        is_own: user?.id === id,
      });
    }
  };

  const fetchPosts = async () => {
    if (!id) return;
    const { data } = await supabase
      .from("posts")
      .select("id, image_urls, video_url, content, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(30);
    setPosts(data ?? []);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchProfile(), fetchPosts()]);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [id]);

  const handleFollow = async () => {
    if (!user || !profile) return;
    const newFollowing = !profile.is_following;
    setProfile((p) => p ? { ...p, is_following: newFollowing, followers_count: p.followers_count + (newFollowing ? 1 : -1) } : p);
    if (newFollowing) {
      await supabase.from("follows").upsert({ follower_id: user.id, following_id: profile.id });
    } else {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
    }
  };

  const renderHeader = () => (
    <View>
      {/* Cover */}
      <View style={styles.coverContainer}>
        {profile?.cover_url ? (
          <Image source={{ uri: profile.cover_url }} style={styles.cover} resizeMode="cover" />
        ) : (
          <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.cover} />
        )}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <View style={styles.backBtnBg}>
            <IconSymbol name="arrow.left" size={20} color="#FFF" />
          </View>
        </Pressable>
      </View>

      {/* Avatar + actions */}
      <View style={[styles.profileInfo, { backgroundColor: colors.background }]}>
        <View style={styles.avatarRow}>
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={["#E8344E", "#FF6B35", "#FF9500"]} style={styles.avatarRing}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
                  <IconSymbol name="person.fill" size={36} color={colors.muted} />
                </View>
              )}
            </LinearGradient>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            {profile?.is_own ? (
              <Pressable
                style={[styles.editBtn, { borderColor: colors.border }]}
                onPress={() => router.push("/settings" as any)}
              >
                <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit Profile</Text>
              </Pressable>
            ) : (
              <>
                <Pressable
                  style={styles.followBtn}
                  onPress={handleFollow}
                >
                  {profile?.is_following ? (
                    <View style={[styles.followingBtnInner, { borderColor: colors.border }]}>
                      <Text style={[styles.followingText, { color: colors.foreground }]}>Following</Text>
                    </View>
                  ) : (
                    <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followBtnInner}>
                      <Text style={styles.followText}>Follow</Text>
                    </LinearGradient>
                  )}
                </Pressable>
                <Pressable
                  style={[styles.messageBtn, { borderColor: colors.border }]}
                  onPress={() => router.push(`/chat/${profile?.id}` as any)}
                >
                  <IconSymbol name="bubble.left" size={18} color={colors.foreground} />
                </Pressable>
                <Pressable style={[styles.shareBtn, { borderColor: colors.border }]}>
                  <IconSymbol name="square.and.arrow.up" size={18} color={colors.foreground} />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Name & bio */}
        <Text style={[styles.displayName, { color: colors.foreground }]}>{profile?.full_name ?? profile?.username}</Text>
        <Text style={[styles.username, { color: colors.muted }]}>@{profile?.username}</Text>
        {profile?.bio ? <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text> : null}
        {profile?.website ? (
          <View style={styles.websiteRow}>
            <IconSymbol name="link" size={13} color="#E8344E" />
            <Text style={styles.website}>{profile.website}</Text>
          </View>
        ) : null}

        {/* Stats */}
        <View style={[styles.statsRow, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          {[
            { label: "Posts", value: profile?.posts_count ?? 0 },
            { label: "Followers", value: profile?.followers_count ?? 0 },
            { label: "Following", value: profile?.following_count ?? 0 },
          ].map((stat) => (
            <View key={stat.label} style={styles.stat}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
          {(["posts", "media", "tagged", "reposts"] as ProfileTab[]).map((tab) => (
            <Pressable key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, { color: activeTab === tab ? "#E8344E" : colors.muted }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.cover, { backgroundColor: colors.surface }]} />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton width={80} height={80} borderRadius={40} />
          <Skeleton width={160} height={18} />
          <Skeleton width={100} height={14} />
          <Skeleton width="100%" height={14} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8344E" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.gridItem}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            {item.image_urls?.[0] ? (
              <Image source={{ uri: item.image_urls[0] }} style={styles.gridImage} />
            ) : (
              <View style={[styles.gridImage, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
                <IconSymbol name="doc.text" size={24} color={colors.muted} />
              </View>
            )}
            {item.image_urls?.length > 1 ? (
              <View style={styles.multipleIndicator}>
                <IconSymbol name="photo" size={12} color="#FFF" />
              </View>
            ) : null}
          </Pressable>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <IconSymbol name="photo" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>No posts yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverContainer: { position: "relative", height: 180 },
  cover: { width: "100%", height: 180 },
  backBtn: { position: "absolute", top: 48, left: 16 },
  backBtnBg: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center",
  },
  profileInfo: { paddingHorizontal: 16, paddingBottom: 0 },
  avatarRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44 },
  avatarWrapper: {},
  avatarRing: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFF" },
  avatar: { width: 82, height: 82, borderRadius: 41 },
  actionButtons: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editBtnText: { fontSize: 14, fontWeight: "600" },
  followBtn: { borderRadius: 20, overflow: "hidden" },
  followBtnInner: { paddingHorizontal: 20, paddingVertical: 8 },
  followText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  followingBtnInner: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  followingText: { fontWeight: "600", fontSize: 14 },
  messageBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  shareBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  displayName: { fontSize: 20, fontWeight: "800", marginTop: 10 },
  username: { fontSize: 14, marginTop: 2 },
  bio: { fontSize: 14, lineHeight: 20, marginTop: 8 },
  websiteRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  website: { fontSize: 13, color: "#E8344E" },
  statsRow: {
    flexDirection: "row", justifyContent: "space-around",
    borderTopWidth: 1, borderBottomWidth: 1, marginTop: 16, paddingVertical: 12,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800" },
  statLabel: { fontSize: 12, marginTop: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: 1, marginTop: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, position: "relative" },
  tabText: { fontSize: 13, fontWeight: "600" },
  tabIndicator: { position: "absolute", bottom: 0, height: 2, width: "60%", backgroundColor: "#E8344E", borderRadius: 2 },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, margin: 1, position: "relative" },
  gridImage: { width: "100%", height: "100%" },
  multipleIndicator: { position: "absolute", top: 6, right: 6 },
  emptyPosts: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 15 },
});
