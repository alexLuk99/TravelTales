import React, { useMemo, useRef, memo } from 'react';
import Mapbox, { Camera, FillLayer, LineLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';

const MapComponent = ({ handleCountryClick, fillLayerStyle, filterWorldView, country, isModalVisible, wantToVisitCountries }: any) => {
  
  const highlightLayerStyle = useMemo(() => ({
    fillColor: '#fbb03b',
    fillOpacity: isModalVisible ? 0.18 : 0,           
    fillOpacityTransition: { duration: 160 },         
  }), [isModalVisible]);

  const borderLayerStyle = useMemo(() => ({
    lineColor: '#1f2937',
    lineOpacity: isModalVisible ? 1 : 0,
    lineJoin: 'round',
    lineCap: 'round',
    lineWidth: ['interpolate', ['linear'], ['zoom'], 1, 0.5, 6, 1.6, 8, 2.2],
  }), [isModalVisible]);

  const wantLayerStyle = useMemo(() => ({
    fillColor: '#f4a261',
    fillOpacity: 0.7,
   }), []);

  const wantFilter = useMemo(() => ([
    'all',
    ['any', ['==','all',['get','worldview']], ['in','US',['get','worldview']]],
    ['==', ['get','disputed'], 'false'],
    ['in', ['get','iso_3166_1_alpha_3'], ['literal', wantToVisitCountries.length ? wantToVisitCountries : ['NONE']]],
  ]), [wantToVisitCountries]);

  const highlightFilter = useMemo(() => ([
    'all',
    ['any', ['==','all',['get','worldview']], ['in','US',['get','worldview']]],
    ['==', ['get','disputed'], 'false'],
    country?.code
    ? ['==', ['get','iso_3166_1_alpha_3'], country.code]
    : ['==', ['get','iso_3166_1_alpha_3'], ''],
  ]), [country]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
      scaleBarEnabled={false}
      preferredFramesPerSecond={60}
      compassEnabled={true}
      compassFadeWhenNorth={false} 
      compassPosition={{  top: 200, right: 5 }}
    >
      <VectorSource
        id="global-layer-source"
        url="mapbox://mapbox.country-boundaries-v1"
        onPress={(event) => {
          if (event.features && event.features.length > 0) {
            const properties = event.features[0].properties;
            if (properties) {
              handleCountryClick(properties.iso_3166_1_alpha_3, properties.name_en, properties.iso_3166_1);
            }
          }
        }}
      >
        <FillLayer
          id="highlight-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={highlightLayerStyle}
          filter={highlightFilter}
          belowLayerID='water'
        />
        {/* 2) Overlay-Maske */}
        <FillLayer
          id="country-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={fillLayerStyle}
          filter={filterWorldView}
          belowLayerID='water'
        />
        {/* 3) Wishlist oben */}
        <FillLayer
          id="want-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={wantLayerStyle}
          filter={wantFilter}
          belowLayerID='water'
        />
        {/* 4) Kontur ganz oben */}
        <LineLayer
          id="highlight-border-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={borderLayerStyle}
          filter={highlightFilter}
        />
      </VectorSource>
      <Camera followZoomLevel={0.9} followUserLocation />
      <LocationPuck pulsing={{ isEnabled: true }} />
    </MapView>
  );
};

export default memo(MapComponent);
