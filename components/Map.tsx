import { Text, View } from "react-native";
import Mapbox, { Camera, FillLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import useUserLocation from "@/hooks/useUserLocation";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const fillLayerStyle = {
        fillColor: '#3bb2d0', // Globale Füllfarbe
        fillOpacity: 0.5,    // Transparenz
    };

    let text = 'Waiting...';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    return (
        <MapView style={{flex: 1}} styleURL="mapbox://styles/mapbox/standard" projection="globe">
            <VectorSource id="global-layer-source" url="mapbox://mapbox.country-boundaries-v1">
                <FillLayer 
                    id="country-layer" 
                    sourceLayerID="country_boundaries" 
                    style={fillLayerStyle} 
                    filter={[
                        "all",
                        [
                          "==",
                          ["get", "disputed"],
                          "false"
                        ],
                        [
                          "any",
                          [
                            "==",
                            "all",
                            ["get", "worldview"]
                          ],
                          [
                            "in",
                            "US",
                            ["get", "worldview"]
                          ]
                        ]
                      ]}
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
