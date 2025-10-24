import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';

import CountryRow from './CountryRow';
import type { Country, Section } from '@/components/data/countries';
import { AlphaPalette, Palette } from '@/constants/Colors';

type FlatRow =
  | { type: 'header'; key: string; title: string }
  | { type: 'country'; key: string; item: Country };

type FilterMode = 'all' | 'visited' | 'wishlist';

type Props = {
  sections: Section[];
  visitedCountries: string[];
  wantToVisitCountries: string[];
  onToggleVisited: (code3: string) => void;
  onToggleWishlist: (code3: string) => void;
  hydrated: boolean;
};

function flattenSections(sections: Section[]): FlatRow[] {
  const out: FlatRow[] = [];
  for (const sec of sections) {
    out.push({ type: 'header', key: `h:${sec.title}`, title: sec.title });
    for (const c of sec.data) {
      out.push({ type: 'country', key: c.iso_3166_1_alpha_3, item: c });
    }
  }
  return out;
}

const InsightsScreenBase = ({
  sections,
  visitedCountries,
  wantToVisitCountries,
  onToggleVisited,
  onToggleWishlist,
  hydrated,
}: Props) => {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);
  const wishSet = useMemo(() => new Set(wantToVisitCountries), [wantToVisitCountries]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredSections = useMemo(() => {
    if (filterMode === 'all') return sections;

    const keep = (country: Country) =>
      filterMode === 'visited'
        ? visitedSet.has(country.iso_3166_1_alpha_3)
        : wishSet.has(country.iso_3166_1_alpha_3);

    const out: Section[] = [];
    for (const sec of sections) {
      const data = sec.data.filter(keep);
      if (data.length) out.push({ ...sec, data });
    }
    return out;
  }, [sections, filterMode, visitedSet, wishSet]);

  const data = useMemo(() => flattenSections(filteredSections), [filteredSections]);

  const stickyHeaderIndices = useMemo(
    () => data.map((row, index) => (row.type === 'header' ? index : -1)).filter((i) => i !== -1),
    [data]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FlatRow>) => {
      if (item.type === 'header') {
        return (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
          </View>
        );
      }

      const country = item.item;
      return (
        <CountryRow
          item={country}
          visited={visitedSet.has(country.iso_3166_1_alpha_3)}
          wish={wishSet.has(country.iso_3166_1_alpha_3)}
          onToggleVisited={onToggleVisited}
          onToggleWishlist={onToggleWishlist}
        />
      );
    },
    [visitedSet, wishSet, onToggleVisited, onToggleWishlist]
  );

  const getItemType = useCallback((it: FlatRow) => it.type, []);

  const extraVersion = useMemo(
    () => ({
      v: visitedCountries.join('|'),
      w: wantToVisitCountries.join('|'),
      f: filterMode,
    }),
    [visitedCountries, wantToVisitCountries, filterMode]
  );

  const totalCountries = useMemo(
    () => sections.reduce((acc, section) => acc + section.data.length, 0),
    [sections]
  );

  const continentStats = useMemo(() => {
    return sections.map((section) => {
      let visited = 0;
      let wishlist = 0;
      for (const country of section.data) {
        if (visitedSet.has(country.iso_3166_1_alpha_3)) visited += 1;
        if (wishSet.has(country.iso_3166_1_alpha_3)) wishlist += 1;
      }

      return {
        title: section.title,
        visited,
        wishlist,
        total: section.data.length,
      };
    });
  }, [sections, visitedSet, wishSet]);

  const visitedContinentsCount = useMemo(
    () => continentStats.filter((c) => c.visited > 0).length,
    [continentStats]
  );

  const wishlistContinentsCount = useMemo(
    () => continentStats.filter((c) => c.wishlist > 0).length,
    [continentStats]
  );

  const mostVisitedContinent = useMemo(() => {
    if (!continentStats.length) return null;
    return continentStats.reduce<null | (typeof continentStats)[number]>((best, current) => {
      if (current.visited === 0) return best;
      if (!best) return current;
      if (current.visited > best.visited) return current;
      if (current.visited === best.visited && current.total > best.total) {
        return current;
      }
      return best;
    }, null);
  }, [continentStats]);

  const remainingCountries = useMemo(
    () => Math.max(0, totalCountries - visitedCountries.length),
    [totalCountries, visitedCountries.length]
  );

  const remainingMessage = useMemo(() => {
    if (remainingCountries <= 0) {
      return 'Every country stamped - what a journey!';
    }
    if (remainingCountries === 1) {
      return 'Just 1 country left to stamp your world map.';
    }
    return `${remainingCountries} countries left to stamp on your world map.`;
  }, [remainingCountries]);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Stampbook Insights</Text>
        <Text style={styles.headerSubtitle}>Track your stamped adventures and future plans.</Text>

        <View style={styles.summary}>
          <Text style={styles.sectionHeading}>Highlights</Text>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardSpacer]}>
              <Text style={[styles.summaryValue, styles.summaryStamped]}>{visitedCountries.length}</Text>
              <Text style={styles.summaryLabel}>Countries stamped</Text>
              <Text style={styles.summaryFootnote}>of {totalCountries}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardSpacer]}>
              <Text style={styles.summaryValue}>{visitedContinentsCount}</Text>
              <Text style={styles.summaryLabel}>Continents with stamps</Text>
              <Text style={styles.summaryFootnote}>of {sections.length}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, styles.summaryWishlist]}>{wantToVisitCountries.length}</Text>
              <Text style={styles.summaryLabel}>On your wishlist</Text>
              <Text style={styles.summaryFootnote}>
                {wishlistContinentsCount} continents
              </Text>
            </View>
          </View>
          <View style={styles.highlightRow}>
            <Text style={styles.highlightText}>{remainingMessage}</Text>
            {mostVisitedContinent ? (
              <View style={styles.highlightPill}>
                <Text style={styles.highlightPillText}>
                  Stamp momentum: {mostVisitedContinent.title} ({mostVisitedContinent.visited})
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterBtn, styles.filterBtnSpacing, filterMode === 'all' && styles.filterBtnOn]}
            onPress={() => setFilterMode('all')}
          >
            <Text style={[styles.filterText, filterMode === 'all' && styles.filterTextOn]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, styles.filterBtnSpacing, filterMode === 'visited' && styles.filterBtnOn]}
            onPress={() => setFilterMode('visited')}
          >
            <Text style={[styles.filterText, filterMode === 'visited' && styles.filterTextOn]}>
              Stamped ({visitedCountries.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterBtn, filterMode === 'wishlist' && styles.filterBtnOn]}
            onPress={() => setFilterMode('wishlist')}
          >
            <Text style={[styles.filterText, filterMode === 'wishlist' && styles.filterTextOn]}>
              Wishlist ({wantToVisitCountries.length})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.listContainer}>
        {hydrated ? (
          <FlashList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.key}
            getItemType={getItemType}
            estimatedItemSize={48}
            extraData={extraVersion}
            removeClippedSubviews={false}
            stickyHeaderIndices={stickyHeaderIndices}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.loader}>
            <ActivityIndicator color={Palette.horizonBlue} size="small" />
          </View>
        )}
      </View>
    </View>
  );
};

export default memo(InsightsScreenBase);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Palette.white },
  scroll: { flexGrow: 0, flexShrink: 0 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.slate,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Palette.slateMuted,
  },
  summary: {
    padding: 12,
    backgroundColor: AlphaPalette.overlaySky,
    borderRadius: 12,
  },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: Palette.slate, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryCard: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Palette.softBorder,
  },
  summaryCardSpacer: { marginRight: 8 },
  summaryValue: { fontSize: 20, fontWeight: '700', color: Palette.slate, marginBottom: 4 },
  summaryStamped: { color: Palette.horizonBlue },
  summaryWishlist: { color: Palette.sunsetOrange },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: Palette.slateMuted },
  summaryFootnote: { fontSize: 11, color: Palette.slateMuted },
  highlightRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  highlightText: { fontSize: 12, color: Palette.slate },
  highlightPill: {
    backgroundColor: AlphaPalette.overlaySunSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
    marginLeft: 'auto',
  },
  highlightPillText: { fontSize: 12, fontWeight: '600', color: Palette.sunsetOrange },
  filters: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.softBorder,
    backgroundColor: Palette.white,
  },
  filterBtnSpacing: { marginRight: 8 },
  filterBtnOn: {
    borderColor: Palette.horizonBlue,
    backgroundColor: AlphaPalette.overlaySky,
  },
  filterText: { fontSize: 13, color: Palette.slate, fontWeight: '600' },
  filterTextOn: { color: Palette.horizonBlue },
  listContainer: { flex: 1, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Palette.softBorder },
  listContent: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionHeader: {
    backgroundColor: Palette.cloudWhite,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Palette.slate },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
