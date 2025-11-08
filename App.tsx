import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'; 

const MapScreen = () => {
  // 1. ADD STATE for user input and route data
  const [startLocation, setStartLocation] = useState('NYU');
  const [endLocation, setEndLocation] = useState('Central Park');
  const [routes, setRoutes] = useState(null); 

  // Initial region centered on NYC (placeholder)
  const initialRegion = {
    latitude: 40.730610,
    longitude: -73.935242,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const handleSearch = () => {
    console.log(`Searching routes from: ${startLocation} to: ${endLocation}`);
    
    // --- Mocking the backend response for immediate UI testing ---
    const mockRoutes = [
        { id: 'A', score: 92, label: 'Most Accessible', color: 'green', coords: [] },
        { id: 'B', score: 78, label: 'Fastest', color: 'blue', coords: [] },
        { id: 'C', score: 85, label: 'Safest at Night', color: 'purple', coords: [] },
    ];
    setRoutes(mockRoutes);
    // -----------------------------------------------------------------
  };


  return (
    <SafeAreaView style={styles.container}>
      
      {/* 2. FLOATING INPUT/SEARCH PANEL (Overlay) */}
      <View style={styles.inputOverlay}>
        <TextInput 
          style={styles.input}
          placeholder="Start (e.g., NYU)"
          value={startLocation}
          onChangeText={setStartLocation}
        />
        <TextInput 
          style={styles.input}
          placeholder="Destination (e.g., Central Park)"
          value={endLocation}
          onChangeText={setEndLocation}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search Routes</Text>
        </TouchableOpacity>
      </View>

      {/* The MapView */}
      <MapView
        provider={PROVIDER_GOOGLE} 
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
      />
      
      {/* 3. Floating Route Selector (Will appear after search) */}
      {routes && (
        <View style={styles.routeSelectorContainer}>
          <Text style={styles.selectorTitle}>Select Your Route:</Text>
          {routes.map((route) => (
            <TouchableOpacity key={route.id} style={[styles.routeButton, { borderColor: route.color }]} onPress={() => { /* Start Navigation */ }}>
              <Text style={styles.routeText}>Route {route.id}: {route.label} - **{route.score}/100**</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
};

// 4. UPDATED STYLES
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 }, // Map should take up all available space
  inputOverlay: {
    position: 'absolute', 
    top: 20, 
    width: '90%',
    alignSelf: 'center',
    zIndex: 10,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF', // iOS Blue
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  routeSelectorContainer: {
    position: 'absolute',
    bottom: 30, // Adjust for iPhone bottom safe area
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  routeButton: {
    borderWidth: 2,
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  routeText: {
    fontWeight: '600',
  }
});

export default MapScreen;
