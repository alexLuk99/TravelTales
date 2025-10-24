import React, { memo, useMemo, useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  InteractionManager,
  Animated,
  PanResponder,
} from 'react-native';
import Modal from 'react-native-modal';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import CountryRow from './CountryRow';
import type { Country, Section } from '@/components/data/countries';
import { AlphaPalette, Palette } from '@/constants/Colors';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  visitedCountries: string[];
  wantToVisitCountries: string[];
  sections: Section[];
  onToggleVisited: (code3: string) => void;
  onToggleWishlist: (code3: string) => void;
};

type FlatRow =
  | { type: 'header'; key: string; title: string }
  | { type: 'country'; key: string; item: Country };

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

type FilterMode = 'all' | 'visited' | 'wishlist';

function OverviewModalBase({
  visible,
  onClose,
  title,
  sections,
  visitedCountries,
  wantToVisitCountries,
  onToggleVisited,
  onToggleWishlist,
}: Props) {

  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);
  const wishSet    = useMemo(() => new Set(wantToVisitCountries), [wantToVisitCountries]);

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isContentVisible, setContentVisible] = useState(false);
  const sheetTranslate = useRef(new Animated.Value(0)).current;
  const interactionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(null);
  const fallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPending = useCallback(() => {
    if (interactionRef.current) {
      interactionRef.current.cancel();
      interactionRef.current = null;
    }
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    sheetTranslate.setValue(0);
  }, [sheetTranslate]);

  useEffect(() => {
    if (!visible) {
      clearPending();
      setContentVisible(false);
      return;
    }

    clearPending();
    setContentVisible(false);

    interactionRef.current = InteractionManager.runAfterInteractions(() => {
      setContentVisible(true);
      interactionRef.current = null;
    });

    fallbackTimeoutRef.current = setTimeout(() => {
      setContentVisible(true);
      if (interactionRef.current) {
        interactionRef.current.cancel();
        interactionRef.current = null;
      }
      fallbackTimeoutRef.current = null;
    }, 260);

    return clearPending;
  }, [visible, clearPending]);

  const handleModalHide = useCallback(() => {
    clearPending();
    setContentVisible(false);
  }, [clearPending]);

  const closeModal = useCallback(() => {
    sheetTranslate.setValue(0);
    onClose();
  }, [onClose, sheetTranslate]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => visible,
        onMoveShouldSetPanResponder: (_, gesture) =>
          visible && gesture.dy > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          const offset = Math.max(0, gesture.dy);
          sheetTranslate.setValue(offset);
        },
        onPanResponderRelease: (_, gesture) => {
          const shouldClose = gesture.dy > 140 || gesture.vy > 1.1;
          if (shouldClose) {
            closeModal();
          } else {
            Animated.spring(sheetTranslate, {
              toValue: 0,
              useNativeDriver: true,
              speed: 18,
              bounciness: 0,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetTranslate, {
            toValue: 0,
            useNativeDriver: true,
            speed: 18,
            bounciness: 0,
          }).start();
        },
        onPanResponderTerminationRequest: () => false,
      }),
    [visible, sheetTranslate, closeModal]
  );

  const filteredSections = useMemo(() => {
    if (filterMode === 'all') return sections;
  
    const keep = (c: Country) =>
      filterMode === 'visited'
        ? visitedSet.has(c.iso_3166_1_alpha_3)
        : wishSet.has(c.iso_3166_1_alpha_3);
  
    const out: Section[] = [];
    for (const sec of sections) {
      const data = sec.data.filter(keep);
      if (data.length) out.push({ ...sec, data });
    }
    return out;
  }, [sections, filterMode, visitedSet, wishSet]);

  const data = useMemo(() => flattenSections(filteredSections), [filteredSections]);

  const stickyHeaderIndices = useMemo(
    () => data.map((row, i) => (row.type === 'header' ? i : -1)).filter(i => i !== -1),
    [data]
  );


  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<FlatRow>) => {
      if (item.type === 'header') {
        return (
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>{item.title}</Text>
          </View>
        );
      }
      const c = item.item;
      return (
        <CountryRow
          item={c}
          visited={visitedSet.has(c.iso_3166_1_alpha_3)}
          wish={wishSet.has(c.iso_3166_1_alpha_3)}
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
    <Modal
      isVisible={visible}
      useNativeDriver={false}
      useNativeDriverForBackdrop={false}
      hideModalContentWhileAnimating ={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={1}
      onModalHide={handleModalHide}
      onBackdropPress={closeModal}
      onBackButtonPress={closeModal}
      onSwipeComplete={closeModal}
      swipeDirection={['down']}
      swipeThreshold={80}
      backdropOpacity={0.3}
      propagateSwipe
      style={s.sheetWrapper}
    >
      <Animated.View style={[s.box, { transform: [{ translateY: sheetTranslate }] }]}>
        <View style={s.dragContainer}>
          <View style={s.dragHandle} {...panResponder.panHandlers}>
            <View style={s.grabber} />
          </View>
          <View style={s.header}>
            <Text style={s.title}>{title ?? 'Stampbook Overview'}</Text>
            <TouchableOpacity
              onPress={closeModal}
              style={s.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close stampbook overview"
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Text style={s.closeBtnText}>{"\u2715"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.summary}>
          <Text style={s.sectionHeading}>Stampbook Highlights</Text>
          <View style={s.summaryRow}>
            <View style={[s.summaryCard, s.summaryCardSpacer]}>
              <Text style={[s.summaryValue, s.summaryStamped]}>{visitedCountries.length}</Text>
              <Text style={s.summaryLabel}>Countries stamped</Text>
              <Text style={s.summaryFootnote}>of {totalCountries}</Text>
            </View>
            <View style={[s.summaryCard, s.summaryCardSpacer]}>
              <Text style={s.summaryValue}>{visitedContinentsCount}</Text>
              <Text style={s.summaryLabel}>Continents with stamps</Text>
              <Text style={s.summaryFootnote}>of {sections.length}</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={[s.summaryValue, s.summaryWishlist]}>{wantToVisitCountries.length}</Text>
              <Text style={s.summaryLabel}>On your wishlist</Text>
              <Text style={s.summaryFootnote}>
                {wishlistContinentsCount} continents
              </Text>
            </View>
          </View>
          <View style={s.highlightRow}>
            <Text style={s.highlightText}>
              {remainingMessage}
            </Text>
            {mostVisitedContinent ? (
              <View style={s.highlightPill}>
                <Text style={s.highlightPillText}>
                  Stamp momentum: {mostVisitedContinent.title} ({mostVisitedContinent.visited})
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={s.filters}>
          <TouchableOpacity
            style={[s.filterBtn, s.filterBtnSpacing, filterMode === 'all' && s.filterBtnOn]}
            onPress={() => setFilterMode('all')}
          >
            <Text style={[s.filterText, filterMode === 'all' && s.filterTextOn]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.filterBtn, s.filterBtnSpacing, filterMode === 'visited' && s.filterBtnOn]}
            onPress={() => setFilterMode('visited')}
          >
            <Text style={[s.filterText, filterMode === 'visited' && s.filterTextOn]}>
              Stamped ({visitedCountries.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.filterBtn, filterMode === 'wishlist' && s.filterBtnOn]}
            onPress={() => setFilterMode('wishlist')}
          >
            <Text style={[s.filterText, filterMode === 'wishlist' && s.filterTextOn]}>
              Wishlist ({wantToVisitCountries.length})
            </Text>
          </TouchableOpacity>
        </View>
 
        <View style={{ height: 420 }}>
          {isContentVisible ? (
            <FlashList
              data={data}
              renderItem={renderItem}
              keyExtractor={(it) => it.key}
              getItemType={getItemType}
              estimatedItemSize={44}
              extraData={extraVersion}
              removeClippedSubviews={false}
              overrideItemLayout={(layout /*, item*/) => {
                layout.size = 44; // deine Row: 28 (Checkbox) + 8+8 Padding = ~44
                layout.span = 1;
              }}
              stickyHeaderIndices={stickyHeaderIndices}
              drawDistance={800}
            />
          ) : visible ? (
            <View style={s.loader}>
              <ActivityIndicator color={Palette.horizonBlue} size="small" />
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

export default memo(OverviewModalBase);

const s = StyleSheet.create({
  sheetWrapper: { justifyContent: 'flex-end', margin: 0, paddingHorizontal: 8 },
  box: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '85%',
  },
  columnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  columnHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.slateMuted,
  },
  dragContainer: { paddingBottom: 4 },
  dragHandle: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  summary: {
    marginBottom: 16,
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
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.softBorder,
    marginBottom: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: Palette.slate },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: AlphaPalette.overlaySky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: Palette.horizonBlue },

  sectionHeader: {
    backgroundColor: Palette.cloudWhite,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 0,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Palette.slate },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
