import Mapbox, { Camera, FillLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useState } from 'react';
import { Alert } from 'react-native';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState([""]);
    const fillLayerStyle = {
        fillColor: '#3bb2d0',
        fillOpacity: 0.7,
    };
    const filterWoldView = [
            "all",
            ["any",
                ["==", "all", ["get", "worldview"]],
                ["in", "US", ["get", "worldview"]]
            ],
            ["==", ["get", "disputed"], "false"],
            ['!',['in', ['get', 'iso_3166_1_alpha_3'], visitedCountries]]
        ];

        const handleCountryClick = (countryCode:any) => {
            Alert.alert(
                "Visited Country",
                `Have you visited ${countryCode}?`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Yes",
                        onPress: () => {
                            if (!visitedCountries.includes(countryCode)) {
                                setVisitedCountries([...visitedCountries, countryCode]);
                            }
                        },
                    },
                ],
                { cancelable: true }
            );
        };
    
    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <MapView style={{flex: 1}} styleURL="mapbox://styles/mapbox/standard" projection="globe">
            <VectorSource 
                id="global-layer-source" 
                url="mapbox://mapbox.country-boundaries-v1" 
                onPress={event => {
                    if (event.features && event.features.length > 0) {
                        const properties = event.features[0].properties;
                        if (properties) {
                            console.log(`Land: ${properties.name_en}, ISO-Code: ${properties.iso_3166_1_alpha_3}`);
                        } else {
                            console.log("Eigenschaften nicht verfügbar.");
                        }
                    } else {
                        console.log("Kein Land ausgewählt.");
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
            <LocationPuck pulsing={{ isEnabled:true }}/>
        </MapView>  
    );
}
