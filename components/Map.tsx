import { Text, View } from "react-native";
import Mapbox, { Camera, LocationPuck, MapView } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import useUserLocation from "@/hooks/useUserLocation";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <MapView style={{flex: 1}} styleURL="mapbox://styles/mapbox/standard" projection="globe">
            <Camera 
                followZoomLevel={1} 
                followUserLocation 
            />
            <LocationPuck pulsing={{ isEnabled:true }}/>
        </MapView>  
    );
}
