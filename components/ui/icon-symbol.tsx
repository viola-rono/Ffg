import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "house": "home",
  "person.2.fill": "people",
  "person.2": "people",
  "bell.fill": "notifications",
  "bell": "notifications-none",
  "line.3.horizontal": "menu",
  "plus.circle.fill": "add-circle",
  "plus": "add",
  // Auth
  "envelope": "email",
  "envelope.fill": "email",
  "lock": "lock",
  "lock.fill": "lock",
  "eye": "visibility",
  "eye.slash": "visibility-off",
  "person": "person",
  "person.fill": "person",
  "checkmark.circle.fill": "check-circle",
  "xmark.circle.fill": "cancel",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "chevron.left.forwardslash.chevron.right": "code",
  // Post actions
  "heart": "favorite-border",
  "heart.fill": "favorite",
  "bubble.left": "chat-bubble-outline",
  "bubble.left.fill": "chat-bubble",
  "paperplane": "send",
  "paperplane.fill": "send",
  "bookmark": "bookmark-border",
  "bookmark.fill": "bookmark",
  "ellipsis": "more-horiz",
  "ellipsis.vertical": "more-vert",
  "square.and.arrow.up": "share",
  "repeat": "repeat",
  // Media
  "photo": "photo",
  "photo.fill": "photo",
  "video": "videocam",
  "video.fill": "videocam",
  "music.note": "music-note",
  "mic": "mic",
  "mic.fill": "mic",
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  // Location & Activity
  "location": "location-on",
  "location.fill": "location-on",
  "tag": "local-offer",
  "tag.fill": "local-offer",
  "face.smiling": "sentiment-satisfied",
  "face.smiling.fill": "sentiment-satisfied",
  // Settings
  "gear": "settings",
  "gear.fill": "settings",
  "shield": "security",
  "shield.fill": "security",
  "bell.badge": "notifications-active",
  "paintbrush": "palette",
  "paintbrush.fill": "palette",
  "trash": "delete",
  "trash.fill": "delete",
  "info.circle": "info",
  "info.circle.fill": "info",
  "questionmark.circle": "help",
  "questionmark.circle.fill": "help",
  "person.crop.circle": "account-circle",
  "person.crop.circle.fill": "account-circle",
  "lock.open": "lock-open",
  "iphone": "phone-iphone",
  "globe": "public",
  "star": "star-border",
  "star.fill": "star",
  "magnifyingglass": "search",
  "xmark": "close",
  "checkmark": "check",
  "minus": "remove",
  "camera": "camera-alt",
  "camera.fill": "camera-alt",
  "pencil": "edit",
  "pencil.fill": "edit",
  "doc.text": "description",
  "doc.text.fill": "description",
  "link": "link",
  "at": "alternate-email",
  "number": "tag",
  "waveform": "graphic-eq",
  "arrow.clockwise": "refresh",
  "wifi.slash": "wifi-off",
  "exclamationmark.triangle": "warning",
  "exclamationmark.triangle.fill": "warning",
  "flag": "flag",
  "flag.fill": "flag",
  "nosign": "block",
  "arrow.up.right.square": "open-in-new",
  "person.badge.plus": "person-add",
  "person.badge.minus": "person-remove",
  "checkmark.seal.fill": "verified",
  "bolt.fill": "bolt",
  "flame.fill": "local-fire-department",
  "clock": "access-time",
  "clock.fill": "access-time",
  "calendar": "calendar-today",
  "map.pin": "place",
  "hand.thumbsup": "thumb-up",
  "hand.thumbsup.fill": "thumb-up",
  "arrow.turn.up.left": "reply",
  "volume.3.fill": "volume-up",
  "volume.slash.fill": "volume-off",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const iconName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
