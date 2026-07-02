import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Image, RefreshControl, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useSupabaseAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "reply" | "share" | "tag" | "system";
  actor_id: string | null;
  actor_username: string | null;
  actor_avatar: string | null;
  message: string;
  post_id: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIF_ICONS: Record<string, { icon: string; color: string }> = {
  like: { icon: "heart.fill", color: "#E8344E" },
  comment: { icon: "bubble.left.fill", color: "#3B82F6" },
  follow: { icon: "person.badge.plus", color: "#22C55E" },
  mention: { icon: "at", color: "#8B5CF6" },
  reply: { icon: "arrow.turn.up.left", color: "#F59E0B" },
  share: { icon: "repeat", color: "#06B6D4" },
  tag: { icon: "tag.fill", color: "#EC4899" },
  system: { icon: "bell.fill", color: "#E8344E" },
};

function NotifItem({ notif, onPress, onDelete }: {
  notif: Notification;
  onPress: () => void;
  onDelete: (id: string) => void;
}) {
  const colors = useColors();
  const iconInfo = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.system;
  const timeAgo = (() => {
    try { return formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }); }
    catch { return ""; }
  })();

  return (
    <Pressable
      style={[
        styles.notifItem,
        { backgroundColor: notif.is_read ? (colors.surfaceElevated ?? colors.surface) : "#FFF5F7", borderColor: colors.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.notifLeft}>
        <View style={styles.avatarContainer}>
          {notif.actor_avatar ? (
            <Image source={{ uri: notif.actor_avatar }} style={styles.notifAvatar} />
          ) : (
            <View style={[styles.notifAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
              <IconSymbol name="person.fill" size={18} color={colors.muted} />
            </View>
          )}
          <View style={[styles.notifTypeIcon, { backgroundColor: iconInfo.color }]}>
            <IconSymbol name={iconInfo.icon} size={10} color="#FFF" />
          </View>
        </View>
        <View style={styles.notifContent}>
          <Text style={[styles.notifMessage, { color: colors.foreground }]} numberOfLines={2}>
            {notif.message}
          </Text>
          <Text style={[styles.notifTime, { color: colors.muted }]}>{timeAgo}</Text>
        </View>
      </View>
      {!notif.is_read && <View style={styles.unreadDot} />}
      <Pressable style={styles.deleteBtn} onPress={() => onDelete(notif.id)}>
        <IconSymbol name="xmark" size={14} color={colors.muted} />
      </Pressable>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*, profiles:actor_id(username, avatar_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const mapped: Notification[] = (data ?? []).map((n: any) => ({
      id: n.id,
      type: n.type,
      actor_id: n.actor_id,
      actor_username: n.profiles?.username ?? null,
      actor_avatar: n.profiles?.avatar_url ?? null,
      message: n.message ?? buildMessage(n),
      post_id: n.post_id,
      is_read: n.is_read,
      created_at: n.created_at,
    }));
    setNotifications(mapped);
  };

  const buildMessage = (n: any) => {
    const actor = n.profiles?.username ?? "Someone";
    const messages: Record<string, string> = {
      like: `${actor} liked your post`,
      comment: `${actor} commented on your post`,
      follow: `${actor} started following you`,
      mention: `${actor} mentioned you in a post`,
      reply: `${actor} replied to your comment`,
      share: `${actor} shared your post`,
      tag: `${actor} tagged you in a post`,
      system: "System notification",
    };
    return messages[n.type] ?? "New notification";
  };

  useEffect(() => {
    fetchNotifications().then(() => setLoading(false));

    // Real-time subscription
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user?.id}`,
      }, () => fetchNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotif = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <Pressable style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <Text style={styles.unreadBadge}>{unreadCount} unread</Text>
        ) : null}
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NotifItem
            notif={item}
            onPress={() => {
              markRead(item.id);
              if (item.post_id) router.push(`/post/${item.post_id}` as any);
              else if (item.actor_id) router.push(`/profile/${item.actor_id}` as any);
            }}
            onDelete={deleteNotif}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8344E" />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          loading ? (
            <View style={styles.skeletonList}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={[styles.skeletonItem, { backgroundColor: colors.surface }]}>
                  <Skeleton width={48} height={48} borderRadius={24} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Skeleton width="80%" height={14} />
                    <Skeleton width={80} height={11} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="bell" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notifications yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>When someone interacts with your posts, you'll see it here</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  markAllBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  markAllText: { color: "#FFF", fontSize: 13, fontWeight: "500" },
  unreadBadge: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 },
  listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 80 },
  notifItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8,
  },
  notifLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarContainer: { position: "relative" },
  notifAvatar: { width: 48, height: 48, borderRadius: 24 },
  notifTypeIcon: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF",
  },
  notifContent: { flex: 1 },
  notifMessage: { fontSize: 14, lineHeight: 20 },
  notifTime: { fontSize: 12, marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#E8344E", marginRight: 8 },
  deleteBtn: { padding: 6 },
  skeletonList: { gap: 8 },
  skeletonItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14 },
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20, color: "#888" },
});
