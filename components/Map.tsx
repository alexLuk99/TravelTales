import { Text, View } from "react-native";
import Mapbox, { MapView } from '@rnmapbox/maps';

Mapbox.setAccessToken('pk.eyJ1IjoiYWxleGx1ayIsImEiOiJjbTNnMG1jbGkwMW01MmtzZmU5Z21nbW44In0.bjjCiA_ldA7KcQTK1qs1yg');

export default function Map() {
    return (
        <MapView style={{flex: 1}}/>
    );
}