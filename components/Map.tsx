import Mapbox from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';
import MapComponent from './MapComponent';
import StatisticsComponent from './StatisticsComponent';
import * as Haptics from 'expo-haptics';
import OverviewModal from './OverviewModal';
import { COUNTRY_SECTIONS  } from '@/components/data/countries';
import { useRef } from 'react';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
    const [wantToVisitCountries, setWantToVisitCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string, iso_3166_1: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isOverviewOpen, setIsOverviewOpen] = useState(false);
    const countries = COUNTRY_SECTIONS ;

    const fillLayerStyle = useMemo(() => ({
        fillColor: '#3bb2d0',
        fillOpacity: [
            'case',
            ['in', ['get', 'iso_3166_1_alpha_3'], ["literal", visitedCountries.length ? visitedCountries : ["NONE"]]],
            0,
            0.7
        ],
        fillOpacityTransition: { duration: 1000 },
    }), [visitedCountries]);

    const filterWorldView = useMemo(() => ([
        "all",
        ["any",
            ["==", "all", ["get", "worldview"]],
            ["in", "US", ["get", "worldview"]]
        ],
        ["==", ["get", "disputed"], "false"]
    ]), []);

    useEffect(() => {
        (async () => {
            try {
                const v = await AsyncStorage.getItem('visitedCountries');
                const w = await AsyncStorage.getItem('wantToVisitCountries');
                if (v) setVisitedCountries(JSON.parse(v));
                if (w) setWantToVisitCountries(JSON.parse(w));
            } catch (e) {
                console.error(e);
            }
        })();
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

    function useDebouncedPersist(visited: string[], wish: string[]) {
        const timeoutRef = useRef<NodeJS.Timeout | null>(null);
      
        useEffect(() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            AsyncStorage.multiSet([
              ['visitedCountries', JSON.stringify(visited)],
              ['wantToVisitCountries', JSON.stringify(wish)],
            ]).catch(() => {});
          }, 250); // 250–400ms: fühlt sich instant an, spart IO/Bridge
          return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          };
        }, [visited, wish]);
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
            <CountryModal
                isVisible={isModalVisible}
                onHideComplete={handleModalHide}
                country={selectedCountry}
                toggleVisited={toggleVisitedCountry}
                toggleWantToVisit={toggleWantToVisitCountry}
                dismiss={dismissModal}
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
            />
            <StatisticsComponent
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
                onOpenMenu={() => setIsOverviewOpen(true)}
            />
            <OverviewModal 
                visible={isOverviewOpen}
                onClose={() => setIsOverviewOpen(false)}
                title="Overview"
                sections={COUNTRY_SECTIONS}
                visitedCountries={visitedCountries}
                wantToVisitCountries={wantToVisitCountries}
                onToggleVisited={toggleVisitedCountry}
                onToggleWishlist={toggleWantToVisitCountry}
           />
        </View>
    );
}