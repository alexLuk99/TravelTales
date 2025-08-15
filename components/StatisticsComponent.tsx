import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const TOTAL_COUNTRIES = 195;

type StatsProps = {
  visitedCountries: string[];
  wantToVisitCountries: string[];
};


const StatisticsComponent = ({ visitedCountries, wantToVisitCountries }: StatsProps) => {

  const visitedCount = visitedCountries.length;
  const percentVisited = ((visitedCount / TOTAL_COUNTRIES) * 100).toFixed(0);
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <Text style={styles.label}>Visited:</Text>
          {/* Visited / Total */}
          <Text style={styles.visitedNumber}>{visitedCount}</Text>
          <Text style={styles.totalText}>/ {TOTAL_COUNTRIES}</Text>
          {/* Prozent */}
          <Text style={styles.percentText}>({percentVisited}%)</Text>
          {/* Wishlist */}
          <Text style={[styles.wishlistText,]}>Wishlist: {wantToVisitCountries.length}</Text>
      </View>
      <TouchableOpacity style={styles.burgerButton} onPress={() => {/* dein Handler */}}>
            <Text style={styles.burgerIcon}>☰</Text>
      </TouchableOpacity>
    </View>
);
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'flex-end',
    position: 'relative',
    justifyContent: 'space-between',
    width: '100%',
    flexDirection: 'row',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.8)',
    marginBottom: 4,
    marginRight: 8
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitedNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3bb2d0'
  },
  totalText: {
    fontSize: 18,
    color: 'rgba(0,0,0,0.6)',
    marginHorizontal: 2
  },
  percentText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    marginRight: 16,
    marginTop: 6
  },
  wishlistText: {
    fontSize: 14,
    color: 'rgba(51,51,51,0.7)'
  },
  burgerButton: {
    position: 'relative',
  },
   burgerIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.7)',
   },
});

export default StatisticsComponent;
