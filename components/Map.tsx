import Mapbox, { Camera, FillLayer, LocationPuck, MapView, RasterLayer, VectorSource } from '@rnmapbox/maps';
import useUserLocation from "@/hooks/useUserLocation";
import { useState } from 'react';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY || '');

export default function Map() {
    const { location, errorMsg } = useUserLocation();
    const [visitedCountries, setVisitedCountries] = useState(["IT"]);
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
            ['!',['in', ['get', 'iso_3166_1_alpha_3'], ["DEU", "FRA", "ITA"]]]
        ];

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
