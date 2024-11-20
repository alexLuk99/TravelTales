import { Text, View } from "react-native";
import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from "react";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        async function getCurrentLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }

        getCurrentLocation();
    }, []);

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <MapView style={{flex: 1}} styleURL="mapbox://styles/mapbox/standard" projection="globe">
            <Camera followZoomLevel={1} followUserLocation />
            <LocationPuck pulsing={{ isEnabled:true }}/>
        </MapView>  
    );
}
