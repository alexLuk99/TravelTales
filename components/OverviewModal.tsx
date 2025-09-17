import React, { memo, useMemo, useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { FlashList, type ListRenderItemInfo } from '@shopify/flash-list';
import CountryRow from './CountryRow';

type Country = {
  name_en: string;
  iso_3166_1_alpha_3: string;
  iso_3166_1: string;
  continent?: string;
  region?: string;
};

type Section = { title: string; data: Country[] };

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

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver={true}
      animationOut="slideOutDown"
      // hasBackdrop={false}
      // coverScreen={false}
      // onSwipeComplete={onClose}
      // swipeDirection={['down']}
      // swipeThreshold={60}
      style={s.sheetWrapper}
    >
      <View style={s.box}>
        <View style={s.grabber} />
        <View style={s.header}>
          <Text style={s.title}>{title ?? 'Overview'}</Text>
          <TouchableOpacity onPress={onClose}><Text style={s.close}>×</Text></TouchableOpacity>
        </View>

        <View style={s.filters}>
          <TouchableOpacity
            style={[s.filterBtn, filterMode === 'all' && s.filterBtnOn]}
            onPress={() => setFilterMode('all')}
          >
            <Text style={[s.filterText, filterMode === 'all' && s.filterTextOn]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.filterBtn, filterMode === 'visited' && s.filterBtnOn]}
            onPress={() => setFilterMode('visited')}
          >
            <Text style={[s.filterText, filterMode === 'visited' && s.filterTextOn]}>
              Visited ({visitedCountries.length})
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

        {/* <View style={s.columnHeaderRow}>
          <Text style={[s.columnHeader, { marginLeft: 0 }]}>Visited</Text>
          <Text style={[s.columnHeader, { marginLeft: 0 }]}>Wishlist</Text>
        </View> */}

        <View style={{ height: 420}}>
          <FlashList
            data={data}
            renderItem={renderItem}
            keyExtractor={(it: FlatRow) => it.key}
            getItemType={getItemType}
            estimatedItemSize={44} // falls deine Version das schon kann
            stickyHeaderIndices={stickyHeaderIndices}
            drawDistance={800}
            showsVerticalScrollIndicator
            contentContainerStyle={{ paddingBottom: 16 }}
            ListEmptyComponent={<Text style={{ padding: 12 }}>Keine Einträge gefunden.</Text>}
            extraData={extraVersion}  
          />
        </View>
      </View>
    </Modal>
  );
}

export default memo(OverviewModalBase);

const s = StyleSheet.create({
  sheetWrapper: { justifyContent: 'flex-end', margin: 0, paddingHorizontal: 8 },
  box: {
    backgroundColor: 'white',
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
    color: '#666',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  filterBtnOn: {
    borderColor: '#3bb2d0',
    backgroundColor: 'rgba(59,178,208,0.10)',
  },
  filterText: { fontSize: 13, color: '#333', fontWeight: '600' },
  filterTextOn: { color: '#117a8b' },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: 8,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  close: { fontSize: 22, lineHeight: 22 },

  sectionHeader: {
    backgroundColor: '#f5f7f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 0,
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#333' },
});
