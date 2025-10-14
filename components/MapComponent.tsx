import React, { useMemo, useCallback, memo } from 'react';
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

  const handlePress = useCallback((event: any) => {
    if (!event.features || event.features.length === 0) return;

    // Debug: Log alle geclickten Features
    console.log('All features at click:', event.features.map((f: any) => ({
      name: f.properties?.name_en,
      iso_a3: f.properties?.iso_3166_1_alpha_3,
    })));

    // Nehme das erste Feature
    const properties = event.features[0].properties;
    if (properties?.iso_3166_1_alpha_3 && properties?.name_en && properties?.iso_3166_1) {
      handleCountryClick(properties.iso_3166_1_alpha_3, properties.name_en, properties.iso_3166_1);
    }
  }, [handleCountryClick]);

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
      scaleBarEnabled={false}
      preferredFramesPerSecond={60}
      compassEnabled={true}
      compassFadeWhenNorth={true} 
      compassPosition={{  top: 200, right: 5 }}
      zoomEnabled={true}
      logoEnabled={false}
      attributionPosition={{ bottom: 5, left: 5 }}
    >
      <VectorSource
        id="global-layer-source"
        url="mapbox://mapbox.country-boundaries-v1"
        onPress={handlePress}
        hitbox={{ width: 0.5, height: 0.5 }}
        
      >
        <FillLayer
          id="highlight-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={highlightLayerStyle}
          filter={highlightFilter}
          belowLayerID='water'
        />
        <FillLayer
          id="country-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={fillLayerStyle}
          filter={filterWorldView}
          belowLayerID='water'
        />
        <FillLayer
          id="want-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          style={wantLayerStyle}
          filter={wantFilter}
          belowLayerID='water'
        />
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