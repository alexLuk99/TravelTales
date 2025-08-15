import Mapbox from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';
import MapComponent from './MapComponent';
import StatisticsComponent from './StatisticsComponent';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
    const [wantToVisitCountries, setWantToVisitCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string, iso_3166_1: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fillLayerStyle = useMemo(() => ({
        fillColor: '#3bb2d0',
        fillOpacity: [
            'case',
            ['in', ['get', 'iso_3166_1_alpha_3'], ["literal", visitedCountries.length ? visitedCountries : ["NONE"]]],
            0,
            0.7
        ],
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

    const toggleVisitedCountry = async (code: string) => {
        const v = new Set(visitedCountries);
        const w = new Set(wantToVisitCountries);
        v.has(code) ? v.delete(code) : v.add(code);
        w.delete(code);
        const visitedArr = [...v];
        const wantArr = [...w];
        setVisitedCountries(visitedArr);
        setWantToVisitCountries(wantArr);
        await AsyncStorage.multiSet([
            ['visitedCountries', JSON.stringify(visitedArr)],
            ['wantToVisitCountries', JSON.stringify(wantArr)],
        ]);
    };
    
    const toggleWantToVisitCountry = async (code: string) => {
        const v = new Set(visitedCountries);
        const w = new Set(wantToVisitCountries);
        w.has(code) ? w.delete(code) : w.add(code);
        v.delete(code);
        const visitedArr = [...v];
        const wantArr = [...w];
        setVisitedCountries(visitedArr);
        setWantToVisitCountries(wantArr);
        await AsyncStorage.multiSet([
          ['visitedCountries', JSON.stringify(visitedArr)],
          ['wantToVisitCountries', JSON.stringify(wantArr)],
        ]);
    };

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
            />
        </View>
    );
}
