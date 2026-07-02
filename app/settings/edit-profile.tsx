import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput, ScrollView, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import * as ImagePicker from "expo-image-picker";

export default function EditProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user, profile, refreshProfile } = useSupabaseAuth();

  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [coverUrl, setCoverUrl] = useState((profile as any)?.cover_photo_url || "");
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async (type: "avatar" | "cover") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === "avatar" ? [1, 1] : [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        if (type === "avatar") {
          setAvatarFile(uri);
          setAvatarUrl(uri);
        } else {
          setCoverFile(uri);
          setCoverUrl(uri);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", "Failed to pick image: " + err.message);
    }
  };

  const uploadImage = async (uri: string, bucket: string, folder: string) => {
    try {
      setUploading(true);
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split(".").pop() || "jpg";
      const path = `${folder}/${user?.id}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        contentType: `image/${ext}`,
        upsert: true,
      });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (err: any) {
      throw new Error("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    setLoading(true);
    try {
      let newAvatarUrl = profile?.avatar_url;
      let newCoverUrl = (profile as any)?.cover_photo_url;

      // Upload avatar if changed
      if (avatarFile && avatarFile !== profile?.avatar_url) {
        newAvatarUrl = await uploadImage(avatarFile, "media", "avatars");
      }

      // Upload cover if changed
      if (coverFile && coverFile !== (profile as any)?.cover_photo_url) {
        newCoverUrl = await uploadImage(coverFile, "media", "covers");
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: newAvatarUrl,
          cover_photo_url: newCoverUrl as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 30 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cover Photo */}
          <View style={styles.coverSection}>
            <Pressable
              style={[styles.coverPhoto, { backgroundColor: colors.surface }]}
              onPress={() => pickImage("cover")}
              disabled={uploading}
            >
              {coverUrl ? (
                <Image source={{ uri: coverUrl }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <IconSymbol name="photo" size={40} color={colors.muted} />
                  <Text style={[styles.coverPlaceholderText, { color: colors.muted }]}>Add Cover Photo</Text>
                </View>
              )}
              <View style={styles.coverOverlay}>
                <IconSymbol name="camera.fill" size={24} color="#FFF" />
              </View>
            </Pressable>

            {/* Avatar */}
            <View style={styles.avatarSection}>
              <Pressable
                style={[styles.avatarContainer, { borderColor: colors.background }]}
                onPress={() => pickImage("avatar")}
                disabled={uploading}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
                    <IconSymbol name="person.fill" size={40} color={colors.muted} />
                  </View>
                )}
                <View style={styles.avatarOverlay}>
                  <IconSymbol name="camera.fill" size={16} color="#FFF" />
                </View>
              </Pressable>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* Username */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Username *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter username"
                placeholderTextColor={colors.muted}
                value={username}
                onChangeText={setUsername}
                editable={!uploading}
              />
            </View>

            {/* Full Name */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter full name"
                placeholderTextColor={colors.muted}
                value={fullName}
                onChangeText={setFullName}
                editable={!uploading}
              />
            </View>

            {/* Bio */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.foreground,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Tell us about yourself"
                placeholderTextColor={colors.muted}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={150}
                textAlignVertical="top"
                editable={!uploading}
              />
              <Text style={[styles.charCount, { color: colors.muted }]}>{bio.length}/150</Text>
            </View>

            {/* Save Button */}
            <Pressable style={styles.saveBtn} onPress={handleSave} disabled={loading || uploading}>
              {loading || uploading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.saveBtnGradient}>
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </LinearGradient>
              )}
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
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFF" },
  content: { paddingBottom: 32 },
  coverSection: { position: "relative", marginBottom: 60 },
  coverPhoto: {
    height: 160, overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%" },
  coverPlaceholder: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 8,
  },
  coverPlaceholderText: { fontSize: 14, fontWeight: "600" },
  coverOverlay: {
    position: "absolute", bottom: 12, right: 12,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
  },
  avatarSection: { alignItems: "center", marginTop: -50 },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, overflow: "hidden", position: "relative",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  avatarOverlay: {
    position: "absolute", bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#E8344E", alignItems: "center", justifyContent: "center",
  },
  formSection: { paddingHorizontal: 16, paddingTop: 20 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  input: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  bioInput: {
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  charCount: { fontSize: 12, marginTop: 4, textAlign: "right" },
  saveBtn: { height: 52, borderRadius: 24, overflow: "hidden", marginTop: 8 },
  saveBtnGradient: { flex: 1, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "#FFF" },
});
