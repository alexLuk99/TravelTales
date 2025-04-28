import React, { useRef } from 'react';
import Mapbox, { Camera, FillLayer, LineLayer, LocationPuck, MapView, VectorSource } from '@rnmapbox/maps';

const MapComponent = ({ handleCountryClick, fillLayerStyle, filterWorldView, country, isModalVisible, wantToVisitCountries }: any) => {

  const highlightLayerStyle = {
    fillColor: '#fbb03b',
    fillOpacity: isModalVisible ? 1 : 0,
  };

  const borderLayerStyle = {
    lineColor: 'black',
    lineWidth: 1,
    lineOpacity: isModalVisible ? 1 : 0,
  };

  const wantLayerStyle = {
    fillColor: '#f4a261',
    fillOpacity: 1,
  };

  const wantFilter = [
    "all",
    ["any",
      ["==", "all", ["get", "worldview"]],
      ["in", "US", ["get", "worldview"]]
    ],
    ["==", ["get", "disputed"], "false"],
    ["in",
      ["get", "iso_3166_1_alpha_3"],
      ["literal", wantToVisitCountries.length ? wantToVisitCountries : ["NONE"]]
    ]
  ];

  const highlightFilter = [
    "all",
    ["any", ["==", "all", ["get", "worldview"]], ["in", "US", ["get", "worldview"]]],
    ["==", ["get", "disputed"], "false"],
    country?.code
      ? ['==', ['get', 'iso_3166_1_alpha_3'], country.code]
      : ['==', ['get', 'iso_3166_1_alpha_3'], '']
  ];

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
      scaleBarEnabled={false}
      compassEnabled={true}
      compassFadeWhenNorth={true}
      compassViewPosition={1}
      compassViewMargins={{ x: 20, y: 120 }}
      preferredFramesPerSecond={60}
      compassPosition={{ top: 20, right: 20 }}
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
          id="country-layer"
          sourceID="country-boundaries"
          sourceLayerID="country_boundaries"
          style={fillLayerStyle}
          filter={filterWorldView}
          belowLayerID="water"
        />
        <FillLayer
          id="want-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          existing
          style={wantLayerStyle}
          filter={wantFilter}
          belowLayerID="water"
        />
        <FillLayer
          id="highlight-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          existing
          style={highlightLayerStyle}
          filter={highlightFilter}
          belowLayerID="water"
        />
        <LineLayer
          id="highlight-border-layer"
          sourceID="global-layer-source"
          sourceLayerID="country_boundaries"
          existing
          style={borderLayerStyle}
          filter={highlightFilter}
          aboveLayerID="water"
        />
      </VectorSource>
      <Camera followZoomLevel={0.9} followUserLocation />
      <LocationPuck pulsing={{ isEnabled: true }} />
    </MapView>
  );
};

export default MapComponent;
