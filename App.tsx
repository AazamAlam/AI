import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 

const MapScreen = () => {
  // Initial region centered on NYC (placeholder)
  const initialRegion = {
    latitude: 40.730610,
    longitude: -73.935242,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        // Crucial line: Tells it to use Google Maps (which relies on your API key)
        provider={PROVIDER_GOOGLE} 
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      />
      {/* Input/Route Overlays will go here */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
});

export default MapScreen;
