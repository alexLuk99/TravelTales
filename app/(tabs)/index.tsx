import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Mapbox from '@rnmapbox/maps';
import { Stack } from 'expo-router';
import Map from '@/components/Map';

Mapbox.setAccessToken('pk.eyJ1IjoiYWxleGx1ayIsImEiOiJjbTNnMG1jbGkwMW01MmtzZmU5Z21nbW44In0.bjjCiA_ldA7KcQTK1qs1yg');

export default function HomeScreen() {
  return (
    <>
    <Stack.Screen options={{  title: 'Home' }} />
    <Map />
    </>
  );
}
