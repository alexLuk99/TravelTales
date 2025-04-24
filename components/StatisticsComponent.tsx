import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TOTAL_COUNTRIES = 195;


const StatisticsComponent = ({ visitedCountries }: { visitedCountries: string[] }) => {

  const visitedCount = visitedCountries.length;
  const percentVisited = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(0); // mit einer Nachkommastelle
  return (
    <View style={styles.container}>
    <Text style={styles.label}>Countries Visited:</Text>
    <Text style={styles.visitedText}>
      <Text style={styles.visitedNumber}>{visitedCountries.length}</Text>
      <Text style={styles.totalText}> / {TOTAL_COUNTRIES}</Text>
      <Text style={styles.percentText}> ({percentVisited}%)</Text>
    </Text>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,         // Reduziertes vertikales Padding
    paddingHorizontal: 16,       // Reduziertes horizontales Padding
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Einheitlicher Hintergrund wie im Modal (leicht weiß, halbtransparent)
    borderRadius: 8,            // Leicht abgerundete Ecken (ähnlich wie im Modal)
  },
  label: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.8)', // Für ein gehaltvolleres Theme, z.B. dunkler Text statt hell, je nach Gesamt-Theme
    marginRight: 10,            // Etwas mehr Abstand, damit der Text nicht zu nah an der Zahl ist
    fontWeight: 'bold',
  },
  visitedText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitedNumber: {
    fontSize: 26,               // Etwas kleinere Schrift, damit das Component kompakter wird
    fontWeight: 'bold',
    color: '#3bb2d0',           // Farbe passend zur Karte (z.B. Wasserblau)
  },
  totalText: {
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.6)', // Leicht abgeschwächter Text, der nicht vom Wesentlichen ablenkt
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'light',
    color: 'rgba(0, 0, 0, 0.6)',
    marginLeft: 4,
  },
});

export default StatisticsComponent;
