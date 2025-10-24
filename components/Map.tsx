import Mapbox from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';
import MapComponent from './MapComponent';
import StatisticsComponent from './StatisticsComponent';
import * as Haptics from 'expo-haptics';
import Coachmark from './Coachmark';
import { Palette } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStampbook } from '@/hooks/useStampbook';
import { useRouter } from 'expo-router';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');
const SEEN_COACHMARK_KEY = 'seenCoachmarkV1';

export default function Map() {
    const { location } = useUserLocation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const bottomInset = Math.max(insets.bottom, 8);
    const { visitedCountries, wantToVisitCountries, toggleVisited, toggleWishlist, hydrated } = useStampbook();
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string, iso_3166_1: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showCoachmark, setShowCoachmark] = useState(false);
    const insightsLockRef = useRef(false);

    const handleOpenInsights = useCallback(() => {
      if (insightsLockRef.current) return;
      insightsLockRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(()=>{});
      router.push('/insights');
      const UNLOCK_AFTER = 600;
      setTimeout(() => {
        insightsLockRef.current = false;
      }, UNLOCK_AFTER);
    }, [router]);

    const fillLayerStyle = useMemo(() => {
        const visitedList = visitedCountries.length ? visitedCountries : ['__NONE__'];
        const wishlist = wantToVisitCountries.length ? wantToVisitCountries : ['__NONE__'];

        return {
            fillColor: Palette.skyBlue,
            fillOpacity: [
                'case',
                ['in', ['get', 'iso_a3'], ['literal', visitedList]],
                0,
                ['in', ['get', 'iso_a3'], ['literal', wishlist]],
                0,
                0.7
            ],
            fillOpacityTransition: { duration: 1000 },
            fillSortKey: ['get', 'fillSortKey'],
        };
    }, [visitedCountries, wantToVisitCountries]);

    const filterWorldView = useMemo(() => ([
        'all',
        ['has', 'iso_a3'],
    ]), []);

    useEffect(() => {
        if (!hydrated) return;
        let cancelled = false;
        (async () => {
          try {
            const seen = await AsyncStorage.getItem(SEEN_COACHMARK_KEY);
            if (!cancelled && !seen) setShowCoachmark(true); // nur beim ersten Start anzeigen
          } catch (e) {
            console.error(e);
          }
        })();
        return () => {
          cancelled = true;
        };
      }, [hydrated]);

      const dismissCoachmark = useCallback(async () => {
        try {
          setShowCoachmark(false);
          await AsyncStorage.setItem(SEEN_COACHMARK_KEY, '1');
        } catch {}
      }, []);

    const dismissModal = () => setIsModalVisible(false);
    const handleModalHide = () => setSelectedCountry(null);

    const toggleVisitedCountry = useCallback((code: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
        toggleVisited(code);
      }, [toggleVisited]);
    
      const toggleWantToVisitCountry = useCallback((code: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
        toggleWishlist(code);
      }, [toggleWishlist]);

    const handleCountryClick = (countryCode: string, countryName: string, countryCodeAlpha2: string) => {
        if (selectedCountry && selectedCountry.code === countryCode) {
            setIsModalVisible(false);
            setSelectedCountry(null);
        } else {
            setSelectedCountry({ code: countryCode, name_en: countryName, iso_3166_1: countryCodeAlpha2 });
            setIsModalVisible(true);
        }
    };

    return (
        <View style={styles.root}>
            <View style={styles.mapSection}>
              <MapComponent
                  visitedCountries={visitedCountries}
                  wantToVisitCountries={wantToVisitCountries}
                  handleCountryClick={handleCountryClick}
                  fillLayerStyle={fillLayerStyle}
                  filterWorldView={filterWorldView}
                  country={selectedCountry}
                  isModalVisible={isModalVisible}
                  hideCloseButton={true}
                  location={location}
                  onOpenInsights={handleOpenInsights}
              />
            </View>
            <View style={styles.footer}>
              <StatisticsComponent
                  visitedCountries={visitedCountries}
                  wantToVisitCountries={wantToVisitCountries}
                  bottomInset={bottomInset}
              />
            </View>
            <Coachmark
                visible={showCoachmark}
                onDismiss={dismissCoachmark}
                title="Welcome to your Stampbook"
                text="Tap a country to stamp the places you've already explored and earmark new adventures for your wishlist."
                ctaLabel="Start stamping"
            />
            <CountryModal
                isVisible={isModalVisible}
                onHideComplete={handleModalHide}
                country={selectedCountry}
                toggleVisited={(code: string) => { toggleVisitedCountry(code); }}
                toggleWantToVisit={(code: string) => { toggleWantToVisitCountry(code); }}
                dismiss={dismissModal}
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapSection: { flex: 1 },
  footer: {
    paddingHorizontal: 0,
    paddingTop: 0,
    backgroundColor: Palette.white,
  },
});
