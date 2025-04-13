
import { Stack } from 'expo-router';
import Map from '@/components/Map';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{  title: 'Home' }} />
      <Map/>
    </SafeAreaView>
  );
}
