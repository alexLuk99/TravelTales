import Mapbox from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';
import MapComponent from './MapComponent';
import StatisticsComponent from './StatisticsComponent';
import * as Haptics from 'expo-haptics';
import OverviewModal from './OverviewModal';
import { COUNTRY_SECTIONS  } from '@/components/data/countries';
import { useDebouncedPersist } from '@/hooks/useDebouncedPersist';
import Coachmark from './Coachmark';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');
const SEEN_COACHMARK_KEY = 'seenCoachmarkV1';

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
    const [wantToVisitCountries, setWantToVisitCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string, iso_3166_1: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const [showCoachmark, setShowCoachmark] = useState(false);
    const closingOverviewRef = useRef(false);
    const openOverview = useCallback(() => setIsOverviewOpen(true), []);

    const closeOverview = useCallback(() => {
      if (closingOverviewRef.current) return;
      closingOverviewRef.current = true;
      setIsOverviewOpen(false);
      setTimeout(() => { closingOverviewRef.current = false; }, 450); // > animationOutTiming
    }, []);

    const fillLayerStyle = useMemo(() => ({
        fillColor: '#3bb2d0',
        fillOpacity: [
            'case',
            ['in', ['get', 'iso_a3'], ['literal', visitedCountries.length ? visitedCountries : ['__NONE__']]],
            0,
            0.7
        ],
        fillOpacityTransition: { duration: 1000 },
        fillSortKey: ['get', 'fillSortKey'],
    }), [visitedCountries]);

    const filterWorldView = useMemo(() => ([
        'all',
        ['has', 'iso_a3'],
    ]), []);

    useEffect(() => {
        (async () => {
          try {
            const v = await AsyncStorage.getItem('visitedCountries');
            const w = await AsyncStorage.getItem('wantToVisitCountries');
            const seen = await AsyncStorage.getItem(SEEN_COACHMARK_KEY);
            if (v) setVisitedCountries(JSON.parse(v));
            if (w) setWantToVisitCountries(JSON.parse(w));
            if (!seen) setShowCoachmark(true); // nur beim ersten Start anzeigen
          } catch (e) {
            console.error(e);
          }
        })();
      }, []);

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
        setVisitedCountries(prev => {
          const v = new Set(prev);
          v.has(code) ? v.delete(code) : v.add(code);
          return [...v];
        });
        setWantToVisitCountries(prev => {
          const w = new Set(prev);
          w.delete(code);
          return [...w];
        });
      }, []);
    
      const toggleWantToVisitCountry = useCallback((code: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(()=>{});
        setWantToVisitCountries(prev => {
          const w = new Set(prev);
          w.has(code) ? w.delete(code) : w.add(code);
          return [...w];
        });
        setVisitedCountries(prev => {
          const v = new Set(prev);
          v.delete(code);
          return [...v];
        });
      }, []);

    const handleCountryClick = (countryCode: string, countryName: string, countryCodeAlpha2: string) => {
        if (selectedCountry && selectedCountry.code === countryCode) {
            setIsModalVisible(false);
            setSelectedCountry(null);
        } else {
            setSelectedCountry({ code: countryCode, name_en: countryName, iso_3166_1: countryCodeAlpha2 });
            setIsModalVisible(true);
        }
    };

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    useDebouncedPersist(visitedCountries, wantToVisitCountries);

    return (
        <View style={{ flex: 1 }}>
            <MapComponent
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
                handleCountryClick={handleCountryClick}
                fillLayerStyle={fillLayerStyle}
                filterWorldView={filterWorldView}
                country={selectedCountry}
                isModalVisible={isModalVisible}
                hideCloseButton={true}
            />
            <Coachmark
                visible={showCoachmark}
                onDismiss={dismissCoachmark}
                text="Tap on a country to mark it as Visited or add it to your Wishlist."
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
            <StatisticsComponent
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
                onOpenMenu={openOverview}
            />
            <OverviewModal 
                visible={isOverviewOpen}
                onClose={closeOverview}
                title="Overview"
                sections={COUNTRY_SECTIONS}
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
                onToggleVisited={(code: string) => { toggleVisitedCountry(code); }}
                onToggleWishlist={(code: string) => { toggleWantToVisitCountry(code); }}
           />
        </View>
    );
}
