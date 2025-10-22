import React, { useMemo, memo, useState, useCallback, useRef, useEffect } from 'react';
import { Camera, FillLayer, LineLayer, LocationPuck, MapView, ShapeSource } from '@rnmapbox/maps';
import type { Camera as MapboxCameraRef, MapState } from '@rnmapbox/maps';
import type { LocationObject } from 'expo-location';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COUNTRY_FEATURE_COLLECTION } from '@/components/data/countries';
import { AlphaPalette, Palette } from '@/constants/Colors';

type ShapeSourcePressEvent = Parameters<NonNullable<React.ComponentProps<typeof ShapeSource>['onPress']>>[0];

type CountryProperties = {
  name?: string;
  iso_a2?: string;
  iso_a3?: string;
  fillSortKey?: number;
};

const EMPTY_COUNTRY_SENTINEL = '__NONE__';
const ISO_ALPHA3_FIELD = 'iso_a3';
const ISO_ALPHA2_FIELD = 'iso_a2';
const NAME_FIELD = 'name';

const featureCollection = COUNTRY_FEATURE_COLLECTION as GeoJSON.FeatureCollection<
  GeoJSON.Geometry,
  CountryProperties
>;

const QUICK_CENTER_ANIMATION_MS = 120;
const NORTH_REALIGN_DURATION_MS = 120;
const LOCATION_SNAP_DELTA = 0.00045;

type MapComponentProps = {
  handleCountryClick: (alpha3: string, name: string, alpha2: string) => void;
  fillLayerStyle: any;
  filterWorldView: any;
  country: { code: string } | null;
  isModalVisible: boolean;
  wantToVisitCountries: string[];
  visitedCountries?: string[];
  location: LocationObject | null;
  hideCloseButton?: boolean;
};

const MapComponent = ({ handleCountryClick, fillLayerStyle, filterWorldView, country, isModalVisible, wantToVisitCountries, location }: MapComponentProps) => {
  const [loaded, setLoaded] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [cameraTriggerKey, setCameraTriggerKey] = useState(0);
  const cameraRef = useRef<MapboxCameraRef>(null);
  const headingResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const iconOpacity = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(0.95)).current;
  const lastCenteredKeyRef = useRef<string | null>(null);
  const userCoords = location?.coords
    ? ([location.coords.longitude, location.coords.latitude] as [number, number])
    : null;

  const highlightLayerStyle = useMemo(() => ({
    fillColor: Palette.sunYellow,
    fillOpacity: isModalVisible ? 0.18 : 0,           
    fillOpacityTransition: { duration: 160 },
    fillSortKey: ['get', 'fillSortKey'],
  }), [isModalVisible]);

  const borderLayerStyle = useMemo(() => ({
    lineColor: Palette.brandNavy,
    lineOpacity: isModalVisible ? 1 : 0,
    lineJoin: 'round',
    lineCap: 'round',
    lineWidth: ['interpolate', ['linear'], ['zoom'], 1, 0.5, 6, 1.6, 8, 2.2],
    lineSortKey: ['get', 'fillSortKey'],
  }), [isModalVisible]);

  const wantLayerStyle = useMemo(() => ({
    fillColor: Palette.sunsetOrange,
    fillOpacity: 0.6,
    fillSortKey: ['get', 'fillSortKey'],
   }), []);

  const hitLayerStyle = useMemo(() => ({
    fillColor: Palette.brandNavy,
    fillOpacity: 0,
    fillSortKey: ['get', 'fillSortKey'],
  }), []);

  const wantFilter = useMemo(() => ([
    'all',
    ['in', ['get', ISO_ALPHA3_FIELD], ['literal', wantToVisitCountries.length ? wantToVisitCountries : [EMPTY_COUNTRY_SENTINEL]]],
  ]), [wantToVisitCountries]);

  const highlightFilter = useMemo(() => ([
    'all',
    ['==', ['get', ISO_ALPHA3_FIELD], country?.code ?? EMPTY_COUNTRY_SENTINEL],
  ]), [country]);

  const handleOnPress = (event: ShapeSourcePressEvent) => {
    const features = event.features;
    if (!features?.length) return;

    let picked: CountryProperties | null = null;
    let pickedSortKey = -Infinity;

    for (const feature of features) {
      const props = feature?.properties as CountryProperties | undefined;
      if (!props) continue;
      const sortKey = typeof props.fillSortKey === 'number' ? props.fillSortKey : 0;
      if (!picked || sortKey > pickedSortKey) {
        picked = props;
        pickedSortKey = sortKey;
      }
    }

    if (!picked) return;

    const alpha3 = picked.iso_a3;
    const alpha2 = picked.iso_a2;
    const name = picked.name;

    if (alpha3 && alpha2 && name) {
      handleCountryClick(alpha3, name, alpha2);
    }
  };

  const queueCenterOnUser = useCallback(() => {
    if (headingResetTimeout.current) {
      clearTimeout(headingResetTimeout.current);
      headingResetTimeout.current = null;
    }

    const camera = cameraRef.current;
    if (!camera) return;

    const stopFn = (camera as any)?.stop;
    if (typeof stopFn === 'function') {
      stopFn();
    }

    if (!userCoords) {
      camera.setCamera({
        heading: 0,
        pitch: 0,
        animationDuration: NORTH_REALIGN_DURATION_MS,
        animationMode: 'easeTo',
      });
      lastCenteredKeyRef.current = null;
      return;
    }

    const key = `${userCoords[0].toFixed(5)}:${userCoords[1].toFixed(5)}`;

    camera.setCamera({
      centerCoordinate: userCoords,
      zoomLevel: 0.9,
      animationDuration: QUICK_CENTER_ANIMATION_MS,
      animationMode: 'easeTo',
    });

    lastCenteredKeyRef.current = key;

    headingResetTimeout.current = setTimeout(() => {
      const currentCamera = cameraRef.current;
      if (!currentCamera) return;

      const followStop = (currentCamera as any)?.stop;
      if (typeof followStop === 'function') {
        followStop();
      }

      currentCamera.setCamera({
        heading: 0,
        pitch: 0,
        animationDuration: NORTH_REALIGN_DURATION_MS,
        animationMode: 'easeTo',
      });

      headingResetTimeout.current = null;
    }, QUICK_CENTER_ANIMATION_MS + 20);
  }, [userCoords]);

  const handleFollowUser = useCallback(() => {
    if (headingResetTimeout.current) {
      clearTimeout(headingResetTimeout.current);
      headingResetTimeout.current = null;
    }

    const camera = cameraRef.current;
    if (camera) {
      const stopFn = (camera as any)?.stop;
      if (typeof stopFn === 'function') {
        stopFn();
      }

      lastCenteredKeyRef.current = null;
    }

    queueCenterOnUser();

    setIsFollowingUser(true);
    setCameraTriggerKey(key => key + 1);
  }, [queueCenterOnUser]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: isFollowingUser ? 0.55 : 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: isFollowingUser ? 0.88 : 1,
        friction: 7,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [iconOpacity, iconScale, isFollowingUser]);

  useEffect(() => {
    if (!userCoords || !isFollowingUser) return;

    const key = `${userCoords[0].toFixed(5)}:${userCoords[1].toFixed(5)}`;
    if (lastCenteredKeyRef.current === key) return;

    queueCenterOnUser();
  }, [userCoords, isFollowingUser, queueCenterOnUser]);

  useEffect(() => () => {
    if (headingResetTimeout.current) {
      clearTimeout(headingResetTimeout.current);
      headingResetTimeout.current = null;
    }
    lastCenteredKeyRef.current = null;
  }, []);

  const handleCameraChanged = useCallback(
    (state: MapState) => {
      const gestureActive = Boolean(state?.gestures?.isGestureActive);
      if (gestureActive) {
        if (isFollowingUser) {
          setIsFollowingUser(false);
        }
        lastCenteredKeyRef.current = null;
        if (headingResetTimeout.current) {
          clearTimeout(headingResetTimeout.current);
          headingResetTimeout.current = null;
        }
        return;
      }

      if (!userCoords || isFollowingUser) return;

      const center = state?.properties?.center;
      if (!Array.isArray(center) || center.length < 2) return;

      const [lon, lat] = center;
      if (typeof lon !== 'number' || typeof lat !== 'number') return;

      const delta = Math.hypot(lon - userCoords[0], lat - userCoords[1]);
      if (delta <= LOCATION_SNAP_DELTA) {
        queueCenterOnUser();
        setIsFollowingUser(true);
        setCameraTriggerKey(key => key + 1);
      }
    },
    [isFollowingUser, queueCenterOnUser, userCoords],
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/alexluk/cm4r3x4s100a401r13dfy9puc"
        projection="globe"
        scaleBarEnabled={false}
        preferredFramesPerSecond={60}
        compassEnabled={true}
        compassFadeWhenNorth={loaded}
        compassPosition={{ top: 200, right: 5 }}
        zoomEnabled={true}
        logoEnabled={false}
        attributionPosition={{ bottom: 5, left: 5 }}
        onDidFinishLoadingMap={() => setLoaded(true)}
        onCameraChanged={handleCameraChanged}
      >
        <ShapeSource id="countries-shape-source" shape={featureCollection} onPress={handleOnPress}>
          <FillLayer
            id="countries-base-layer"
            sourceID="countries-shape-source"
            style={fillLayerStyle}
            filter={filterWorldView}
          />
          {/* keep native city labels visible above the wishlist fill */}
          <FillLayer
            id="countries-wishlist-layer"
            sourceID="countries-shape-source"
            style={wantLayerStyle}
            filter={wantFilter}
            belowLayerID="water"
          />
          <FillLayer
            id="countries-hit-layer"
            sourceID="countries-shape-source"
            style={hitLayerStyle}
          />
          <FillLayer
            id="countries-highlight-layer"
            sourceID="countries-shape-source"
            style={highlightLayerStyle}
            filter={highlightFilter}
          />
          <LineLayer
            id="countries-highlight-border"
            sourceID="countries-shape-source"
            style={borderLayerStyle}
            filter={highlightFilter}
          />
        </ShapeSource>
        <Camera
          ref={cameraRef}
          followZoomLevel={isFollowingUser ? 0.9 : undefined}
          followUserLocation={isFollowingUser}
          animationMode="easeTo"
          triggerKey={cameraTriggerKey}
          animationDuration={QUICK_CENTER_ANIMATION_MS}
        />
        <LocationPuck pulsing={{ isEnabled: true }} />
      </MapView>
      <Pressable
        onPress={handleFollowUser}
        accessibilityRole="button"
        accessibilityLabel="Kamera folgt wieder meinem Standort"
        hitSlop={10}
        style={({ pressed }) => [
          styles.followButton,
          pressed && styles.followButtonPressed,
        ]}
      >
        <Animated.View style={{ transform: [{ scale: iconScale }], opacity: iconOpacity }}>
          <MaterialIcons
            name={isFollowingUser ? 'my-location' : 'location-searching'}
            size={22}
            color={isFollowingUser ? Palette.slateMuted : Palette.horizonBlue}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  followButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: AlphaPalette.overlayWhite,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: Palette.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  followButtonPressed: { opacity: 0.85 },
});

export default memo(MapComponent);
