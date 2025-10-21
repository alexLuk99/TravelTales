import React, { memo, useMemo, useRef, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Palette } from '@/constants/Colors';

const TOTAL_COUNTRIES = 195;

type StatsProps = {
  visitedCountries: string[];
  wantToVisitCountries: string[];
  onOpenMenu?: () => void;
};

function StatisticsComponentBase({
  visitedCountries,
  wantToVisitCountries,
  onOpenMenu,
}: StatsProps) {
  const visitedCount   = useMemo(() => visitedCountries.length, [visitedCountries]);
  const wishlistCount  = useMemo(() => wantToVisitCountries.length, [wantToVisitCountries]);
  const percentVisited = useMemo(
    () => Math.round((visitedCount / TOTAL_COUNTRIES) * 100),
    [visitedCount]
  );

  // Entprellen gegen schnelle Mehrfach-Taps
  const lockRef = useRef(false);
  const [disabled, setDisabled] = useState(false);

  const handleOpen = useCallback(() => {
    if (!onOpenMenu) return;
    if (lockRef.current) return;

    lockRef.current = true;
    setDisabled(true);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});

    onOpenMenu();

    // Dauer leicht > Modal animation timings (z. B. 350–450ms)
    const UNLOCK_AFTER = 450;
    setTimeout(() => {
      lockRef.current = false;
      setDisabled(false);
    }, UNLOCK_AFTER);
  }, [onOpenMenu]);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <Text style={styles.label}>Visited:</Text>
        <Text style={styles.visitedNumber}>{visitedCount}</Text>
        <Text style={styles.totalText}>/ {TOTAL_COUNTRIES}</Text>
        <Text style={styles.percentText}>({percentVisited}%)</Text>
        <Text style={styles.wishlistText}>Wishlist: {wishlistCount}</Text>
      </View>

      <Pressable
        onPress={handleOpen}
        disabled={!onOpenMenu || disabled}
        accessibilityRole="button"
        accessibilityLabel="Open overview"
        hitSlop={8}
        style={({ pressed }) => [
          styles.burgerButton,
          pressed && styles.burgerPressed,
          (disabled || !onOpenMenu) && styles.burgerDisabled,
        ]}
      >
        <Text style={styles.burgerIcon}>☰</Text>
      </Pressable>
    </View>
  );
}

export default memo(StatisticsComponentBase);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Palette.white,
    alignItems: 'flex-end',
    position: 'relative',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 18, fontWeight: 'bold', color: Palette.slate, marginBottom: 4, marginRight: 8 },
  visitedNumber: { fontSize: 24, fontWeight: 'bold', color: Palette.horizonBlue },
  totalText: { fontSize: 18, color: Palette.slateMuted, marginHorizontal: 2 },
  percentText: { fontSize: 12, color: Palette.slateMuted, marginRight: 16, marginTop: 6 },
  wishlistText: { fontSize: 14, color: Palette.sunsetOrange },
  burgerButton: { position: 'relative', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 8 },
  burgerPressed: { opacity: 0.7 },
  burgerDisabled: { opacity: 0.5 },
  burgerIcon: { fontSize: 24, fontWeight: 'bold', color: Palette.slate },
});
