import React, { useState } from "react";
import {
  View, Text, Pressable, StyleSheet, Animated, Modal, useWindowDimensions,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface Reaction {
  type: ReactionType;
  emoji: string;
  label: string;
}

export const REACTIONS: Reaction[] = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😠", label: "Angry" },
];

interface ReactionPickerProps {
  visible: boolean;
  onSelect: (reaction: ReactionType) => void;
  onDismiss: () => void;
  position?: { x: number; y: number };
}

export function ReactionPicker({
  visible, onSelect, onDismiss, position = { x: 0, y: 0 },
}: ReactionPickerProps) {
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const handleSelect = (reaction: ReactionType) => {
    onSelect(reaction);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            {
              left: Math.min(position.x - 90, width - 180),
              top: Math.max(position.y - 80, 60),
            },
          ]}
        >
          <View style={styles.reactionGrid}>
            {REACTIONS.map((reaction) => (
              <Pressable
                key={reaction.type}
                style={({ pressed }) => [
                  styles.reactionBtn,
                  pressed && { transform: [{ scale: 0.85 }] },
                ]}
                onPress={() => handleSelect(reaction.type)}
              >
                <Text style={styles.emoji}>{reaction.emoji}</Text>
                <Text style={[styles.label, { color: colors.foreground }]}>
                  {reaction.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  container: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionGrid: {
    flexDirection: "row",
    gap: 4,
  },
  reactionBtn: {
    alignItems: "center",
    justifyContent: "center",
    width: 50,
    paddingVertical: 8,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
  },
});
