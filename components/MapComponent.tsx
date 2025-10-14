import React, { memo, useCallback, useMemo } from 'react';
import {
  Camera,
  FillLayer,
  LineLayer,
  LocationPuck,
  MapView,
  VectorSource,
} from '@rnmapbox/maps';

type CountrySelection = {
  code: string;
  name_en: string;
  iso_3166_1: string;
};

type MapComponentProps = {
  handleCountryClick: (alpha3: string, name_en: string, alpha2: string) => void;
  fillLayerStyle: Record<string, unknown>;
  filterWorldView: unknown[];
  country: CountrySelection | null;
  isModalVisible: boolean;
  wantToVisitCountries: string[];
};

type CountryProperties = {
  name?: string;
  name_en?: string;
  iso_3166_1_alpha_2?: string;
  iso_3166_1_alpha_3?: string;
};

const ISO_ALPHA3_FIELD = 'iso_3166_1_alpha_3';
const ISO_ALPHA2_FIELD = 'iso_3166_1_alpha_2';
const NAME_FIELD = 'name_en';
const EMPTY_SENTINEL = '__NONE__';

const MapComponent = ({
  handleCountryClick,
  fillLayerStyle,
  filterWorldView,
  country,
  isModalVisible,
  wantToVisitCountries,
}: MapComponentProps) => {
  const normalizedFilter = useMemo(
    () => (Array.isArray(filterWorldView) && filterWorldView.length ? filterWorldView : ['all']),
    [filterWorldView],
  );

  const extraClauses = useMemo(
    () => (normalizedFilter.length > 1 ? normalizedFilter.slice(1) : []),
    [normalizedFilter],
  );

  const highlightFilter = useMemo(
    () => [
      'all',
      ...extraClauses,
      ['==', ['get', ISO_ALPHA3_FIELD], country?.code ?? EMPTY_SENTINEL],
    ],
    [country, extraClauses],
  );

  const wishlistFilter = useMemo(
    () => [
      'all',
      ...extraClauses,
      [
        'in',
        ['get', ISO_ALPHA3_FIELD],
        ['literal', wantToVisitCountries.length ? wantToVisitCountries : [EMPTY_SENTINEL]],
      ],
    ],
    [extraClauses, wantToVisitCountries],
  );

  const highlightFillStyle = useMemo(
    () => ({
      fillColor: '#fbbf24',
      fillOpacity: isModalVisible ? 0.2 : 0,
      fillOpacityTransition: { duration: 160 },
    }),
    [isModalVisible],
  );

  const highlightBorderStyle = useMemo(
    () => ({
      lineColor: '#1f2937',
      lineOpacity: isModalVisible ? 1 : 0,
      lineJoin: 'round',
      lineCap: 'round',
      lineWidth: ['interpolate', ['linear'], ['zoom'], 1, 0.6, 6, 1.6, 8, 2.4],
    }),
    [isModalVisible],
  );

  const wishlistStyle = useMemo(
    () => ({
      fillColor: '#f4a261',
      fillOpacity: 0.7,
    }),
    [],
  );

  const handlePress = useCallback(
    (event: Parameters<NonNullable<React.ComponentProps<typeof VectorSource>['onPress']>>[0]) => {
      const feature = event.features?.[0];
      const properties = feature?.properties as CountryProperties | undefined;
      if (!properties) {
        return;
      }

      const alpha3 = properties[ISO_ALPHA3_FIELD];
      const alpha2 = properties[ISO_ALPHA2_FIELD];
      const name = properties[NAME_FIELD] ?? properties.name;

      if (alpha3 && alpha2 && name) {
        handleCountryClick(alpha3, name, alpha2);
      }
    },
    [handleCountryClick],
  );

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
      scaleBarEnabled={false}
      compassEnabled
      compassFadeWhenNorth
      compassPosition={{ top: 200, right: 5 }}
      zoomEnabled
      logoEnabled={false}
      attributionPosition={{ bottom: 5, left: 5 }}
    >
      <VectorSource
        id="countries-source"
        url="mapbox://mapbox.country-boundaries-v1"
        hitbox={{ width: 32, height: 32 }}
        onPress={handlePress}
      >
        <FillLayer
          id="countries-overlay"
          sourceID="countries-source"
          sourceLayerID="country_boundaries"
          style={fillLayerStyle}
          filter={normalizedFilter}
        />
        <FillLayer
          id="countries-wishlist"
          sourceID="countries-source"
          sourceLayerID="country_boundaries"
          style={wishlistStyle}
          filter={wishlistFilter}
        />
        <FillLayer
          id="countries-highlight"
          sourceID="countries-source"
          sourceLayerID="country_boundaries"
          style={highlightFillStyle}
          filter={highlightFilter}
        />
        <LineLayer
          id="countries-highlight-border"
          sourceID="countries-source"
          sourceLayerID="country_boundaries"
          style={highlightBorderStyle}
          filter={highlightFilter}
        />
      </VectorSource>
      <Camera followZoomLevel={1.4} followUserLocation />
      <LocationPuck pulsing={{ isEnabled: true }} />
    </MapView>
  );
};

export default memo(MapComponent);
