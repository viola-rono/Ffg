import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const SUPABASE_URL = "https://fghtysiocvvofupogugh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaHR5c2lvY3Z2b2Z1cG9ndWdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MjU0MzUsImV4cCI6MjA5ODMwMTQzNX0.u8tBBqh_L1atPfHVlnxUbB33yBL-px5vcZGGREE-FXE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: Platform.OS !== "web" ? AsyncStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});

export type { User, Session } from "@supabase/supabase-js";
