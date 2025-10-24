import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, type TextStyle } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Modal from 'react-native-modal';

import { AlphaPalette, Palette } from '@/constants/Colors';

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
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const stamped = useMemo(
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
            style={[s.closeBtn, isCompact && s.closeBtnCompact]}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={s.closeBtnText}>{"\u2715"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Actions */}
      <View style={[s.actions, isCompact && s.actionsStacked]}>
        <TouchableOpacity
          style={[s.actionBtn, isCompact && s.actionBtnCompact, stamped && s.actionOnStamped]}
          onPress={() => { toggleVisited(country.code); dismiss(); }}
          accessibilityRole="button"
          accessibilityLabel={stamped ? 'Unstamp this country' : 'Stamp this country'}
          accessibilityState={{ selected: stamped }}
        >
          <View style={[s.actionIconWrap, stamped && s.actionIconWrapStamped]}>
            <FontAwesome5
              name="stamp"
              size={16}
              color={stamped ? Palette.brandNavy : Palette.horizonBlue}
            />
          </View>
          <Text style={[s.actionText, stamped && s.stampedText]}>
            {stamped ? 'Stamped' : 'Stamp it!'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.actionBtn, isCompact && s.actionBtnCompact, want && s.actionOnWish]}
          onPress={() => {
            toggleWantToVisit(country.code);
            dismiss();
          }}
          accessibilityRole="button"
          accessibilityState={{ selected: want }}
        >
          <View style={[s.actionIconWrap, s.actionIconWrapWish, want && s.actionIconWrapWishOn]}>
            <Text style={[s.actionIcon, s.actionIconWish, want && s.actionIconWishOn]}>{'\u2605'}</Text>
          </View>
          <Text style={[s.actionText, want && s.wishText]}>Wishlist</Text>
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
    backgroundColor: Palette.white,
    borderRadius: 12,
    padding: 10,
    shadowColor: Palette.shadow,
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  // Header oben
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingRight: 48, // Platz für Close-Button
  },
  centerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '88%',
  },
  flag: { fontSize: 26, lineHeight: 28 },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: Palette.slate,
    textAlign: 'center',
    flexShrink: 1,
  },

  // Close-Button oben rechts
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: AlphaPalette.overlaySky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnCompact: {
    top: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  closeBtnText: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: Palette.horizonBlue },

  // Action-Buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  actionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Palette.softBorder,
    backgroundColor: Palette.white,
    minWidth: 136,
  },
  actionBtnCompact: {
    width: '100%',
    minWidth: 0,
    alignSelf: 'stretch',
  },
  actionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AlphaPalette.overlaySky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconWrapStamped: {
    backgroundColor: AlphaPalette.overlaySkyStrong,
  },
  actionIconWrapWish: {
    backgroundColor: AlphaPalette.overlaySunSoft,
  },
  actionIconWrapWishOn: {
    backgroundColor: AlphaPalette.overlaySunStrong,
  },
  actionIcon: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.horizonBlue,
    lineHeight: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  } as TextStyle,
  actionIconOn: { color: Palette.brandNavy },
  actionIconWish: { color: Palette.sunsetOrange },
  actionIconWishOn: { color: Palette.brandNavy },
  actionText: { fontSize: 14, fontWeight: '700', color: Palette.slate },

  // Stamped-State
  stampedText: { color: Palette.horizonBlue },
  actionOnStamped: {
    borderColor: Palette.horizonBlue,
    backgroundColor: AlphaPalette.overlaySky,
  },

  // Wishlist-State (orange)
  wishText: { color: Palette.sunsetOrange },
  actionOnWish: {
    borderColor: Palette.sunsetOrange,
    backgroundColor: AlphaPalette.overlaySun,
  },

  // Grabber ganz unten
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Palette.softBorder,
    marginTop: 8,
  },
});

