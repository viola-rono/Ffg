import React, { useState } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView,
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type PostType = "text" | "photo" | "video";
type PostVisibility = "public" | "followers" | "only_me";
type CommentPrivacy = "everyone" | "followers" | "only_me";

const VISIBILITY_OPTIONS = [
  { value: "public" as PostVisibility, label: "Public", icon: "globe" },
  { value: "followers" as PostVisibility, label: "Followers", icon: "person.2" },
  { value: "only_me" as PostVisibility, label: "Only Me", icon: "lock" },
];

const COMMENT_PRIVACY_OPTIONS = [
  { value: "everyone" as CommentPrivacy, label: "Everyone" },
  { value: "followers" as CommentPrivacy, label: "Followers" },
  { value: "only_me" as CommentPrivacy, label: "Only Me" },
];

const FEELINGS = [
  { label: "Happy", icon: "face.smiling" },
  { label: "Sad", icon: "face.smiling" },
  { label: "Excited", icon: "bolt.fill" },
  { label: "Traveling", icon: "map.pin" },
  { label: "Working", icon: "doc.text" },
  { label: "Eating", icon: "star.fill" },
  { label: "Watching", icon: "video" },
  { label: "Listening", icon: "music.note" },
  { label: "Reading", icon: "doc.text.fill" },
];

const TEXT_BACKGROUNDS = [
  { id: "white", bg: "#FFFFFF", text: "#111111" },
  { id: "gradient1", bg: "#E8344E", text: "#FFFFFF" },
  { id: "gradient2", bg: "#FF6B35", text: "#FFFFFF" },
  { id: "dark", bg: "#1A1A1A", text: "#FFFFFF" },
  { id: "blue", bg: "#3B82F6", text: "#FFFFFF" },
  { id: "green", bg: "#22C55E", text: "#FFFFFF" },
  { id: "purple", bg: "#8B5CF6", text: "#FFFFFF" },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, profile } = useSupabaseAuth();
  const [postType, setPostType] = useState<PostType>("text");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [feeling, setFeeling] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [commentPrivacy, setCommentPrivacy] = useState<CommentPrivacy>("everyone");
  const [textBg, setTextBg] = useState(TEXT_BACKGROUNDS[0]);
  const [loading, setLoading] = useState(false);
  const [showFeelings, setShowFeelings] = useState(false);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 10,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)].slice(0, 10));
      setPostType("photo");
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop() ?? "jpg";
      const path = `posts/${user?.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, blob, { contentType: `image/${ext}` });
      if (error) return null;
      const { data } = supabase.storage.from("media").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      return null;
    }
  };

  const handlePost = async () => {
    if (!user) return;
    if (!content.trim() && images.length === 0) {
      Alert.alert("Empty Post", "Please add some content before posting.");
      return;
    }
    setLoading(true);
    try {
      let uploadedUrls: string[] = [];
      for (const uri of images) {
        const url = await uploadImage(uri);
        if (url) uploadedUrls.push(url);
      }

      const tags = hashtags
        .split(/[\s,#]+/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean);

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim() || null,
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        location: location.trim() || null,
        feeling: feeling,
        hashtags: tags.length > 0 ? tags : null,
        visibility,
        comment_privacy: commentPrivacy,
        post_type: postType,
        text_bg_color: postType === "text" ? textBg.bg : null,
        text_color: postType === "text" ? textBg.text : null,
      });
      if (error) throw error;
      Alert.alert("Success", "Post created successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Post Failed", err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />

        {/* Header */}
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Pressable
            style={[styles.postBtn, loading && { opacity: 0.6 }]}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#E8344E" size="small" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </Pressable>
        </LinearGradient>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* User info */}
          <View style={styles.userRow}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
                <IconSymbol name="person.fill" size={20} color={colors.muted} />
              </View>
            )}
            <View>
              <Text style={[styles.username, { color: colors.foreground }]}>{profile?.username ?? "You"}</Text>
              {feeling ? (
                <Text style={[styles.feelingTag, { color: "#E8344E" }]}>is feeling {feeling}</Text>
              ) : null}
              {location ? (
                <View style={styles.locationTag}>
                  <IconSymbol name="location.fill" size={12} color="#E8344E" />
                  <Text style={[styles.locationText, { color: "#E8344E" }]}>{location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Post type tabs */}
          <View style={[styles.typeTabs, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {(["text", "photo", "video"] as PostType[]).map((t) => (
              <Pressable
                key={t}
                style={[styles.typeTab, postType === t && styles.typeTabActive]}
                onPress={() => setPostType(t)}
              >
                {postType === t ? (
                  <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.typeTabGradient}>
                    <Text style={styles.typeTabTextActive}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={[styles.typeTabText, { color: colors.muted }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Text input */}
          {postType === "text" ? (
            <View style={[styles.textPostContainer, { backgroundColor: textBg.bg }]}>
              <TextInput
                style={[styles.textPostInput, { color: textBg.text }]}
                placeholder="What's on your mind?"
                placeholderTextColor={textBg.text + "80"}
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={2000}
                textAlignVertical="center"
              />
            </View>
          ) : (
            <TextInput
              style={[styles.contentInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
              placeholder="Write a caption..."
              placeholderTextColor={colors.muted}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={2000}
            />
          )}

          {/* Text background picker */}
          {postType === "text" ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bgPicker}>
              {TEXT_BACKGROUNDS.map((bg) => (
                <Pressable
                  key={bg.id}
                  style={[styles.bgOption, { backgroundColor: bg.bg, borderColor: textBg.id === bg.id ? "#E8344E" : "transparent" }]}
                  onPress={() => setTextBg(bg)}
                />
              ))}
            </ScrollView>
          ) : null}

          {/* Images */}
          {images.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imagePreview}>
                  <Image source={{ uri }} style={styles.previewImg} />
                  <Pressable style={styles.removeImageBtn} onPress={() => removeImage(idx)}>
                    <IconSymbol name="xmark.circle.fill" size={22} color="#E8344E" />
                  </Pressable>
                </View>
              ))}
              {images.length < 10 ? (
                <Pressable style={[styles.addMoreImages, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImages}>
                  <IconSymbol name="plus" size={28} color={colors.muted} />
                </Pressable>
              ) : null}
            </ScrollView>
          ) : null}

          {/* Hashtags */}
          <View style={[styles.fieldRow, { borderColor: colors.border }]}>
            <IconSymbol name="number" size={18} color="#E8344E" />
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              placeholder="Add hashtags (e.g. GoodVibes HappyDay)"
              placeholderTextColor={colors.muted}
              value={hashtags}
              onChangeText={setHashtags}
              autoCapitalize="none"
            />
          </View>
          {/* Visibility */}
          <View style={[styles.fieldRow, { borderColor: colors.border }]}> 
            <IconSymbol name="globe" size={18} color="#E8344E" />
            <Text style={[styles.fieldInput, { color: colors.foreground, fontWeight: "700" }]}>Who can see this post?</Text>
          </View>
          <View style={styles.privacyChipsRow}>
            {VISIBILITY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.privacyOption,
                  { backgroundColor: visibility === option.value ? "#E8344E" : colors.surface, borderColor: visibility === option.value ? "#E8344E" : colors.border },
                ]}
                onPress={() => setVisibility(option.value)}
              >
                <IconSymbol name={option.icon} size={16} color={visibility === option.value ? "#FFF" : "#E8344E"} />
                <Text style={[styles.privacyOptionText, { color: visibility === option.value ? "#FFF" : colors.foreground }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Comment privacy */}
          <View style={[styles.fieldRow, { borderColor: colors.border }]}> 
            <IconSymbol name="bubble.left" size={18} color="#E8344E" />
            <Text style={[styles.fieldInput, { color: colors.foreground, fontWeight: "700" }]}>Who can comment?</Text>
          </View>
          <View style={styles.privacyChipsRow}>
            {COMMENT_PRIVACY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.privacyOption,
                  { backgroundColor: commentPrivacy === option.value ? "#E8344E" : colors.surface, borderColor: commentPrivacy === option.value ? "#E8344E" : colors.border },
                ]}
                onPress={() => setCommentPrivacy(option.value)}
              >
                <Text style={[styles.privacyOptionText, { color: commentPrivacy === option.value ? "#FFF" : colors.foreground }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          {/* Location */}
          <View style={[styles.fieldRow, { borderColor: colors.border }]}>
            <IconSymbol name="location" size={18} color="#E8344E" />
            <TextInput
              style={[styles.fieldInput, { color: colors.foreground }]}
              placeholder="Add location"
              placeholderTextColor={colors.muted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Feeling */}
          <Pressable style={[styles.fieldRow, { borderColor: colors.border }]} onPress={() => setShowFeelings(!showFeelings)}>
            <IconSymbol name="face.smiling" size={18} color="#E8344E" />
            <Text style={[styles.fieldInput, { color: feeling ? colors.foreground : colors.muted }]}>
              {feeling ? `Feeling ${feeling}` : "How are you feeling?"}
            </Text>
            <IconSymbol name={showFeelings ? "chevron.up" : "chevron.down"} size={16} color={colors.muted} />
          </Pressable>

          {showFeelings ? (
            <View style={styles.feelingsGrid}>
              {FEELINGS.map((f) => (
                <Pressable
                  key={f.label}
                  style={[
                    styles.feelingChip,
                    { backgroundColor: colors.surface, borderColor: feeling === f.label ? "#E8344E" : colors.border },
                  ]}
                  onPress={() => { setFeeling(feeling === f.label ? null : f.label); setShowFeelings(false); }}
                >
                  <Text style={[styles.feelingChipText, { color: feeling === f.label ? "#E8344E" : colors.foreground }]}>{f.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImages}>
              <IconSymbol name="photo" size={18} color="#E8344E" />
              <Text style={[styles.actionChipText, { color: colors.foreground }]}>Photo</Text>
            </Pressable>
            <Pressable style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={pickImages}>
              <IconSymbol name="video" size={18} color="#E8344E" />
              <Text style={[styles.actionChipText, { color: colors.foreground }]}>Video</Text>
            </Pressable>
            <Pressable style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="music.note" size={18} color="#E8344E" />
              <Text style={[styles.actionChipText, { color: colors.foreground }]}>Music</Text>
            </Pressable>
            <Pressable style={[styles.actionChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name="tag" size={18} color="#E8344E" />
              <Text style={[styles.actionChipText, { color: colors.foreground }]}>Tag</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  postBtn: { backgroundColor: "#FFF", paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20 },
  postBtnText: { color: "#E8344E", fontWeight: "700", fontSize: 15 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  username: { fontSize: 15, fontWeight: "700" },
  feelingTag: { fontSize: 12, marginTop: 2 },
  locationTag: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  locationText: { fontSize: 12 },
  typeTabs: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  typeTab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  typeTabActive: {},
  typeTabGradient: { width: "100%", alignItems: "center", paddingVertical: 10 },
  typeTabText: { fontSize: 14, fontWeight: "500" },
  typeTabTextActive: { fontSize: 14, fontWeight: "700", color: "#FFF" },
  textPostContainer: { borderRadius: 16, minHeight: 160, alignItems: "center", justifyContent: "center", padding: 20 },
  textPostInput: { fontSize: 20, fontWeight: "600", textAlign: "center", width: "100%", minHeight: 120 },
  contentInput: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    fontSize: 15, minHeight: 100, textAlignVertical: "top",
  },
  bgPicker: { marginTop: -4 },
  bgOption: { width: 36, height: 36, borderRadius: 18, marginRight: 8, borderWidth: 3 },
  imagesRow: { marginTop: 4 },
  imagePreview: { position: "relative", marginRight: 8 },
  previewImg: { width: 100, height: 100, borderRadius: 12 },
  removeImageBtn: { position: "absolute", top: -6, right: -6 },
  addMoreImages: {
    width: 100, height: 100, borderRadius: 12, borderWidth: 2,
    borderStyle: "dashed", alignItems: "center", justifyContent: "center",
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  fieldInput: { flex: 1, fontSize: 14 },
  feelingsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  feelingChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  feelingChipText: { fontSize: 13, fontWeight: "500" },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  actionChipText: { fontSize: 13, fontWeight: "500" },
  privacyChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 8 },
  privacyOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  privacyOptionText: { fontSize: 13, fontWeight: "600" },
});
