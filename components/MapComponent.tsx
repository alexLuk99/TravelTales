import React, { memo, useMemo } from 'react';
import { Camera, FillLayer, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
import countriesGeoJSON from '@/assets/data/countries-simplified.json';

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

type ShapeSourcePressEvent = Parameters<NonNullable<React.ComponentProps<typeof ShapeSource>['onPress']>>[0];

type CountryProperties = {
  name?: string;
  'ISO3166-1-Alpha-2'?: string;
  'ISO3166-1-Alpha-3'?: string;
};

const EMPTY_COUNTRY_SENTINEL = '__NONE__';
const ISO_ALPHA3_FIELD = 'ISO3166-1-Alpha-3';
const ISO_ALPHA2_FIELD = 'ISO3166-1-Alpha-2';
const NAME_FIELD = 'name';

const featureCollection = countriesGeoJSON as GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryProperties>;

const MapComponent = ({
  handleCountryClick,
  fillLayerStyle,
  filterWorldView,
  country,
  isModalVisible,
  wantToVisitCountries,
}: MapComponentProps) => {
  const highlightLayerStyle = useMemo(
    () => ({
      fillColor: '#fbb03b',
      fillOpacity: isModalVisible ? 0.18 : 0,
      fillOpacityTransition: { duration: 160 },
    }),
    [isModalVisible],
  );

  const borderLayerStyle = useMemo(
    () => ({
      lineColor: '#1f2937',
      lineOpacity: isModalVisible ? 1 : 0,
      lineJoin: 'round',
      lineCap: 'round',
      lineWidth: ['interpolate', ['linear'], ['zoom'], 1, 0.5, 6, 1.6, 8, 2.2],
    }),
    [isModalVisible],
  );

  const wantLayerStyle = useMemo(
    () => ({
      fillColor: '#f4a261',
      fillOpacity: 0.7,
    }),
    [],
  );

  const hitLayerStyle = useMemo(
    () => ({
      fillOpacity: 0,
    }),
    [],
  );

  const wantFilter = useMemo(
    () => [
      'all',
      ['in', ['get', ISO_ALPHA3_FIELD], ['literal', wantToVisitCountries.length ? wantToVisitCountries : [EMPTY_COUNTRY_SENTINEL]]],
    ],
    [wantToVisitCountries],
  );

  const highlightFilter = useMemo(
    () => [
      'all',
      ['==', ['get', ISO_ALPHA3_FIELD], country?.code ?? EMPTY_COUNTRY_SENTINEL],
    ],
    [country],
  );

  const handleOnPress = (event: ShapeSourcePressEvent) => {
    const feature = event.features?.[0];
    const properties = feature?.properties as CountryProperties | undefined;
    const alpha3 = properties?.[ISO_ALPHA3_FIELD];
    const alpha2 = properties?.[ISO_ALPHA2_FIELD];
    const name = properties?.[NAME_FIELD];

    if (alpha3 && alpha2 && name) {
      handleCountryClick(alpha3, name, alpha2);
    }
  };

  return (
    <MapView
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
      scaleBarEnabled={false}
      preferredFramesPerSecond={60}
      compassEnabled
      compassFadeWhenNorth
      compassPosition={{ top: 200, right: 5 }}
      zoomEnabled
      logoEnabled={false}
      attributionPosition={{ bottom: 5, left: 5 }}
    >
      <ShapeSource id="countries-shape-source" shape={featureCollection} onPress={handleOnPress}>
        <FillLayer id="countries-base-layer" sourceID="countries-shape-source" style={fillLayerStyle} filter={filterWorldView} />
        <FillLayer id="countries-wishlist-layer" sourceID="countries-shape-source" style={wantLayerStyle} filter={wantFilter} />
        <FillLayer id="countries-hit-layer" sourceID="countries-shape-source" style={hitLayerStyle} />
        <FillLayer id="countries-highlight-layer" sourceID="countries-shape-source" style={highlightLayerStyle} filter={highlightFilter} />
        <LineLayer id="countries-highlight-border" sourceID="countries-shape-source" style={borderLayerStyle} filter={highlightFilter} />
      </ShapeSource>

      <Camera followZoomLevel={0.9} followUserLocation />
      <LocationPuck pulsing={{ isEnabled: true }} />
    </MapView>
  );
};

export default memo(MapComponent);
