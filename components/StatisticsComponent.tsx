import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TOTAL_COUNTRIES = 195;

const StatisticsComponent = ({ visitedCountries }: { visitedCountries: string[] }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Visited Countries</Text>
      <Text style={styles.text}>Total Visited: {visitedCountries.length} / {TOTAL_COUNTRIES}</Text>
      <View style={styles.list}>
        {visitedCountries.map((countryCode, index) => (
          <Text key={index} style={styles.text}>{countryCode}</Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginTop: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  list: {
    marginTop: 10,
  },
});

export default StatisticsComponent;
