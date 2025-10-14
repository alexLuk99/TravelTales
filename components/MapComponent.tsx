import React, { memo, useCallback, useMemo, useRef } from "react";
import {
  Camera,
  FillLayer,
  LocationPuck,
  MapView,
  VectorSource,
} from "@rnmapbox/maps";
import type { OnPressEvent } from "@rnmapbox/maps/lib/typescript/src/types/OnPressEvent";
import type {
  FillLayerStyleProps,
  FilterExpression,
} from "@rnmapbox/maps/lib/typescript/src/utils/MapboxStyles";

type CountryInfo = {
  name_en: string;
  code: string;
  iso_3166_1: string;
};

type MapComponentProps = {
  wantToVisitCountries: string[];
  handleCountryClick: (
    countryCode: string,
    countryName: string,
    countryCodeAlpha2: string
  ) => void;
  fillLayerStyle: FillLayerStyleProps;
  filterWorldView: FilterExpression;
  country?: CountryInfo | null;
  isModalVisible?: boolean;
};

const EMPTY_CODES = ["__NONE__"];

const MapComponent = ({
  wantToVisitCountries,
  handleCountryClick,
  fillLayerStyle,
  filterWorldView,
}: MapComponentProps) => {
  const mapRef = useRef<MapView>(null);

  const wishlistFillStyle = useMemo<FillLayerStyleProps>(() => {
    const codes =
      wantToVisitCountries.length > 0 ? wantToVisitCountries : EMPTY_CODES;

    return {
      fillColor: "#f4a261",
      fillOpacity: [
        "case",
        ["in", ["get", "iso_3166_1_alpha_3"], ["literal", codes]],
        0.5,
        0,
      ],
      fillOpacityTransition: { duration: 1000 },
    };
  }, [wantToVisitCountries]);

  const handlePress = useCallback(
    (event: OnPressEvent) => {
      const feature = event?.features?.[0];
      const properties = feature?.properties as
        | Record<string, unknown>
        | undefined;

      if (!properties) {
        return;
      }

      const countryCode = (properties.iso_3166_1_alpha_3 ??
        properties.iso_3166_1 ??
        properties.iso_3166_1_alpha3) as string | undefined;
      const countryCodeAlpha2 = (properties.iso_3166_1 ??
        properties.iso_3166_1_alpha_2 ??
        properties.iso_3166_1_alpha2) as string | undefined;
      const countryName = (properties.name_en ??
        properties.name ??
        properties.name_english) as string | undefined;

      if (!countryCode || !countryName || !countryCodeAlpha2) {
        console.log("[Map] tapped country missing data", properties);
        return;
      }

      console.log("[Map] tapped country:", {
        countryCode,
        countryName,
        countryCodeAlpha2,
      });

      handleCountryClick(countryCode, countryName, countryCodeAlpha2);
    },
    [handleCountryClick]
  );

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
      projection="globe"
    >
      <VectorSource
        id="countries-source"
        url="mapbox://mapbox.country-boundaries-v1"
        onPress={handlePress}
        hitbox={{ width: 16, height: 16 }}
      >
        <FillLayer
          id="countries-wishlist-fill"
          sourceLayerID="country_boundaries"
          style={wishlistFillStyle}
          filter={filterWorldView}
        />
        <FillLayer
          id="countries-fill-visited"
          sourceLayerID="country_boundaries"
          style={fillLayerStyle}
          filter={filterWorldView}
        />
      </VectorSource>
      <Camera followUserLocation followZoomLevel={1.6} />
      <LocationPuck pulsing={{ isEnabled: true }} />
    </MapView>
  );
};

export default memo(MapComponent);

