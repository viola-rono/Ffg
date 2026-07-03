import React, { useState, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  RefreshControl, ActivityIndicator, TextInput, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { PostSkeleton, StorySkeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Story {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_own: boolean;
}

interface Post {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  content: string | null;
  image_urls: string[] | null;
  video_url: string | null;
  location: string | null;
  music_title: string | null;
  music_artist: string | null;
  feeling: string | null;
  hashtags: string[] | null;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
  is_edited: boolean;
}

// ─── Story Item ───────────────────────────────────────────────────────────────
function StoryItem({ story, onPress }: { story: Story; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable style={styles.storyItem} onPress={onPress}>
      <LinearGradient
        colors={story.is_own ? ["#ccc", "#ccc"] : ["#E8344E", "#FF6B35", "#FF9500"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.storyRing}
      >
        <View style={[styles.storyAvatarBorder, { backgroundColor: colors.background }]}>
          {story.avatar_url ? (
            <Image source={{ uri: story.avatar_url }} style={styles.storyAvatar} />
          ) : (
            <View style={[styles.storyAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
              <IconSymbol name="person.fill" size={24} color={colors.muted} />
            </View>
          )}
        </View>
      </LinearGradient>
      {story.is_own && (
        <View style={styles.addStoryBtn}>
          <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.addStoryGradient}>
            <IconSymbol name="plus" size={10} color="#FFF" />
          </LinearGradient>
        </View>
      )}
      <Text style={[styles.storyName, { color: colors.foreground }]} numberOfLines={1}>
        {story.is_own ? "Your Story" : story.username}
      </Text>
    </Pressable>
  );
}

// ─── Post Composer ────────────────────────────────────────────────────────────
function PostComposer({ profile, onPress }: { profile: any; onPress: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.composerCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
      <View style={styles.composerTop}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.composerAvatar} />
        ) : (
          <View style={[styles.composerAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
            <IconSymbol name="person.fill" size={20} color={colors.muted} />
          </View>
        )}
        <Pressable style={[styles.composerInput, { backgroundColor: colors.surface }]} onPress={onPress}>
          <Text style={[styles.composerPlaceholder, { color: colors.muted }]}>Share your thoughts...</Text>
        </Pressable>
      </View>
      <View style={[styles.composerDivider, { backgroundColor: colors.border }]} />
      <View style={styles.composerActions}>
        {[
          { icon: "photo", label: "Photo" },
          { icon: "video", label: "Video" },
          { icon: "face.smiling", label: "Feeling" },
        ].map((action) => (
          <Pressable key={action.label} style={styles.composerAction} onPress={onPress}>
            <IconSymbol name={action.icon} size={18} color="#E8344E" />
            <Text style={[styles.composerActionText, { color: "#E8344E" }]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, onSave, onComment, onShare, onMenu }: {
  post: Post;
  onLike: (id: string, liked: boolean) => void;
  onSave: (id: string, saved: boolean) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onMenu: (id: string) => void;
}) {
  const colors = useColors();
  const router = useRouter();
  const [liked, setLiked] = useState(post.is_liked);
  const [saved, setSaved] = useState(post.is_saved);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => c + (newLiked ? 1 : -1));
    onLike(post.id, newLiked);
  };

  const handleSave = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    onSave(post.id, newSaved);
  };

  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(post.created_at), { addSuffix: true }); }
    catch { return ""; }
  })();

  return (
    <View style={[styles.postCard, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Pressable style={styles.postHeaderLeft} onPress={() => router.push(`/profile/${post.user_id}` as any)}>
          {post.avatar_url ? (
            <Image source={{ uri: post.avatar_url }} style={styles.postAvatar} />
          ) : (
            <View style={[styles.postAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
              <IconSymbol name="person.fill" size={20} color={colors.muted} />
            </View>
          )}
          <View style={styles.onlineDot} />
          <View style={styles.postHeaderInfo}>
            <Text style={[styles.postUsername, { color: colors.foreground }]}>{post.username}</Text>
            <View style={styles.postMeta}>
              <Text style={[styles.postTime, { color: colors.muted }]}>{timeAgo}</Text>
              {post.location ? (
                <>
                  <IconSymbol name="location.fill" size={11} color="#E8344E" />
                  <Text style={[styles.postLocation, { color: "#E8344E" }]} numberOfLines={1}>{post.location}</Text>
                </>
              ) : null}
            </View>
          </View>
        </Pressable>
        <Pressable onPress={() => onMenu(post.id)} style={styles.menuBtn}>
          <IconSymbol name="ellipsis.vertical" size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Music tag */}
      {post.music_title ? (
        <View style={styles.musicTag}>
          <IconSymbol name="music.note" size={13} color="#E8344E" />
          <Text style={[styles.musicText, { color: colors.muted }]} numberOfLines={1}>
            {post.music_title}{post.music_artist ? ` – ${post.music_artist}` : ""}
          </Text>
        </View>
      ) : null}

      {/* Content */}
      {post.content ? (
        <Text style={[styles.postContent, { color: colors.foreground }]}>
          {post.content}
          {post.is_edited ? <Text style={{ color: colors.muted, fontSize: 12 }}> (edited)</Text> : null}
        </Text>
      ) : null}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 ? (
        <View style={styles.hashtagRow}>
          {post.hashtags.slice(0, 5).map((tag, i) => (
            <Text key={i} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      ) : null}

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 ? (
        <Pressable onPress={() => router.push(`/post/${post.id}` as any)}>
          <Image
            source={{ uri: post.image_urls[0] }}
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.image_urls.length > 1 ? (
            <View style={styles.moreImages}>
              <Text style={styles.moreImagesText}>+{post.image_urls.length - 1} more</Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}

      {/* View count */}
      {post.views_count > 0 ? (
        <View style={styles.viewCount}>
          <IconSymbol name="eye" size={13} color="rgba(255,255,255,0.8)" />
          <Text style={styles.viewCountText}>{post.views_count.toLocaleString()}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={[styles.postActions, { borderTopColor: colors.border }]}>
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <IconSymbol name={liked ? "heart.fill" : "heart"} size={22} color={liked ? "#E8344E" : colors.muted} />
          {likesCount > 0 ? <Text style={[styles.actionCount, { color: colors.muted }]}>{likesCount}</Text> : null}
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onComment(post.id)}>
          <IconSymbol name="bubble.left" size={22} color={colors.muted} />
          {post.comments_count > 0 ? <Text style={[styles.actionCount, { color: colors.muted }]}>{post.comments_count}</Text> : null}
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => onShare(post.id)}>
          <IconSymbol name="square.and.arrow.up" size={22} color={colors.muted} />
        </Pressable>
        <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave}>
          <IconSymbol name={saved ? "bookmark.fill" : "bookmark"} size={22} color={saved ? "#E8344E" : colors.muted} />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { profile, user } = useSupabaseAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;

  const fetchStories = async () => {
    if (!user) return;
    const ownStory: Story = {
      id: "own",
      user_id: user.id,
      username: profile?.username ?? "You",
      avatar_url: profile?.avatar_url ?? null,
      is_own: true,
    };
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .neq("id", user.id)
      .limit(10);
    const others: Story[] = (data ?? []).map((p: any) => ({
      id: p.id,
      user_id: p.id,
      username: p.username,
      avatar_url: p.avatar_url,
      is_own: false,
    }));
    setStories([ownStory, ...others]);
  };

  const fetchPosts = async (from = 0, append = false) => {
    if (!user) return;
    const { data: rawPosts, error } = await supabase
      .from("posts")
      .select("*, profiles(username, full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      console.error("Fetch posts error:", error);
      return;
    }

    const mapped: Post[] = (rawPosts ?? []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      username: p.profiles?.username ?? "user",
      full_name: p.profiles?.full_name ?? null,
      avatar_url: p.profiles?.avatar_url ?? null,
      content: p.content,
      image_urls: p.image_urls,
      video_url: p.video_url,
      location: p.location,
      music_title: p.music_title,
      music_artist: p.music_artist,
      feeling: p.feeling,
      hashtags: p.hashtags,
      likes_count: p.likes_count ?? 0,
      comments_count: p.comments_count ?? 0,
      views_count: p.views_count ?? 0,
      is_liked: false,
      is_saved: false,
      created_at: p.created_at,
      is_edited: p.is_edited ?? false,
    }));
    if (append) setPosts((prev) => [...prev, ...mapped]);
    else setPosts(mapped);
    setHasMore(mapped.length === PAGE_SIZE);
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStories(), fetchPosts(0, false)]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStories(), fetchPosts(0, false)]);
    setRefreshing(false);
  }, [user]);

  const onLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPosts(posts.length, true);
    setLoadingMore(false);
  };

  const handleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    if (liked) {
      await supabase.from("post_likes").upsert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    }
  };

  const handleSave = async (postId: string, saved: boolean) => {
    if (!user) return;
    if (saved) {
      await supabase.from("saved_posts").upsert({ post_id: postId, user_id: user.id });
    } else {
      await supabase.from("saved_posts").delete().eq("post_id", postId).eq("user_id", user.id);
    }
  };

  const renderHeader = () => (
    <>
      {/* Gradient Header */}
      <LinearGradient
        colors={["#E8344E", "#FF6B35"]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.feedHeader}
      >
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.push(`/profile/${user?.id}` as any)}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }]}>
                <IconSymbol name="person.fill" size={22} color="#FFF" />
              </View>
            )}
          </Pressable>
          <View>
            <Text style={styles.headerGreeting}>Hello, {profile?.username ?? "there"}</Text>
            <Text style={styles.headerSub}>What's on your mind?</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerIconBtn} onPress={() => router.push("/explore" as any)}>
            <IconSymbol name="magnifyingglass" size={22} color="#FFF" />
          </Pressable>
          <Pressable style={styles.headerIconBtn} onPress={() => router.push("/(tabs)/menu" as any)}>
            <IconSymbol name="bubble.left" size={22} color="#FFF" />
          </Pressable>
        </View>
      </LinearGradient>

      {/* Stories */}
      <View style={[styles.storiesContainer, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
        {loading ? (
          <View style={styles.storiesRow}>
            {[...Array(5)].map((_, i) => <StorySkeleton key={i} />)}
          </View>
        ) : (
          <FlatList
            data={stories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(s) => s.id}
            contentContainerStyle={styles.storiesRow}
            renderItem={({ item }) => (
              <StoryItem story={item} onPress={() => {}} />
            )}
          />
        )}
      </View>

      {/* Post Composer */}
      <PostComposer profile={profile} onPress={() => router.push("/create-post" as any)} />
    </>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onSave={handleSave}
      onComment={(id) => router.push(`/post/${id}` as any)}
      onShare={() => {}}
      onMenu={() => {}}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadMoreIndicator}>
        <ActivityIndicator color="#E8344E" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return (
      <View>
        {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
      </View>
    );
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="photo" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No posts yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.muted }]}>Follow people to see their posts here</Text>
        <Pressable style={styles.exploreBtn} onPress={() => router.push("/(tabs)/explore" as any)}>
          <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.exploreBtnGradient}>
            <Text style={styles.exploreBtnText}>Explore People</Text>
          </LinearGradient>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E8344E"
            colors={["#E8344E"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  feedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" },
  headerGreeting: { fontSize: 17, fontWeight: "700", color: "#FFF" },
  headerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  storiesContainer: {
    marginHorizontal: 12, marginTop: 12, borderRadius: 16,
    borderWidth: 1, paddingVertical: 12,
  },
  storiesRow: { paddingHorizontal: 8, gap: 4 },
  storyItem: { alignItems: "center", width: 76, position: "relative" },
  storyRing: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  storyAvatarBorder: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center" },
  storyAvatar: { width: 56, height: 56, borderRadius: 28 },
  addStoryBtn: { position: "absolute", bottom: 20, right: 4 },
  addStoryGradient: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  storyName: { fontSize: 11, marginTop: 4, textAlign: "center", width: 72 },
  composerCard: {
    marginHorizontal: 12, marginTop: 12, borderRadius: 16,
    borderWidth: 1, padding: 12,
  },
  composerTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  composerAvatar: { width: 40, height: 40, borderRadius: 20 },
  composerInput: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 16, justifyContent: "center" },
  composerPlaceholder: { fontSize: 14 },
  composerDivider: { height: 1, marginVertical: 10 },
  composerActions: { flexDirection: "row", justifyContent: "space-around" },
  composerAction: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  composerActionText: { fontSize: 13, fontWeight: "500" },
  postCard: {
    marginHorizontal: 12, marginTop: 12, borderRadius: 16,
    borderWidth: 1, overflow: "hidden",
  },
  postHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 12 },
  postHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  onlineDot: {
    position: "absolute", left: 32, top: 32,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: "#22C55E", borderWidth: 2, borderColor: "#FFF",
  },
  postHeaderInfo: { flex: 1 },
  postUsername: { fontSize: 15, fontWeight: "700" },
  postMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  postTime: { fontSize: 12 },
  postLocation: { fontSize: 12, fontWeight: "500" },
  menuBtn: { padding: 4 },
  musicTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  musicText: { fontSize: 12, fontStyle: "italic" },
  postContent: { fontSize: 14, lineHeight: 22, paddingHorizontal: 12, paddingBottom: 8 },
  hashtagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, paddingHorizontal: 12, paddingBottom: 8 },
  hashtag: { fontSize: 13, color: "#E8344E", fontWeight: "500" },
  postImage: { width: "100%", height: 260 },
  moreImages: {
    position: "absolute", bottom: 8, right: 8,
    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  moreImagesText: { color: "#FFF", fontSize: 12, fontWeight: "600" },
  viewCount: {
    position: "absolute", bottom: 48, right: 8,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  viewCountText: { color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "500" },
  postActions: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 4,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 4, paddingHorizontal: 8 },
  actionCount: { fontSize: 13, fontWeight: "500" },
  saveBtn: { marginLeft: "auto" },
  loadMoreIndicator: { paddingVertical: 20, alignItems: "center" },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  exploreBtn: { borderRadius: 30, overflow: "hidden", marginTop: 8 },
  exploreBtnGradient: { paddingVertical: 12, paddingHorizontal: 28, alignItems: "center" },
  exploreBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
