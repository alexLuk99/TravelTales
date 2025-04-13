import Mapbox from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';
import MapComponent from './MapComponent';
import StatisticsComponent from './StatisticsComponent';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fillLayerStyle = {
        fillColor: '#3bb2d0',
        fillOpacity: [
            'case',
            ['in', ['get', 'iso_3166_1_alpha_3'], ["literal", visitedCountries.length ? visitedCountries : ["NONE"]]],
            0,
            0.7
        ],
    };

    const filterWorldView = [
        "all",
        ["any",
            ["==", "all", ["get", "worldview"]],
            ["in", "US", ["get", "worldview"]]
        ],
        ["==", ["get", "disputed"], "false"]
    ];

    useEffect(() => {
        const loadVisitedCountries = async () => {
            try {
                const storedCountries = await AsyncStorage.getItem('visitedCountries');
                if (storedCountries) {
                    setVisitedCountries(JSON.parse(storedCountries));
                }
            } catch (error) {
                console.error('Fehler beim Laden der gespeicherten Länder:', error);
            }
        };
        loadVisitedCountries();
    }, []);

    const dismissModal = () => {
        setSelectedCountry(null);
        setIsModalVisible(false);
    };

    const toggleVisitedCountry = async (countryCode: string) => {
        let updatedCountries;
        if (visitedCountries.includes(countryCode)) {
            updatedCountries = visitedCountries.filter(code => code !== countryCode);
        } else {
            updatedCountries = [...visitedCountries, countryCode];
        }
        setVisitedCountries(updatedCountries);
        await AsyncStorage.setItem('visitedCountries', JSON.stringify(updatedCountries));
    };

    const handleCountryClick = (countryCode: string, countryName: string) => {
        if (selectedCountry && selectedCountry.code === countryCode) {
            setIsModalVisible(false);
            setSelectedCountry(null);
          } else {
            setSelectedCountry({ code: countryCode, name_en: countryName });
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
                handleCountryClick={handleCountryClick}
                fillLayerStyle={fillLayerStyle}
                filterWorldView={filterWorldView}
                country={selectedCountry}
                isModalVisible={isModalVisible}
                hideCloseButton={true}
            />
            <CountryModal
                isVisible={isModalVisible}
                country={selectedCountry}
                toggleVisited={toggleVisitedCountry}
                dismiss={dismissModal}
                visitedCountries={visitedCountries}
            />
            <StatisticsComponent visitedCountries={visitedCountries} />
        </View>
    );
}
