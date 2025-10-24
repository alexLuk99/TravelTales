import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import InsightsScreen from '@/components/InsightsScreen';
import { COUNTRY_SECTIONS } from '@/components/data/countries';
import { useStampbook } from '@/hooks/useStampbook';

export default function InsightsRoute() {
  const {
    visitedCountries,
    wantToVisitCountries,
    toggleVisited,
    toggleWishlist,
    hydrated,
  } = useStampbook();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <InsightsScreen
        sections={COUNTRY_SECTIONS}
        visitedCountries={visitedCountries}
        wantToVisitCountries={wantToVisitCountries}
        onToggleVisited={toggleVisited}
        onToggleWishlist={toggleWishlist}
        hydrated={hydrated}
      />
    </SafeAreaView>
  );
}

