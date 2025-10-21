import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

type Country = {
  name_en: string;
  code: string;         // ISO3
  iso_3166_1: string;   // ISO2
};

type Props = {
  isVisible: boolean;
  country: Country | null;
  toggleVisited: (code3: string) => void;
  toggleWantToVisit: (code3: string) => void;
  dismiss: () => void;
  onHideComplete?: () => void;
  visitedCountries: string[];
  wantToVisitCountries: string[];
  hideCloseButton?: boolean;
};

function countryCodeToEmoji(alpha2: string) {
  return alpha2?.toUpperCase()?.replace(/./g, (c) =>
    String.fromCodePoint(127397 + c.charCodeAt(0))
  );
}

function CountryModalBase({
  isVisible,
  country,
  toggleVisited,
  toggleWantToVisit,
  dismiss,
  onHideComplete,
  visitedCountries,
  wantToVisitCountries,
  hideCloseButton,
}: Props) {
  const visited = useMemo(
    () => !!country && visitedCountries.includes(country.code),
    [visitedCountries, country]
  );
  const want = useMemo(
    () => !!country && wantToVisitCountries.includes(country.code),
    [wantToVisitCountries, country]
  );

  if (!country) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={dismiss}
      onBackButtonPress={dismiss}
      onSwipeComplete={dismiss}
      swipeDirection={['up','down']}
      swipeThreshold={60}
      useNativeDriver={false}
      hasBackdrop={false}
      coverScreen={false}
      animationIn="slideInDown"
      animationOut="slideOutUp"
      animationInTiming={200}
      animationOutTiming={500}
      backdropTransitionOutTiming={1}
      hideModalContentWhileAnimating ={true}
      onModalHide={onHideComplete}
      style={s.sheetWrapper}
    >
       <View style={s.box}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.centerTitleRow}>
          <Text style={s.flag}>{countryCodeToEmoji(country.iso_3166_1)}</Text>
          <Text style={s.title} numberOfLines={1}>{country.name_en}</Text>
        </View>

        {!hideCloseButton && (
          <TouchableOpacity
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Close country details"
            style={s.closeBtn}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={[s.actionBtn, visited && s.actionOnVisited]}
          onPress={() => { toggleVisited(country.code); dismiss(); }}
        >
          <Text style={[s.actionIcon, s.visitedIcon]}>
            {visited ? '✓' : '✓'}  {/* Symbol */}
          </Text>
          <Text style={[s.actionText, s.visitedText]}>Visited</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, want && s.actionOnWish]}
          onPress={() => {
            toggleWantToVisit(country.code);
            dismiss();
          }}
        >
          <Text style={[s.actionIcon, s.wishIcon]}>
            {want ? '★' : '★'} {/* Symbol */}
          </Text>
          <Text style={[s.actionText, s.wishText]}>Wishlist</Text>
        </TouchableOpacity>

      </View>

      {/* Grabber ganz unten im Modal */}
      <View style={s.grabber} />
    </View>
  </Modal>
  );
}

export default memo(CountryModalBase);

const s = StyleSheet.create({
  sheetWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    margin: 0,
    paddingHorizontal: 8,
    paddingTop: 10, // kleiner Abstand zur Statusbar
  },
  box: {
    width: '96%',
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  // Header oben
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingRight: 45, // Platz für Close-Button
  },
  centerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '88%',
  },
  flag: { fontSize: 30, lineHeight: 30 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    flexShrink: 1,
  },

  // Close-Button oben rechts
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(17,122,139,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: '#117a8b' },

  // Action-Buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  actionBtn: {
    flexDirection: 'row',       // horizontale Anordnung
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,                     // Abstand zwischen Icon & Text
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,           // runde Chips
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  actionIcon: { fontSize: 20,  textAlign: 'center', marginLeft: 2 },
  actionText: { fontSize: 14, fontWeight: '700' },

  // Visited-State (blau)
  visitedText: { color: '#117a8b' },
  visitedIcon: { color: '#3bb2d0' },
  actionOnVisited: {
    borderColor: '#3bb2d0',
    backgroundColor: 'rgba(59,178,208,0.10)',
  },

  // Wishlist-State (orange)
  wishText: { color: '#9a5a27' },
  wishIcon: { color: '#f4a261' },
  actionOnWish: {
    borderColor: '#f4a261',
    backgroundColor: 'rgba(244,162,97,0.10)',
  },

  // Grabber ganz unten
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 8,
  },
});

