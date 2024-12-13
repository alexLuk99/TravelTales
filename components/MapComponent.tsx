import React from 'react';
import Mapbox, { Camera, FillLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';

const MapComponent = ({ visitedCountries, handleCountryClick, fillLayerStyle, filterWorldView }: any) => {
    return (
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
                    filter={filterWorldView}
                />
            </VectorSource>
            <Camera followZoomLevel={1} followUserLocation />
            <LocationPuck pulsing={{ isEnabled: true }} />
        </MapView>
    );
};

export default MapComponent;
