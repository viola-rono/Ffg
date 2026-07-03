import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ReactionType } from "@/components/ui/reaction-picker";

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

export interface ReactionCount {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
}

export function usePostReactions(postId: string, userId: string | undefined) {
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [counts, setCounts] = useState<ReactionCount>({
    like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("post_reactions")
        .select("*")
        .eq("post_id", postId);

      if (error) throw error;

      setReactions(data || []);

      // Calculate counts
      const newCounts: ReactionCount = {
        like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0,
      };
      (data || []).forEach((r) => {
        newCounts[r.reaction_type as ReactionType]++;
      });
      setCounts(newCounts);
    } catch (err) {
      console.error("Failed to fetch reactions:", err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addReaction = useCallback(
    async (reactionType: ReactionType) => {
      if (!userId) return;

      try {
        // Check if user already reacted
        const { data: existing } = await supabase
          .from("post_reactions")
          .select("*")
          .eq("post_id", postId)
          .eq("user_id", userId)
          .single();

        if (existing) {
          // Update existing reaction
          if (existing.reaction_type === reactionType) {
            // Same reaction - remove it
            await supabase
              .from("post_reactions")
              .delete()
              .eq("id", existing.id);
          } else {
            // Different reaction - update it
            await supabase
              .from("post_reactions")
              .update({ reaction_type: reactionType })
              .eq("id", existing.id);
          }
        } else {
          // Add new reaction
          await supabase.from("post_reactions").insert({
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType,
          });
        }

        // Refresh reactions
        await fetchReactions();
      } catch (err) {
        console.error("Failed to add reaction:", err);
      }
    },
    [postId, userId, fetchReactions]
  );

  const getUserReaction = useCallback((): ReactionType | null => {
    if (!userId) return null;
    const userReaction = reactions.find((r) => r.user_id === userId);
    return userReaction?.reaction_type || null;
  }, [reactions, userId]);

  return {
    reactions,
    counts,
    loading,
    fetchReactions,
    addReaction,
    getUserReaction,
  };
}
