import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  content: string;
  created_at: string;
  likes_count: number;
}

export default function PostDetailScreen() {
  const { id: postId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const fetchPost = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*, profiles(username, full_name, avatar_url)")
      .eq("id", postId)
      .single();
    setPost(data);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(100);
    const mapped: Comment[] = (data ?? []).map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      username: c.profiles?.username ?? "user",
      avatar_url: c.profiles?.avatar_url ?? null,
      content: c.content,
      created_at: c.created_at,
      likes_count: c.likes_count ?? 0,
    }));
    setComments(mapped);
  };

  useEffect(() => {
    Promise.all([fetchPost(), fetchComments()]).then(() => setLoading(false));
  }, [postId]);

  const handleComment = async () => {
    if (!commentText.trim() || !user) return;
    const text = commentText.trim();
    setCommentText("");
    setPosting(true);
    const { data } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: text,
    }).select("*, profiles(username, avatar_url)").single();
    if (data) {
      setComments((prev) => [...prev, {
        id: data.id,
        user_id: data.user_id,
        username: data.profiles?.username ?? "user",
        avatar_url: data.profiles?.avatar_url ?? null,
        content: data.content,
        created_at: data.created_at,
        likes_count: 0,
      }]);
    }
    setPosting(false);
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const timeAgo = (() => {
      try { return formatDistanceToNow(new Date(item.created_at), { addSuffix: true }); }
      catch { return ""; }
    })();
    return (
      <View style={styles.commentRow}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
            <IconSymbol name="person.fill" size={14} color={colors.muted} />
          </View>
        )}
        <View style={[styles.commentBubble, { backgroundColor: colors.surface }]}>
          <Text style={[styles.commentUsername, { color: colors.foreground }]}>{item.username}</Text>
          <Text style={[styles.commentContent, { color: colors.foreground }]}>{item.content}</Text>
          <Text style={[styles.commentTime, { color: colors.muted }]}>{timeAgo}</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (!post) return null;
    const timeAgo = (() => {
      try { return formatDistanceToNow(new Date(post.created_at), { addSuffix: true }); }
      catch { return ""; }
    })();
    return (
      <View style={[styles.postContainer, { backgroundColor: colors.surfaceElevated ?? colors.surface, borderColor: colors.border }]}>
        <View style={styles.postHeader}>
          <Pressable style={styles.postHeaderLeft} onPress={() => router.push(`/profile/${post.user_id}` as any)}>
            {post.profiles?.avatar_url ? (
              <Image source={{ uri: post.profiles.avatar_url }} style={styles.postAvatar} />
            ) : (
              <View style={[styles.postAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
              </View>
            )}
            <View>
              <Text style={[styles.postUsername, { color: colors.foreground }]}>{post.profiles?.username}</Text>
              <Text style={[styles.postTime, { color: colors.muted }]}>{timeAgo}</Text>
            </View>
          </Pressable>
        </View>
        {post.content ? <Text style={[styles.postContent, { color: colors.foreground }]}>{post.content}</Text> : null}
        {post.image_urls?.[0] ? (
          <Image source={{ uri: post.image_urls[0] }} style={styles.postImage} resizeMode="cover" />
        ) : null}
        <View style={[styles.commentsDivider, { borderTopColor: colors.border }]}>
          <Text style={[styles.commentsTitle, { color: colors.foreground }]}>Comments ({comments.length})</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 30 }} />
        </LinearGradient>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#E8344E" />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            renderItem={renderComment}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            ref={inputRef}
            style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Write a comment..."
            placeholderTextColor={colors.muted}
            value={commentText}
            onChangeText={setCommentText}
            returnKeyType="done"
            onSubmitEditing={handleComment}
          />
          <Pressable
            style={[styles.sendBtn, { opacity: commentText.trim() ? 1 : 0.5 }]}
            onPress={handleComment}
            disabled={!commentText.trim() || posting}
          >
            <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.sendGradient}>
              {posting ? <ActivityIndicator color="#FFF" size="small" /> : <IconSymbol name="paperplane.fill" size={16} color="#FFF" />}
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  listContent: { paddingBottom: 80 },
  postContainer: { borderBottomWidth: 1, marginBottom: 8 },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  postHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  postAvatar: { width: 44, height: 44, borderRadius: 22 },
  postUsername: { fontSize: 15, fontWeight: "700" },
  postTime: { fontSize: 12, marginTop: 2 },
  postContent: { fontSize: 15, lineHeight: 22, paddingHorizontal: 12, paddingBottom: 12 },
  postImage: { width: "100%", height: 260 },
  commentsDivider: { borderTopWidth: 1, paddingHorizontal: 12, paddingVertical: 12 },
  commentsTitle: { fontSize: 15, fontWeight: "700" },
  commentRow: { flexDirection: "row", gap: 8, paddingHorizontal: 12, paddingVertical: 6 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16 },
  commentBubble: { flex: 1, borderRadius: 14, padding: 10 },
  commentUsername: { fontSize: 13, fontWeight: "700" },
  commentContent: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  commentTime: { fontSize: 11, marginTop: 4 },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1,
  },
  commentInput: {
    flex: 1, height: 42, borderRadius: 21, borderWidth: 1,
    paddingHorizontal: 14, fontSize: 14,
  },
  sendBtn: {},
  sendGradient: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
