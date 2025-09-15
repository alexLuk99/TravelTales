// CountryRow.tsx
import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Country = {
  name_en: string;
  iso_3166_1_alpha_3: string;
  iso_3166_1: string;
};

function countryCodeToEmoji(alpha2: string) {
  return alpha2?.toUpperCase()?.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

type Props = {
  item: Country;
  visited: boolean;
  wish: boolean;
  onToggleVisited: (code3: string) => void;
  onToggleWishlist: (code3: string) => void;
};

function CountryRowBase({
  item,
  visited,
  wish,
  onToggleVisited,
  onToggleWishlist,
}: Props) {
  const code3 = item.iso_3166_1_alpha_3;

  return (
    <View style={s.row}>
      <Text style={s.flag}>{countryCodeToEmoji(item.iso_3166_1)}</Text>
      <Text style={s.name} numberOfLines={1}>{item.name_en}</Text>

      <TouchableOpacity
        style={[s.checkbox, visited && s.checkboxOn]}
        onPress={() => onToggleVisited(code3)}
      >
        <Text style={s.checkboxText}>{visited ? "✓" : ""}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.checkbox, wish && s.checkboxWish]}
        onPress={() => onToggleWishlist(code3)}
      >
        <Text style={s.checkboxWishText}>{wish ? "★" : ""}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Custom comparator: nur neu rendern, wenn sichtbare Inhalte sich ändern.
// Handler-Identitäten ignorieren wir bewusst.
export default memo(
  CountryRowBase,
  (prev, next) =>
    prev.item.iso_3166_1_alpha_3 === next.item.iso_3166_1_alpha_3 &&
    prev.item.name_en === next.item.name_en &&
    prev.item.iso_3166_1 === next.item.iso_3166_1 &&
    prev.visited === next.visited &&
    prev.wish === next.wish
);

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 },
  flag: { width: 28, textAlign: "center", fontSize: 18 },
  name: { flex: 1, fontSize: 14, color: "#111" },
  checkbox: {
    width: 28, height: 28, borderWidth: 1, borderColor: "#ccc",
    alignItems: "center", justifyContent: "center",
    borderRadius: 6, marginLeft: 6,
  },
  checkboxOn: { borderColor: "#3bb2d0", backgroundColor: "rgba(59,178,208,0.15)" },
  checkboxWish: { borderColor: "#f4a261", backgroundColor: "rgba(244,162,97,0.12)" },
  checkboxText: { fontSize: 16, color: "#3bb2d0" },
  checkboxWishText: { fontSize: 16, color: "#f4a261" },
});
