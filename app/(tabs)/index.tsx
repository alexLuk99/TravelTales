import { Image, StyleSheet, Platform } from 'react-native';
import { View } from 'react-native-reanimated/lib/typescript/Animated';
import Mapbox from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiYWxleGx1ayIsImEiOiJjbTNnMG1jbGkwMW01MmtzZmU5Z21nbW44In0.bjjCiA_ldA7KcQTK1qs1yg');


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: 300,
    width: 300,
  },
  map: {
    flex: 1
  }
});
