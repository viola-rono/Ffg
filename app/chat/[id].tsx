import React, { useState, useEffect, useRef, useCallback } from "react";
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

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  is_own: boolean;
}

interface OtherUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
}

export default function ChatScreen() {
  const { id: otherUserId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { user } = useSupabaseAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOtherUser = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", otherUserId)
      .single();
    if (data) setOtherUser({ ...data, is_online: false });
  };

  const getOrCreateConversation = async (): Promise<string | null> => {
    if (!user || !otherUserId) return null;
    // Check existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
      .single();
    if (existing) return existing.id;
    // Create new
    const { data: created } = await supabase
      .from("conversations")
      .insert({ user1_id: user.id, user2_id: otherUserId })
      .select("id")
      .single();
    return created?.id ?? null;
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true })
      .limit(100);
    const mapped: Message[] = (data ?? []).map((m: any) => ({
      id: m.id,
      sender_id: m.sender_id,
      content: m.content,
      image_url: m.image_url,
      is_read: m.is_read,
      created_at: m.created_at,
      is_own: m.sender_id === user?.id,
    }));
    setMessages(mapped);
    // Mark as read
    await supabase.from("messages").update({ is_read: true })
      .eq("conversation_id", convId)
      .eq("sender_id", otherUserId ?? "")
      .eq("is_read", false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchOtherUser();
      const convId = await getOrCreateConversation();
      if (convId) {
        setConversationId(convId);
        await fetchMessages(convId);
      }
      setLoading(false);
    };
    init();
  }, [otherUserId]);

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        const m = payload.new as any;
        setMessages((prev) => [
          ...prev,
          {
            id: m.id,
            sender_id: m.sender_id,
            content: m.content,
            image_url: m.image_url,
            is_read: m.is_read,
            created_at: m.created_at,
            is_own: m.sender_id === user?.id,
          },
        ]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const handleSend = async () => {
    if (!text.trim() || !conversationId || !user) return;
    const msgText = text.trim();
    setText("");
    setSending(true);
    // Optimistic
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: user.id,
      content: msgText,
      image_url: null,
      is_read: false,
      created_at: new Date().toISOString(),
      is_own: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    const { data, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: msgText,
    }).select().single();

    if (!error && data) {
      setMessages((prev) => prev.map((m) => m.id === tempId ? { ...data, is_own: true } : m));
    }
    setSending(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const timeAgo = (() => {
      try { return formatDistanceToNow(new Date(item.created_at), { addSuffix: true }); }
      catch { return ""; }
    })();

    return (
      <View style={[styles.messageRow, item.is_own && styles.messageRowOwn]}>
        {!item.is_own ? (
          otherUser?.avatar_url ? (
            <Image source={{ uri: otherUser.avatar_url }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatar, { backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }]}>
              <IconSymbol name="person.fill" size={14} color={colors.muted} />
            </View>
          )
        ) : null}
        <View style={[
          styles.messageBubble,
          item.is_own ? styles.ownBubble : [styles.otherBubble, { backgroundColor: colors.surface }],
        ]}>
          {item.is_own ? (
            <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ownBubbleGradient}>
              <Text style={styles.ownMessageText}>{item.content}</Text>
            </LinearGradient>
          ) : (
            <Text style={[styles.otherMessageText, { color: colors.foreground }]}>{item.content}</Text>
          )}
          <Text style={[styles.msgTime, { color: item.is_own ? "rgba(255,255,255,0.7)" : colors.muted }]}>{timeAgo}</Text>
          {item.is_own ? (
            <View style={styles.readReceipt}>
              <IconSymbol name={item.is_read ? "checkmark.circle.fill" : "checkmark"} size={12} color="rgba(255,255,255,0.8)" />
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />

        {/* Header */}
        <LinearGradient colors={["#E8344E", "#FF6B35"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={22} color="#FFF" />
          </Pressable>
          <Pressable style={styles.headerUser} onPress={() => router.push(`/profile/${otherUserId}` as any)}>
            {otherUser?.avatar_url ? (
              <Image source={{ uri: otherUser.avatar_url }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, { backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" }]}>
                <IconSymbol name="person.fill" size={18} color="#FFF" />
              </View>
            )}
            <View>
              <Text style={styles.headerName}>{otherUser?.username ?? "..."}</Text>
              <Text style={styles.headerStatus}>{otherUser?.is_online ? "Online" : "Offline"}</Text>
            </View>
          </Pressable>
          <Pressable style={styles.headerAction}>
            <IconSymbol name="video" size={22} color="#FFF" />
          </Pressable>
        </LinearGradient>

        {/* Messages */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#E8344E" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <IconSymbol name="bubble.left" size={48} color={colors.muted} />
                <Text style={[styles.emptyChatText, { color: colors.muted }]}>Start a conversation</Text>
              </View>
            }
          />
        )}

        {/* Typing indicator */}
        {isTyping ? (
          <View style={styles.typingIndicator}>
            <Text style={[styles.typingText, { color: colors.muted }]}>{otherUser?.username} is typing...</Text>
          </View>
        ) : null}

        {/* Input */}
        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable style={styles.attachBtn}>
            <IconSymbol name="photo" size={22} color="#E8344E" />
          </Pressable>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <Pressable
            style={[styles.sendBtn, { opacity: text.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <LinearGradient colors={["#E8344E", "#FF6B35"]} style={styles.sendBtnGradient}>
              <IconSymbol name="paperplane.fill" size={18} color="#FFF" />
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
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerUser: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  headerName: { fontSize: 16, fontWeight: "700", color: "#FFF" },
  headerStatus: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  headerAction: { padding: 4 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messagesList: { padding: 12, gap: 8, paddingBottom: 20 },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  messageRowOwn: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14 },
  messageBubble: { maxWidth: "75%", borderRadius: 18, overflow: "hidden" },
  ownBubble: {},
  otherBubble: { paddingHorizontal: 14, paddingVertical: 10 },
  ownBubbleGradient: { paddingHorizontal: 14, paddingVertical: 10 },
  ownMessageText: { color: "#FFF", fontSize: 15, lineHeight: 20 },
  otherMessageText: { fontSize: 15, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: "right" },
  readReceipt: { alignItems: "flex-end", marginTop: 2 },
  typingIndicator: { paddingHorizontal: 16, paddingVertical: 6 },
  typingText: { fontSize: 12, fontStyle: "italic" },
  inputBar: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1,
  },
  attachBtn: { padding: 8 },
  textInput: {
    flex: 1, borderRadius: 22, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 100,
  },
  sendBtn: { marginBottom: 2 },
  sendBtnGradient: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyChatText: { fontSize: 15 },
});
