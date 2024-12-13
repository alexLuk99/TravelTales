import Mapbox, { Camera, FillLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useEffect, useState } from 'react';
import { View, Text, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountryModal from './CountryModal';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState([""]);
    const [selectedCountry, setSelectedCountry] = useState<{ name_en: string; code: string } | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fillLayerStyle = {
        fillColor: '#3bb2d0',
        fillOpacity: [
            'case',
            ['in', ['get', 'iso_3166_1_alpha_3'], ["literal", visitedCountries]],
            0, // Kein Füllwert für besuchte Länder
            0.7 // Füllwert für unbesuchte Länder
        ],
    };

    const filterWoldView = [
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
        setSelectedCountry({ code: countryCode, name_en: countryName });
        setIsModalVisible(true);
    };

    const dismissModal = () => {
        setIsModalVisible(false);
        setSelectedCountry(null);
    };

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView style={{ flex: 1 }} styleURL="mapbox://styles/mapbox/standard" projection="globe">
                <VectorSource
                    id="global-layer-source"
                    url="mapbox://mapbox.country-boundaries-v1"
                    onPress={(event) => {
                        if (event.features && event.features.length > 0) {
                            const properties = event.features[0].properties;
                            if (properties) {
                                handleCountryClick(properties.iso_3166_1_alpha_3, properties.name_en);
                            }
                        }
                    }}
                >
                    <FillLayer
                        id="country-layer"
                        sourceLayerID="country_boundaries"
                        style={fillLayerStyle}
                        filter={filterWoldView}
                    />
                </VectorSource>
                <Camera
                    followZoomLevel={1}
                    followUserLocation
                />
                <LocationPuck pulsing={{ isEnabled: true }} />
            </MapView>
            <CountryModal
                isVisible={isModalVisible}
                country={selectedCountry}
                toggleVisited={toggleVisitedCountry}
                dismiss={dismissModal}
                visitedCountries={visitedCountries}
            />
        </View>
    );
}
