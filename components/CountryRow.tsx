import React, { memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";

import { AlphaPalette, Palette } from "@/constants/Colors";

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
        accessibilityRole="button"
        accessibilityLabel={visited ? "Unstamp this country" : "Stamp this country"}
      >
        {visited ? (
          <FontAwesome5 name="stamp" size={14} color={Palette.horizonBlue} />
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={[s.checkbox, wish && s.checkboxWish]}
        onPress={() => onToggleWishlist(code3)}
        accessibilityRole="button"
        accessibilityLabel={wish ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Text style={s.checkboxWishText}>{wish ? "\u2605" : ""}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Custom comparator: nur neu rendern, wenn sichtbare Inhalte sich aendern.
// Handler-Identitaeten ignorieren wir bewusst.
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
  name: { flex: 1, fontSize: 14, color: Palette.slate },
  checkbox: {
    width: 28, height: 28, borderWidth: 1, borderColor: Palette.softBorder,
    alignItems: "center", justifyContent: "center",
    borderRadius: 6, marginLeft: 6,
  },
  checkboxOn: { borderColor: Palette.horizonBlue, backgroundColor: AlphaPalette.overlaySky },
  checkboxWish: { borderColor: Palette.sunsetOrange, backgroundColor: AlphaPalette.overlaySun },
  checkboxWishText: { fontSize: 16, color: Palette.sunsetOrange },
});
