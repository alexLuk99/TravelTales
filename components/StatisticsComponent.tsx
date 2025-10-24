import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { AlphaPalette, Palette } from '@/constants/Colors';
import { COUNTRIES } from '@/components/data/countries';

const TOTAL_COUNTRIES = 195;
const CARD_VERTICAL_PADDING = 6;
const COUNTRY_BY_ISO = new Map(
  COUNTRIES.map((country) => [country.iso_3166_1_alpha_3, country])
);

type StatsProps = {
  visitedCountries: string[];
  wantToVisitCountries: string[];
  bottomInset?: number;
};

function StatisticsComponentBase({
  visitedCountries,
  wantToVisitCountries,
  bottomInset = 0,
}: StatsProps) {
  const stampedCount   = useMemo(() => visitedCountries.length, [visitedCountries]);
  const wishlistCount  = useMemo(() => wantToVisitCountries.length, [wantToVisitCountries]);
  const progressRatio = useMemo(
    () => Math.min(1, stampedCount / TOTAL_COUNTRIES),
    [stampedCount]
  );
  const stampedContinents = useMemo(() => {
    const set = new Set<string>();
    for (const iso of visitedCountries) {
      const meta = COUNTRY_BY_ISO.get(iso);
      if (meta?.continent) {
        set.add(meta.continent);
      }
    }
    return set.size;
  }, [visitedCountries]);

  return (
    <View style={[styles.card, bottomInset ? { paddingBottom: CARD_VERTICAL_PADDING + bottomInset } : null]}>
      <View style={styles.progressRow}>
        <Text style={styles.progressMeta}>
          {stampedCount}/{TOTAL_COUNTRIES}
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(5, progressRatio * 100)}%` },
            ]}
          />
          <View style={styles.progressTail} />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.label}>Stamped</Text>
          <Text style={[styles.value, styles.stampedValue]}>{stampedCount}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBlock}>
          <Text style={styles.label}>Wishlist</Text>
          <Text style={[styles.value, styles.wishlistValue]}>{wishlistCount}</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.label}>Continents</Text>
          <Text style={styles.value}>{stampedContinents}</Text>
        </View>
      </View>

    </View>
  );
}

export default memo(StatisticsComponentBase);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: CARD_VERTICAL_PADDING,
    borderWidth: 0,
    width: '100%',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: AlphaPalette.overlaySky,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: Palette.horizonBlue,
  },
  progressMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.slateMuted,
  },
  progressTail: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: AlphaPalette.overlaySky,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  label: { fontSize: 12, fontWeight: '700', color: Palette.slateMuted, marginBottom: 4 },
  value: { fontSize: 24, fontWeight: '800', color: Palette.slate },
  stampedValue: { color: Palette.horizonBlue },
  wishlistValue: { color: Palette.sunsetOrange },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: Palette.softBorder,
    opacity: 0.8,
    alignSelf: 'stretch',
  },
});
